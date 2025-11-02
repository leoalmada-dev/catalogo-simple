import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/data/catalog';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');
  const perPage = Number(searchParams.get('perPage') ?? '12');
  const orderBy = (searchParams.get('orderBy') ?? 'created_at') as
    | 'created_at' | 'name' | 'min_price_visible';
  const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc';

  const res = await searchProducts({ q, category, page, perPage, orderBy, order });
  return NextResponse.json(res);
}
