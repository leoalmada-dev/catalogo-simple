import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/data/catalog';

type Params = { params: { slug: string } };

export async function GET(_req: Request, { params }: Params) {
  const product = await getProductBySlug(params.slug);
  return NextResponse.json(product);
}
