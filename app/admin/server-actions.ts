"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { T_PRODUCTS, T_VARIANTS, T_IMAGES } from "@/lib/db/tables";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { z } from "zod";
import { productSchema, type ProductFormData } from "@/lib/schemas/product";

/* =========================
   Tipos mínimos de DB (lint-safe)
   ========================= */
type ProductDB = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at?: string | null;
  sort_order?: number | null;
};

type VariantDB = {
  product_id: string;
  sku?: string;
  name?: string | null;
  price_cents: number | null;
  is_available: boolean | null;
  stock?: number | null;
  attributes?: Record<string, unknown> | null;
  created_at?: string;
};

type ImageDB = {
  id: string;
  product_id: string;
  path: string;
  alt?: string | null;
  is_primary?: boolean | null;
  position?: number | null;
};

/* =========================
   Helpers
   ========================= */
const toCents = (n?: number | null) => (n == null ? 0 : Math.round(n * 100));

/* =========================
   LIST / GET
   ========================= */
export async function listProducts() {
  await requireAdmin();
  const supabase = await createServerClient();

  const { data: products } = (await supabase
    .from(T_PRODUCTS)
    .select("id, name, slug, status, created_at, updated_at")
    .order("created_at", { ascending: false })) as unknown as { data: ProductDB[] };

  const ids = (products ?? []).map((p) => p.id);
  const stats: Record<string, { min: number | null; total: number; available: number }> = {};

  if (ids.length) {
    const { data: vars } = (await supabase
      .from(T_VARIANTS)
      .select("product_id, price_cents, is_available")
      .in("product_id", ids)) as unknown as {
        data: Pick<VariantDB, "product_id" | "price_cents" | "is_available">[];
      };

    (vars ?? []).forEach((v) => {
      const s = (stats[v.product_id] ??= { min: null, total: 0, available: 0 });
      s.total += 1;
      if (v.is_available) {
        s.available += 1;
        const price = v.price_cents ?? null;
        s.min = s.min == null ? price : price == null ? s.min : Math.min(s.min, price);
      }
    });
  }

  const rows = (products ?? []).map((p) => {
    const s = stats[p.id] ?? { min: null, total: 0, available: 0 };
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status,
      visible: p.status === "published",
      min_price: s.min != null ? (s.min / 100).toFixed(2) : null,
      variants_total: s.total,
      variants_available: s.available,
      updated_at: p.updated_at ?? p.created_at,
    };
  });

  return { rows };
}

export async function getProductById(id: string) {
  await requireAdmin();
  const supabase = await createServerClient();

  const { data: p } = (await supabase
    .from(T_PRODUCTS)
    .select("*")
    .eq("id", id)
    .maybeSingle()) as unknown as { data: ProductDB | null };

  if (!p) return null;

  const { data: variants } = (await supabase
    .from(T_VARIANTS)
    .select("sku, name, price_cents, is_available, stock, attributes")
    .eq("product_id", id)
    .order("created_at", { ascending: true })) as unknown as {
      data: VariantDB[] | null;
    };

  return {
    ...p,
    variants: (variants ?? []).map((v) => ({
      sku: v.sku ?? "",
      name: v.name ?? null,
      price: (v.price_cents ?? 0) / 100,
      is_available: !!v.is_available,
      stock: v.stock ?? 0,
      attributes: v.attributes ?? {},
    })),
  };
}

/* =========================
   CREATE / UPDATE / DELETE
   ========================= */
export async function createProduct(data: ProductFormData) {
  await requireAdmin();
  const supabase = await createServerClient();
  const parsed = productSchema.parse(data);

  const { data: inserted, error } = await supabase
    .from(T_PRODUCTS)
    .insert({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description ?? null,
      status: parsed.status,
      // sort_order: parsed.sort_order ?? 100, // si usás sort_order opcional
    })
    .select("id")
    .single();

  if (error) throw error;

  if (parsed.variants?.length) {
    const rows = parsed.variants.map((v) => ({
      product_id: inserted.id,
      sku: v.sku,
      name: v.name ?? null,
      price_cents: toCents(v.price),
      is_available: v.is_available ?? true,
      stock: v.stock ?? 0,
      attributes: v.attributes ?? {},
    }));
    const { error: vErr } = await supabase.from(T_VARIANTS).insert(rows);
    if (vErr) throw vErr;
  }

  revalidatePath("/admin");
}

export async function updateProduct({ id, data }: { id: string; data: ProductFormData }) {
  await requireAdmin();
  const supabase = await createServerClient();
  const parsed = productSchema.parse(data);

  const { error } = await supabase
    .from(T_PRODUCTS)
    .update({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description ?? null,
      status: parsed.status,
      // sort_order: parsed.sort_order ?? 100,
    })
    .eq("id", id);
  if (error) throw error;

  await supabase.from(T_VARIANTS).delete().eq("product_id", id);
  if (parsed.variants?.length) {
    const rows = parsed.variants.map((v) => ({
      product_id: id,
      sku: v.sku,
      name: v.name ?? null,
      price_cents: toCents(v.price),
      is_available: v.is_available ?? true,
      stock: v.stock ?? 0,
      attributes: v.attributes ?? {},
    }));
    const { error: vErr } = await supabase.from(T_VARIANTS).insert(rows);
    if (vErr) throw vErr;
  }

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = await createServerClient();

  // borrar imágenes asociadas (tabla)
  try { await supabase.from(T_IMAGES).delete().eq("product_id", id); } catch { /* noop */ }
  // variantes
  try { await supabase.from(T_VARIANTS).delete().eq("product_id", id); } catch { /* noop */ }
  const { error } = await supabase.from(T_PRODUCTS).delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
}

/* =========================
   ESTADO (toggle)
   ========================= */
export async function setProductStatus(opts: { id: string; status: "draft" | "published" | "archived" }) {
  await requireAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase.from(T_PRODUCTS).update({ status: opts.status }).eq("id", opts.id);
  if (error) throw error;
  revalidatePath("/admin");
}

/* =========================
   IMÁGENES (tabla + storage)
   ========================= */
export async function uploadImageAction(productId: string, form: FormData) {
  await requireAdmin();
  const file = form.get("file") as File | null;
  if (!file) throw new Error("Falta archivo");
  const supabase = await createServerClient();

  const bucket = process.env.STORAGE_BUCKET || "products";
  const key = `${productId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

  // 1) subir a Storage
  const up = await supabase.storage.from(bucket).upload(key, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (up.error) throw up.error;

  // 2) es primaria si no hay imágenes previas
  const { count } = await supabase
    .from(T_IMAGES)
    .select("*", { head: true, count: "exact" })
    .eq("product_id", productId);

  const is_primary = (count ?? 0) === 0;

  // 3) insertar fila en la tabla
  const path = `${bucket}/${key}`;
  const { error: insErr } = await supabase.from(T_IMAGES).insert({
    product_id: productId,
    path,
    alt: file.name,
    is_primary,
    position: (count ?? 0) + 1,
  });
  if (insErr) throw insErr;

  revalidatePath(`/admin/products/${productId}/images`);
}

export async function listImagesAction(productId: string) {
  await requireAdmin();
  const supabase = await createServerClient();
  const bucket = process.env.STORAGE_BUCKET || "products";

  const { data, error } = (await supabase
    .from(T_IMAGES)
    .select("id, path, alt, is_primary, position")
    .eq("product_id", productId)
    .order("is_primary", { ascending: false })
    .order("position", { ascending: true })) as unknown as {
      data: ImageDB[] | null;
      error: unknown;
    };
  if (error) throw error;

  return (data ?? []).map((i) => {
    const objectPath = i.path.startsWith(`${bucket}/`) ? i.path.slice(bucket.length + 1) : i.path;
    const url = supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
    const name = i.alt ?? objectPath.split("/").pop() ?? objectPath;
    return { id: i.id, name, path: i.path, url };
  });
}

export async function deleteImageAction(imageIdOrPath: string) {
  await requireAdmin();
  const supabase = await createServerClient();
  const bucket = process.env.STORAGE_BUCKET || "products";

  // buscar fila por id o por path
  const byId = await supabase
    .from(T_IMAGES)
    .select("id, path, product_id")
    .eq("id", imageIdOrPath)
    .maybeSingle();
  const row =
    byId.data ??
    (await supabase
      .from(T_IMAGES)
      .select("id, path, product_id")
      .eq("path", imageIdOrPath)
      .maybeSingle()).data;

  if (!row) return;

  // borrar en Storage
  const objectPath = row.path.startsWith(`${bucket}/`) ? row.path.slice(bucket.length + 1) : row.path;
  try { await supabase.storage.from(bucket).remove([objectPath]); } catch { /* noop */ }

  // borrar de la tabla
  try { await supabase.from(T_IMAGES).delete().eq("id", row.id); } catch { /* noop */ }

  revalidatePath(`/admin/products/${row.product_id}/images`);
}

/* =========================
   CSV v2 (export / import)
   ========================= */
const csvRowV2 = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  variant_sku: z.string().optional().nullable(),
  variant_name: z.string().optional().nullable(),
  variant_price: z.string().optional().nullable(), // decimal
  variant_available: z.string().optional().nullable(),
  variant_stock: z.string().optional().nullable(),
});

export async function exportCSVv2() {
  await requireAdmin();
  const supabase = await createServerClient();

  const { data: products } = (await supabase.from(T_PRODUCTS).select("*")) as unknown as {
    data: ProductDB[];
  };
  const { data: variants } = (await supabase
    .from(T_VARIANTS)
    .select("product_id, sku, name, price_cents, is_available, stock")) as unknown as {
      data: VariantDB[];
    };

  const byProduct = new Map<string, VariantDB[]>();
  (variants ?? []).forEach((v) => {
    if (!byProduct.has(v.product_id)) byProduct.set(v.product_id, []);
    byProduct.get(v.product_id)!.push(v);
  });

  const rows: Array<Record<string, string | number | boolean | null>> = [];
  (products ?? []).forEach((p) => {
    const vs = byProduct.get(p.id) ?? [];
    if (!vs.length) {
      rows.push({
        name: p.name,
        slug: p.slug,
        description: p.description ?? "",
        status: p.status,
        variant_sku: "",
        variant_name: "",
        variant_price: "",
        variant_available: "",
        variant_stock: "",
      });
    } else {
      vs.forEach((v) =>
        rows.push({
          name: p.name,
          slug: p.slug,
          description: p.description ?? "",
          status: p.status,
          variant_sku: v.sku ?? "",
          variant_name: v.name ?? "",
          variant_price: ((v.price_cents ?? 0) / 100).toFixed(2),
          variant_available: !!v.is_available,
          variant_stock: v.stock ?? 0,
        }),
      );
    }
  });

  return stringify(rows, { header: true });
}

export async function importCSVv2(form: FormData) {
  await requireAdmin();
  const file = form.get("file") as File | null;
  if (!file) return { ok: 0, fail: 0, errors: [] as string[] };

  const text = await file.text();
  const rows: unknown[] = parse(text, { columns: true, skip_empty_lines: true });
  let ok = 0,
    fail = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      const r = csvRowV2.parse(rows[i]);
      const supabase = await createServerClient();

      // Producto por slug (upsert puede no devolver fila si no hubo cambios)
      const { data: prodMaybe, error: upsertErr } = (await supabase
        .from(T_PRODUCTS)
        .upsert(
          {
            slug: r.slug,
            name: r.name,
            description: r.description ?? null,
            status: r.status,
          },
          { onConflict: "slug" },
        )
        .select("id")
        .maybeSingle()) as unknown as { data: { id: string } | null; error: unknown };

      if (upsertErr) throw upsertErr;

      let productId: string | null = prodMaybe?.id ?? null;
      if (!productId) {
        const { data: prodBySlug, error: selErr } = (await supabase
          .from(T_PRODUCTS)
          .select("id")
          .eq("slug", r.slug)
          .maybeSingle()) as unknown as { data: { id: string } | null; error: unknown };
        if (selErr) throw selErr;
        if (!prodBySlug) throw new Error(`Producto con slug "${r.slug}" no encontrado tras upsert`);
        productId = prodBySlug.id;
      }

      if (r.variant_sku) {
        const price = r.variant_price ? Number(String(r.variant_price).replace(",", ".")) : 0;
        const available = (r.variant_available ?? "").toLowerCase();
        const is_available = ["1", "true", "sí", "si", "yes"].includes(available);

        const { error: vErr } = (await supabase
          .from(T_VARIANTS)
          .upsert(
            {
              product_id: productId,
              sku: r.variant_sku!,
              name: r.variant_name ?? null,
              price_cents: Math.round((price || 0) * 100),
              is_available,
              stock: r.variant_stock ? Number(r.variant_stock) : 0,
            },
            { onConflict: "sku" },
          )) as unknown as { error: unknown };
        if (vErr) throw vErr;
      }

      ok++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      fail++;
      errors.push(`Fila ${i + 1}: ${msg}`);
    }
  }

  return { ok, fail, errors };
}
