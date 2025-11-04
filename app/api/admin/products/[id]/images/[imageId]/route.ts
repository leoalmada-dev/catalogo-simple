// app/api/admin/products/[id]/images/[imageId]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

type CtxMaybePromise =
  | { params: { id?: string; imageId?: string } }
  | Promise<{ params: { id?: string; imageId?: string } }>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanId(raw: unknown) {
  if (raw == null) return '';
  const s = decodeURIComponent(String(raw)).trim();
  if (s === '' || s === 'undefined' || s === 'null') return '';
  return s;
}

function extractIds(req: Request, ctx: { params?: { id?: string; imageId?: string } }) {
  // 1) intentar con params
  const productId = cleanId(ctx.params?.id);
  const imageId = cleanId(ctx.params?.imageId);
  if (productId && imageId) return { productId, imageId };

  // 2) fallback desde el pathname
  const m = new URL(req.url).pathname.match(
    /\/api\/admin\/products\/([^/]+)\/images\/([^/]+)\/?$/
  );
  return { productId: cleanId(m?.[1]), imageId: cleanId(m?.[2]) };
}

async function requireEditorRole() {
  const supabase = await createServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return { error: 'unauthorized', status: 401, supabase };

  // Bypass DEV por email (ADMIN_EMAILS)
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const email = (user.email || '').toLowerCase();
  if (email && adminEmails.includes(email)) return { supabase, role: 'owner' as const };

  const { data: profile } = await supabase
    .from('catalogo_profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile || !['owner', 'editor'].includes(profile.role)) {
    return { error: 'forbidden', status: 403, supabase };
  }
  return { supabase, role: profile.role as 'owner' | 'editor' };
}

export async function PATCH(req: Request, ctx: CtxMaybePromise) {
  const { supabase, error, status } = await requireEditorRole();
  if (!supabase) return NextResponse.json({ error }, { status });

  const c = await ctx;
  const { productId, imageId } = extractIds(req, c);
  if (!UUID_RE.test(productId) || !UUID_RE.test(imageId)) {
    return NextResponse.json({ error: 'invalid id', detail: { productId, imageId } }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { alt, is_primary, position } = body as {
    alt?: string;
    is_primary?: boolean;
    position?: number;
  };

  if (alt === undefined && is_primary === undefined && position === undefined) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  }

  // Leer imagen y validar pertenencia al producto
  const { data: img, error: readErr } = await supabase
    .from('catalogo_images')
    .select('id, product_id, variant_id, is_primary')
    .eq('id', imageId)
    .maybeSingle();

  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
  if (!img || img.product_id !== productId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  // Si se marca como principal, desmarcar otras del mismo scope
  if (is_primary === true) {
    if (img.variant_id) {
      const { error: clearErr } = await supabase
        .from('catalogo_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
        .eq('variant_id', img.variant_id)
        .neq('id', imageId);
      if (clearErr) return NextResponse.json({ error: clearErr.message }, { status: 500 });
    } else {
      const { error: clearErr } = await supabase
        .from('catalogo_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
        .is('variant_id', null)
        .neq('id', imageId);
      if (clearErr) return NextResponse.json({ error: clearErr.message }, { status: 500 });
    }
  }

  const updates: Record<string, any> = {};
  if (alt !== undefined) updates.alt = alt;
  if (is_primary !== undefined) updates.is_primary = !!is_primary;
  if (typeof position === 'number') updates.position = Math.max(1, position);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  }

  const { data: updated, error: updErr } = await supabase
    .from('catalogo_images')
    .update(updates)
    .eq('id', imageId)
    .select('*')
    .maybeSingle();

  if (updErr) {
    const hint = updErr.message.includes('row-level security')
      ? 'Revisá RLS de catalogo_images (owner/editor).'
      : undefined;
    return NextResponse.json({ error: updErr.message, hint }, { status: 500 });
  }

  return NextResponse.json({ ok: true, image: updated });
}

export async function DELETE(req: Request, ctx: CtxMaybePromise) {
  const { supabase, error, status } = await requireEditorRole();
  if (!supabase) return NextResponse.json({ error }, { status });

  const c = await ctx;
  const { productId, imageId } = extractIds(req, c);
  if (!UUID_RE.test(productId) || !UUID_RE.test(imageId)) {
    return NextResponse.json({ error: 'invalid id', detail: { productId, imageId } }, { status: 400 });
  }

  const { data: img, error: readErr } = await supabase
    .from('catalogo_images')
    .select('id, path, product_id')
    .eq('id', imageId)
    .maybeSingle();

  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
  if (!img || img.product_id !== productId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const bucket = (process.env.STORAGE_BUCKET || '').trim() || 'products';
  const rm = await supabase.storage.from(bucket).remove([img.path]);
  if (rm.error) return NextResponse.json({ error: rm.error.message }, { status: 500 });

  const { error: delErr } = await supabase.from('catalogo_images').delete().eq('id', imageId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
