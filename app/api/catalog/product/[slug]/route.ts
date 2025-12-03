export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/data/catalog';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  try {
    const p = await getProductBySlug(slug);
    return NextResponse.json(p);
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err?.code === 'NOT_FOUND') {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json({ error: err?.message || 'internal error' }, { status: 500 });
  }
}
