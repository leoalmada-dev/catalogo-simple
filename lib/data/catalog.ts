// lib/data/catalog.ts
import { createServerClient } from '@/lib/supabase/server';

export type ProductPublic = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string | null;
    effective_show_prices: boolean | null;
    min_price_cents: number | null;
    min_price_visible: number | null; // viene como numeric -> number
    primary_image: string | null;     // path de Storage
};

export type Category = { slug: string; name: string; id: string };

export type SearchParams = {
    q?: string;
    category?: string; // slug o 'all'
    page?: number;
    perPage?: number;
    orderBy?: 'created_at' | 'name' | 'min_price_visible';
    order?: 'asc' | 'desc';
};

// helpers internos
function normalizeOrder(order?: 'asc' | 'desc') {
    return order === 'asc' ? true : false;
}

export async function getCategories(): Promise<Category[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('catalogo_categories')
        .select('id, name, slug')
        .order('name', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Category[];
}

export async function searchProducts({
    q,
    category,
    page = 1,
    perPage = 12,
    orderBy = 'created_at',
    order = 'desc'
}: SearchParams): Promise<{ items: ProductPublic[]; total: number }> {
    const supabase = await createServerClient();

    let query = supabase
        .from('catalogo_v_products_public')
        .select('*', { count: 'exact' });

    if (q && q.trim()) {
        // Normalizamos el patrón para PostgREST: usar asteriscos (*) en ilike
        const s = q.trim().replace(/[%*]/g, ''); // evita romper el querystring
        query = query.or(`name.ilike.*${s}*,description.ilike.*${s}*`);
    }

    if (category && category !== 'all') {
        const slug = category.toLowerCase().trim();
        const supabase = await createServerClient();

        const { data: cat, error: catErr } = await supabase
            .from('catalogo_categories')
            .select('id,slug')
            .eq('slug', slug)
            .maybeSingle();

        if (catErr) throw catErr;
        if (!cat) return { items: [], total: 0 };

        const { data: pivots, error: pivErr } = await supabase
            .from('catalogo_product_categories')
            .select('product_id')
            .eq('category_id', cat.id);
        if (pivErr) throw pivErr;

        const ids = (pivots ?? []).map((r) => r.product_id);
        if (ids.length === 0) return { items: [], total: 0 };

        query = query.in('id', ids);
    }

    query = query
        .order(orderBy, { ascending: order === 'asc' })
        .range((page - 1) * perPage, page * perPage - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return { items: (data ?? []) as ProductPublic[], total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<ProductPublic> {
    const supabase = await createServerClient();

    const { data: viewData, error: viewErr } = await supabase
        .from('catalogo_v_products_public')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    if (viewErr) throw viewErr;
    if (viewData) return viewData as ProductPublic;

    // (fallback sólo para diagnóstico si la vista no lo trae)
    const { data: base, error: baseErr } = await supabase
        .from('catalogo_products')
        .select('id, slug, status')
        .eq('slug', slug)
        .maybeSingle();

    if (baseErr) throw baseErr;

    const err: any = new Error('NOT_FOUND');
    err.code = 'NOT_FOUND';
    err.meta = base ? { exists: true, status: base.status } : { exists: false };
    throw err;
}

export async function getProductImages(productId: string) {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('catalogo_images')
        .select('path, alt, is_primary, position')
        .eq('product_id', productId)
        .order('is_primary', { ascending: false })
        .order('position', { ascending: true });

    if (error) throw error;
    return data ?? [];
}

// ─── Tipos de variantes/config ────────────────────────────────────────────────
export type VariantPublic = {
  id: string;
  sku: string;
  name: string | null;
  price_cents: number;
  is_available: boolean;
  stock: number;
  attributes: Record<string, unknown>;
};

export type CatalogConfig = {
  show_prices: boolean;
  currency_code: string; // 'UYU' por defecto en tu schema
  whatsapp: string | null;
};

// ─── Variantes visibles (elegibles) por producto ─────────────────────────────
export async function getProductVariants(productId: string): Promise<VariantPublic[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('catalogo_variants')
    .select('id, sku, name, price_cents, is_available, stock, attributes')
    .eq('product_id', productId)
    .eq('is_available', true)
    .order('price_cents', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as VariantPublic[];
}

// ─── Config global (currency, etc) ────────────────────────────────────────────
export async function getCatalogConfig(): Promise<CatalogConfig> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('catalogo_config')
    .select('show_prices, currency_code, whatsapp')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return (data ?? { show_prices: true, currency_code: 'UYU', whatsapp: null }) as CatalogConfig;
}
