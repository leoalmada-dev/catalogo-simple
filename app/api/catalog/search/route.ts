export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/data/catalog';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const page = Number(searchParams.get('page') ?? '1') || 1;
  const perPage = Number(searchParams.get('perPage') ?? '12') || 12;

  const result = await searchProducts({ q, category, page, perPage });
  return NextResponse.json(result);
}
