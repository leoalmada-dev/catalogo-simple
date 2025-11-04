export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

function ok(v: unknown) { return Boolean(v && String(v).trim()); }

export async function GET() {
  const supabase = await createServerClient();

  // ENV
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = (process.env.STORAGE_BUCKET || '').trim() || 'products';

  // AUTH
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user || null;

  // Intentar subir y borrar un archivo mínimo (prueba permisos Storage)
  const testPath = `__health__/ping-${Date.now()}.txt`;
  const bytes = new TextEncoder().encode('ok');
  const up = await supabase.storage.from(bucket).upload(testPath, bytes, {
    contentType: 'text/plain',
    upsert: true,
  });

  let rmErr: string | null = null;
  if (!up.error) {
    const rm = await supabase.storage.from(bucket).remove([testPath]);
    rmErr = rm.error?.message || null;
  }

  // Probar que tengas perfil owner|editor (DB RLS para catalogo_images)
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('catalogo_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  return NextResponse.json({
    env: { url: ok(url), anon: ok(anon), bucket },
    auth: { loggedIn: !!user, email: user?.email ?? null },
    storage: {
      uploadOk: !up.error,
      uploadError: up.error?.message || null,
      removeError: rmErr,
    },
    db: { role, rlsReady: role === 'owner' || role === 'editor' },
    hints: {
      bucketMissing: 'si uploadError contiene "The resource was not found", creá el bucket en Supabase Storage con nombre exacto',
      rlsPolicy: 'si insert falla con "violates row-level security", revisá políticas de catalogo_images y storage.objects',
    },
  });
}
