import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'missing slug' }, { status: 400 });

  const sb = await createServerClient();

  const view = await sb
    .from('catalogo_v_products_public')
    .select('id,slug,name,updated_at')
    .eq('slug', slug)
    .maybeSingle();

  const base = await sb
    .from('catalogo_products')
    .select('id,slug,status,updated_at')
    .eq('slug', slug)
    .maybeSingle();

  return NextResponse.json({ view, base });
}
