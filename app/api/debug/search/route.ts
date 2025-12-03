export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

type Preview = { id: string; slug: string; name: string };

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const categorySlug = (url.searchParams.get('category') || '').trim();

  const out: Record<string, unknown> = {};

  if (categorySlug) {
    const catRes = await supabase
      .from('catalogo_categories')
      .select('id, slug, name')
      .eq('slug', categorySlug)
      .maybeSingle();

    out.cat = catRes;

    const catId = catRes.data?.id;
    if (catId) {
      const piv = await supabase
        .from('catalogo_product_categories')
        .select('product_id')
        .eq('category_id', catId);

      const ids = (piv.data ?? []).map((r) => r.product_id as string);
      out.pivCount = ids.length;
      out.ids = ids;

      if (ids.length > 0) {
        const prev = await supabase
          .from('catalogo_products')
          .select('id, slug, name')
          .in('id', ids.slice(0, 5));

        out.preview = (prev.data ?? []) as Preview[];
        out.count = (prev.data ?? []).length;
      }
    }
  }

  if (q) {
    const search = await supabase
      .from('catalogo_products')
      .select('id, slug, name')
      .ilike('name', `%${q}%`)
      .limit(5);

    out.search = search.data ?? [];
  }

  return NextResponse.json(out);
}
