export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

type PatchBody = {
  alt?: string;
  is_primary?: boolean;
  position?: number;
  variant_id?: string | null;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; imageId: string }> }
) {
  const { supabase, error, status } = await requireEditorRole();
  if (!supabase) return NextResponse.json({ error }, { status });

  const { id, imageId } = await context.params;
  const productId = (id || '').trim();
  const imgId = (imageId || '').trim();

  if (!UUID_RE.test(productId) || !UUID_RE.test(imgId)) {
    return NextResponse.json(
      { error: 'invalid id', detail: { productId, imageId: imgId } },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as PatchBody;
  const { alt, is_primary, position, variant_id } = body;

  if (
    alt === undefined &&
    is_primary === undefined &&
    position === undefined &&
    variant_id === undefined
  ) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  }

  // Leer imagen y validar pertenencia al producto
  const { data: img, error: readErr } = await supabase
    .from('catalogo_images')
    .select('id, product_id, variant_id, is_primary')
    .eq('id', imgId)
    .maybeSingle();

  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
  if (!img || img.product_id !== productId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  // Validar variant_id si viene
  if (variant_id !== undefined && variant_id !== null && !UUID_RE.test(variant_id)) {
    return NextResponse.json({ error: 'invalid variant_id' }, { status: 400 });
  }

  // Si se marca como principal, desmarcar otras del mismo scope
  if (is_primary === true) {
    if (img.variant_id || variant_id) {
      const targetVariant = variant_id ?? img.variant_id;
      const { error: clearErr } = await supabase
        .from('catalogo_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
        .eq('variant_id', targetVariant)
        .neq('id', imgId);
      if (clearErr) return NextResponse.json({ error: clearErr.message }, { status: 500 });
    } else {
      const { error: clearErr } = await supabase
        .from('catalogo_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
        .is('variant_id', null)
        .neq('id', imgId);
      if (clearErr) return NextResponse.json({ error: clearErr.message }, { status: 500 });
    }
  }

  const updates: Partial<{
    alt: string | null;
    is_primary: boolean;
    position: number;
    variant_id: string | null;
  }> = {};

  if (alt !== undefined) updates.alt = alt;
  if (is_primary !== undefined) updates.is_primary = !!is_primary;
  if (typeof position === 'number') updates.position = Math.max(1, position);
  if (variant_id !== undefined) updates.variant_id = variant_id;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  }

  const { data: updated, error: updErr } = await supabase
    .from('catalogo_images')
    .update(updates)
    .eq('id', imgId)
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

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string; imageId: string }> }
) {
  const { supabase, error, status } = await requireEditorRole();
  if (!supabase) return NextResponse.json({ error }, { status });

  const { id, imageId } = await context.params;
  const productId = (id || '').trim();
  const imgId = (imageId || '').trim();

  if (!UUID_RE.test(productId) || !UUID_RE.test(imgId)) {
    return NextResponse.json(
      { error: 'invalid id', detail: { productId, imageId: imgId } },
      { status: 400 }
    );
  }

  const { data: img, error: readErr } = await supabase
    .from('catalogo_images')
    .select('id, path, product_id')
    .eq('id', imgId)
    .maybeSingle();

  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
  if (!img || img.product_id !== productId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const bucket = (process.env.STORAGE_BUCKET || 'products').trim();
  const rm = await supabase.storage.from(bucket).remove([String(img.path)]);
  if (rm.error) return NextResponse.json({ error: rm.error.message }, { status: 500 });

  const { error: delErr } = await supabase.from('catalogo_images').delete().eq('id', imgId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
