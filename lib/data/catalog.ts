// lib/data/catalog.ts
import { createServerClient } from '@/lib/supabase/server';

// ---- Tipos públicos (según view y tablas) ----
export type ProductPublic = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    effective_show_prices: boolean;
    min_price_visible: number | null;
    primary_image: string | null;
    created_at: string;
    updated_at: string;
};

export type ImageRow = {
    id: string;
    path: string;
    alt: string | null;
    is_primary: boolean;
    position: number;
    variant_id: string | null;
};

export type VariantRow = {
    id: string;
    product_id: string;
    sku: string;
    name: string | null;
    price_cents: number;
    is_available: boolean;
    stock: number;
    attributes: Record<string, unknown>;
};

export type CatalogConfig = {
    id: number;
    show_prices: boolean;
    currency_code: string;
    whatsapp: string | null;
    updated_at: string;
};

export type CategoryLite = { slug: string; name: string };

// tipo liviano para sitemap
export type ProductSlugInfo = {
    slug: string;
    updated_at: string | null;
};

// ---- Error tipado para not found ----
export class NotFoundError extends Error {
    readonly code = 'NOT_FOUND' as const;
    constructor(message = 'NOT_FOUND') {
        super(message);
        this.name = 'NotFoundError';
    }
}
export function isNotFound(e: unknown): e is NotFoundError {
    return e instanceof NotFoundError || (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'NOT_FOUND');
}

// ---- Funciones base ----
export async function getProductBySlug(slug: string): Promise<ProductPublic> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('catalogo_v_products_public')
        .select(
            'id, slug, name, description, effective_show_prices, min_price_visible, primary_image, created_at, updated_at'
        )
        .eq('slug', slug)
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundError();
    return data as ProductPublic;
}

export async function getProductImages(productId: string): Promise<ImageRow[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('catalogo_images')
        .select('id, path, alt, is_primary, position, variant_id')
        .eq('product_id', productId)
        .order('is_primary', { ascending: false })
        .order('position', { ascending: true });

    if (error) throw error;
    return (data ?? []) as ImageRow[];
}

export async function getProductVariants(productId: string): Promise<VariantRow[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('catalogo_variants')
        .select('id, product_id, sku, name, price_cents, is_available, stock, attributes')
        .eq('product_id', productId)
        .order('price_cents', { ascending: true })
        .order('name', { ascending: true });

    if (error) throw error;
    return (data ?? []) as VariantRow[];
}

export async function getCatalogConfig(): Promise<CatalogConfig> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('catalogo_config')
        .select('id, show_prices, currency_code, whatsapp, updated_at')
        .eq('id', 1)
        .maybeSingle();

    if (error) throw error;
    if (!data) {
        return {
            id: 1,
            show_prices: true,
            currency_code: 'UYU',
            whatsapp: null,
            updated_at: new Date().toISOString(),
        };
    }
    return data as CatalogConfig;
}

export async function getVariantPrimaryImageMap(variantIds: string[]) {
    if (!variantIds.length) return {} as Record<string, string>;
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('catalogo_images')
        .select('variant_id, path, is_primary, position')
        .in('variant_id', variantIds)
        .order('is_primary', { ascending: false })
        .order('position', { ascending: true });

    if (error) throw error;
    const map: Record<string, string> = {};
    for (const r of data ?? []) {
        const v = (r as { variant_id: string | null }).variant_id;
        if (v && !map[v]) {
            map[v] = (r as { path: string }).path;
        }
    }
    return map;
}

// ---- NUEVOS: categorías + búsqueda paginada ----
export async function getCategories(): Promise<CategoryLite[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('catalogo_categories')
        .select('slug, name')
        .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []) as CategoryLite[];
}

export type SearchArgs = {
    q?: string;
    category?: string; // slug o 'all'
    page?: number;     // 1-based
    perPage?: number;  // default 12
};
export type SearchResult = {
    items: ProductPublic[];
    total: number;
    page: number;
    perPage: number;
};

export async function searchProducts(args: SearchArgs): Promise<SearchResult> {
    const q = (args.q ?? '').trim();
    const category = (args.category ?? 'all').trim();
    const perPage = Math.max(1, Math.min(args.perPage ?? 12, 60));
    const page = Math.max(1, Math.floor(args.page ?? 1));
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const supabase = await createServerClient();

    // Si hay categoría, resolver IDs de productos mediante pivote
    let productIdsFilter: string[] | null = null;
    if (category && category !== 'all') {
        const { data: cat } = await supabase
            .from('catalogo_categories')
            .select('id')
            .eq('slug', category)
            .maybeSingle();

        if (!cat) {
            return { items: [], total: 0, page, perPage };
        }
        const { data: piv } = await supabase
            .from('catalogo_product_categories')
            .select('product_id')
            .eq('category_id', cat.id);

        productIdsFilter = (piv ?? []).map((r) => r.product_id as string);
        if (productIdsFilter.length === 0) {
            return { items: [], total: 0, page, perPage };
        }
    }

    // Query a la vista pública
    let sel = supabase
        .from('catalogo_v_products_public')
        .select(
            'id, slug, name, description, effective_show_prices, min_price_visible, primary_image, created_at, updated_at',
            { count: 'exact' }
        )
        .order('created_at', { ascending: false });

    if (q.length >= 2) {
        sel = sel.ilike('name', `%${q}%`);
    }
    if (productIdsFilter) {
        sel = sel.in('id', productIdsFilter);
    }

    sel = sel.range(from, to);

    const { data, error, count } = await sel;
    if (error) throw error;

    return {
        items: (data ?? []) as ProductPublic[],
        total: count ?? 0,
        page,
        perPage,
    };
}

// ---- helper para sitemap ----
export async function getAllProductsSlugs(): Promise<ProductSlugInfo[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('catalogo_v_products_public')
        .select('slug, updated_at')
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as ProductSlugInfo[];
}
