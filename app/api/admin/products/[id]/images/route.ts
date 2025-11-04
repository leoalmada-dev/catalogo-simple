export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { STORAGE_BUCKET } from '@/lib/env';

type CtxMaybePromise =
  | { params: { id?: string } }
  | Promise<{ params: { id?: string } }>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

function cleanId(raw: unknown) {
  if (raw == null) return '';
  const s = decodeURIComponent(String(raw)).trim();
  if (s === '' || s === 'undefined' || s === 'null') return '';
  return s;
}

function extractProductId(req: Request, ctx: { params?: { id?: string } }) {
  // 1) intentar con params
  const fromParams = cleanId(ctx.params?.id);
  if (fromParams) return fromParams;

  // 2) fallback robusto: parsear del pathname
  const m = new URL(req.url).pathname.match(
    /\/api\/admin\/products\/([^/]+)\/images/i
  );
  const fromPath = cleanId(m?.[1]);
  return fromPath;
}

async function requireEditorRole() {
  const supabase = await createServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return { error: 'unauthorized', status: 401, supabase };

  // DEV bypass por email
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

export async function GET(req: Request, ctx: CtxMaybePromise) {
  const { supabase, error, status } = await requireEditorRole();
  if (!supabase) return NextResponse.json({ error }, { status });

  const c = await ctx;
  const productId = extractProductId(req, c);

  if (!UUID_RE.test(productId)) {
    return NextResponse.json(
      { error: 'invalid product id', detail: { productId } },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const rawVariant = searchParams.get('variant_id');
  const variantId =
    rawVariant && rawVariant !== 'undefined' && rawVariant !== 'null'
      ? cleanId(rawVariant)
      : '';

  if (variantId && !UUID_RE.test(variantId)) {
    return NextResponse.json({ error: 'invalid variant_id' }, { status: 400 });
  }

  let q = supabase
    .from('catalogo_images')
    .select('id, path, alt, is_primary, position, variant_id')
    .eq('product_id', productId)
    .order('is_primary', { ascending: false })
    .order('position', { ascending: true });

  if (variantId) q = q.eq('variant_id', variantId);

  const { data, error: dbErr } = await q;
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  const out = (data ?? []).map((row) => {
    const prefix = `${STORAGE_BUCKET}/`;
    const cleanPath = row.path?.startsWith(prefix) ? row.path.slice(prefix.length) : row.path;

    const { data: pub } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(cleanPath);

    return {
      id: row.id,
      path: row.path,                 // dejamos el valor crudo que guarda la DB
      alt: row.alt ?? '',
      is_primary: row.is_primary,
      position: row.position,
      variant_id: row.variant_id,
      url: pub.publicUrl,             // ← URL correcta (sin bucket duplicado)
      name: row.path.split('/').pop() || row.path,
    };
  });

  return NextResponse.json({ images: out });
}

export async function POST(req: Request, ctx: CtxMaybePromise) {
  try {
    const { supabase, error, status } = await requireEditorRole();
    if (!supabase) return NextResponse.json({ error }, { status });

    const c = await ctx;
    const productId = extractProductId(req, c);
    if (!UUID_RE.test(productId)) {
      return NextResponse.json({ error: 'invalid product id', detail: { productId } }, { status: 400 });
    }

    const form = await req.formData();
    const file = (form.get('file') || form.get('image')) as File | null;
    const alt = (form.get('alt') as string) || null;
    const isPrimary = (form.get('is_primary') as string) === 'true' || form.get('is_primary') === 'on';
    const position = Number(form.get('position') || '1');

    const rawVar = form.get('variant_id');
    const variantId =
      typeof rawVar === 'string' &&
      rawVar !== 'undefined' &&
      rawVar !== 'null' &&
      rawVar !== ''
        ? decodeURIComponent(rawVar.trim())
        : '';

    if (!file) return NextResponse.json({ error: 'missing file' }, { status: 400 });
    if (variantId && !UUID_RE.test(variantId)) {
      return NextResponse.json({ error: 'invalid variant_id' }, { status: 400 });
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: `unsupported content-type: ${file.type}` }, { status: 415 });
    }
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'file too large (max 8MB)' }, { status: 413 });
    }

    const bucket = (process.env.STORAGE_BUCKET || '').trim() || 'products';
    const ext = file.name.includes('.') ? `.${file.name.split('.').pop()!.toLowerCase()}` : '';
    const base = file.name.replace(/\.[^.]+$/, '');
    const safe = base.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9._-]/g, '').slice(0, 120);
    const ts = Date.now();
    const objectPath = variantId
      ? `${productId}/variants/${variantId}/${ts}-${safe}${ext}`
      : `${productId}/${ts}-${safe}${ext}`;

    const up = await supabase.storage.from(bucket).upload(objectPath, bytes, {
      contentType: file.type,
      upsert: false,
    });

    if (up.error) {
      const msg = up.error.message;
      const hint =
        msg.includes('The resource was not found')
          ? 'Bucket inexistente o mal nombre. Creá el bucket en Supabase Storage y colocalo en STORAGE_BUCKET.'
          : undefined;
      return NextResponse.json({ error: msg, hint }, { status: 500 });
    }

    if (isPrimary) {
      if (variantId) {
        await supabase.from('catalogo_images').update({ is_primary: false }).eq('product_id', productId).eq('variant_id', variantId);
      } else {
        await supabase.from('catalogo_images').update({ is_primary: false }).eq('product_id', productId).is('variant_id', null);
      }
    }

    const payload: any = {
      product_id: productId,
      path: objectPath, // SIN prefijo del bucket
      alt,
      is_primary: isPrimary,
      position: isNaN(position) ? 1 : Math.max(1, position),
      ...(variantId ? { variant_id: variantId } : {}),
    };

    const ins = await supabase.from('catalogo_images').insert(payload).select('*').single();
    if (ins.error) {
      // limpieza si la DB falla
      await supabase.storage.from(bucket).remove([objectPath]).catch(() => {});
      const msg = ins.error.message;
      const hint = msg.includes('row-level security') ? 'Revisá políticas RLS de catalogo_images para owner/editor.' : undefined;
      return NextResponse.json({ error: msg, hint }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return NextResponse.json(
      { ok: true, image: { ...ins.data, url: pub.publicUrl, name: objectPath.split('/').pop() } },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 });
  }
}
