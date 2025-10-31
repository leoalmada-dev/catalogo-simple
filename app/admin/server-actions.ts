"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { T_PRODUCTS, T_VARIANTS, T_IMAGES } from "@/lib/db/tables";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { z } from "zod";
import { productSchema, type ProductFormData } from "@/lib/schemas/product";

// Helpers
const toCents = (n?: number | null) => n == null ? 0 : Math.round(n * 100);

// ===== LIST/GET =====
export async function listProducts() {
  await requireAdmin();
  const supabase = await createServerClient();

  // 1) Productos (lo que EXISTE en tu schema)
  const { data: products, error: pErr } = await supabase
    .from(T_PRODUCTS)
    .select("id, name, slug, status, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (pErr) throw pErr;

  const ids = (products ?? []).map((p: any) => p.id);
  const stats: Record<string, { min: number | null; total: number; available: number }> = {};

  // 2) Variantes → min price y contadores
  if (ids.length) {
    const { data: vars, error: vErr } = await supabase
      .from(T_VARIANTS)
      .select("product_id, price_cents, is_available")
      .in("product_id", ids);
    if (vErr) throw vErr;

    (vars ?? []).forEach((v: any) => {
      const s = (stats[v.product_id] ??= { min: null, total: 0, available: 0 });
      s.total += 1;
      if (v.is_available) {
        s.available += 1;
        s.min = s.min == null ? v.price_cents : Math.min(s.min, v.price_cents);
      }
    });
  }

  const rows = (products ?? []).map((p: any) => {
    const s = stats[p.id] ?? { min: null, total: 0, available: 0 };
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status,                  // 'draft' | 'published' | 'archived'
      visible: p.status === "published", // mapeo para UI
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

  const { data: p } = await supabase
    .from(T_PRODUCTS)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!p) return null;

  const { data: variants } = await supabase
    .from(T_VARIANTS)
    .select("sku, name, price_cents, is_available, stock, attributes")
    .eq("product_id", id)
    .order("created_at", { ascending: true });

  return {
    ...p,
    variants: (variants ?? []).map((v: any) => ({
      sku: v.sku,
      name: v.name,
      price: (v.price_cents ?? 0) / 100,
      is_available: v.is_available,
      stock: v.stock,
      attributes: v.attributes,
    })),
  };
}

// ===== CREATE/UPDATE/DELETE =====
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
    })
    .select("id")
    .single();
  if (error) throw error;

  if (parsed.variants?.length) {
    const rows = parsed.variants.map(v => ({
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

export async function updateProduct({ id, data }: { id: string; data: ProductFormData; }) {
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
    })
    .eq("id", id);
  if (error) throw error;

  await supabase.from(T_VARIANTS).delete().eq("product_id", id);
  if (parsed.variants?.length) {
    const rows = parsed.variants.map(v => ({
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
  await supabase.from(T_IMAGES).delete().eq("product_id", id).catch(()=>{});
  // variantes
  await supabase.from(T_VARIANTS).delete().eq("product_id", id).catch(()=>{});
  // producto
  const { error } = await supabase.from(T_PRODUCTS).delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
}

// ===== IMAGES (tabla + storage opcional)
export async function listImagesAction(productId: string) {
  await requireAdmin();
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from(T_IMAGES)
    .select("id, path, alt, is_primary, position")
    .eq("product_id", productId)
    .order("is_primary", { ascending: false })
    .order("position", { ascending: true });
  if (error) throw error;

  // Si tu path apunta a Storage (p.e. 'products/slug-1.jpg'), derivamos URL pública:
  const bucket = process.env.STORAGE_BUCKET || "products";
  return (data ?? []).map((i: any) => ({
    name: i.path.split("/").pop() ?? i.path,
    path: i.path,
    url: i.path.startsWith(`${bucket}/`)
      ? supabase.storage.from(bucket).getPublicUrl(i.path).data.publicUrl
      : i.path, // por si guardaste URL absoluta
  }));
}

export async function deleteImageAction(imageIdOrPath: string) {
  await requireAdmin();
  const supabase = await createServerClient();

  // si te llega ID, borramos por id; si es path, por path
  if (imageIdOrPath.includes("-")) {
    await supabase.from(T_IMAGES).delete().eq("id", imageIdOrPath).catch(()=>{});
  } else {
    await supabase.from(T_IMAGES).delete().eq("path", imageIdOrPath).catch(()=>{});
  }
}

// ===== CSV v2 alineado al esquema =====
// Columnas: name,slug,description,status,variant_sku,variant_name,variant_price,variant_available,variant_stock
const csvRowV2 = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.enum(["draft","published","archived"]).default("draft"),
  variant_sku: z.string().optional().nullable(),
  variant_name: z.string().optional().nullable(),
  variant_price: z.string().optional().nullable(), // decimal en texto
  variant_available: z.string().optional().nullable(),
  variant_stock: z.string().optional().nullable(),
});

export async function exportCSVv2() {
  await requireAdmin();
  const supabase = await createServerClient();

  const { data: products } = await supabase.from(T_PRODUCTS).select("*");
  const { data: variants } = await supabase.from(T_VARIANTS)
    .select("product_id, sku, name, price_cents, is_available, stock");

  const byProduct = new Map<string, any[]>();
  (variants ?? []).forEach(v => {
    if (!byProduct.has(v.product_id)) byProduct.set(v.product_id, []);
    byProduct.get(v.product_id)!.push(v);
  });

  const rows: any[] = [];
  (products ?? []).forEach((p: any) => {
    const vs = byProduct.get(p.id) ?? [];
    if (!vs.length) {
      rows.push({
        name: p.name, slug: p.slug, description: p.description, status: p.status,
        variant_sku: "", variant_name: "", variant_price: "", variant_available: "", variant_stock: ""
      });
    } else {
      vs.forEach(v => rows.push({
        name: p.name, slug: p.slug, description: p.description, status: p.status,
        variant_sku: v.sku, variant_name: v.name ?? "",
        variant_price: (v.price_cents/100).toFixed(2),
        variant_available: v.is_available ? "true" : "false",
        variant_stock: v.stock ?? 0,
      }));
    }
  });

  return stringify(rows, { header: true });
}

export async function importCSVv2(form: FormData) {
  await requireAdmin();
  const file = form.get("file") as File | null;
  if (!file) return { ok: 0, fail: 0 };
  const text = await file.text();
  const rows: any[] = parse(text, { columns: true, skip_empty_lines: true });
  let ok = 0, fail = 0; const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      const r = csvRowV2.parse(rows[i]);

      const supabase = await createServerClient();

      // 1) UPSERT del producto por slug (puede NO devolver fila si no hubo cambios)
      const { data: prodMaybe, error: upsertErr } = await supabase
        .from(T_PRODUCTS)
        .upsert({
          slug: r.slug,
          name: r.name,
          description: r.description ?? null,
          status: r.status,
        }, { onConflict: "slug" })
        .select("id")
        .maybeSingle();

      if (upsertErr) throw upsertErr;

      // 2) Si no volvió la fila (producto ya existía y no cambió), la buscamos por slug
      let productId: string | null = prodMaybe?.id ?? null;
      if (!productId) {
        const { data: prodBySlug, error: selErr } = await supabase
          .from(T_PRODUCTS)
          .select("id")
          .eq("slug", r.slug)
          .maybeSingle();
        if (selErr) throw selErr;
        if (!prodBySlug) throw new Error(`Producto con slug "${r.slug}" no encontrado tras upsert`);
        productId = prodBySlug.id;
      }

      // 3) Si la fila tiene variante, upsert por SKU
      if (r.variant_sku) {
        const price = r.variant_price ? Number(String(r.variant_price).replace(",", ".")) : 0;
        const available = (r.variant_available ?? "").toLowerCase();
        const is_available = ["1","true","sí","si","yes"].includes(available);

        const { error: vErr } = await supabase
          .from(T_VARIANTS)
          .upsert({
            product_id: productId,
            sku: r.variant_sku!,
            name: r.variant_name ?? null,
            price_cents: Math.round((price || 0) * 100),
            is_available,
            stock: r.variant_stock ? Number(r.variant_stock) : 0,
          }, { onConflict: "sku" });
        if (vErr) throw vErr;
      }

      ok++;
    } catch (e: any) {
      fail++; errors.push(`Fila ${i+1}: ${e.message}`);
    }
  }
  return { ok, fail, errors };
}

export async function setProductStatus(opts: { id: string; status: "draft" | "published" | "archived" }) {
  await requireAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from(T_PRODUCTS)
    .update({ status: opts.status })
    .eq("id", opts.id);
  if (error) throw error;
  revalidatePath("/admin");
}

