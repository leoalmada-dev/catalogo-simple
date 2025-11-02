// lib/env.ts
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const SUPABASE_URL =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();

export const STORAGE_BUCKET =
  (process.env.STORAGE_BUCKET ?? 'products').trim();

export const WHATSAPP_PHONE =
  (process.env.WHATSAPP_PHONE ?? '').trim();

if (!SUPABASE_URL) {
  // Ayuda a detectar envs faltantes temprano
  console.warn('[env] Falta NEXT_PUBLIC_SUPABASE_URL');
}
