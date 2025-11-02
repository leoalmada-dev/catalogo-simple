import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get('category') ?? '').toLowerCase().trim();
  const q = (searchParams.get('q') ?? '').trim();

  const sb = await createServerClient();

  const cat = category && category !== 'all'
    ? await sb.from('catalogo_categories').select('id,slug').eq('slug', category).maybeSingle()
    : { data: null, error: null };

  const piv = cat && cat.data
    ? await sb.from('catalogo_product_categories').select('product_id').eq('category_id', cat.data.id)
    : { data: null, error: null };

  const ids = (piv.data ?? []).map((r: any) => r.product_id);

  let qry = sb.from('catalogo_v_products_public').select('id,slug,name', { count: 'exact' });
  if (q) qry = qry.or(`name.ilike.*${q.replace(/[%*]/g, '')}*,description.ilike.*${q.replace(/[%*]/g, '')}*`);
  if (ids.length) qry = qry.in('id', ids);

  const res = await qry.limit(5);

  return NextResponse.json({ cat, pivCount: (piv.data ?? []).length, ids, preview: res.data, count: res.count });
}
