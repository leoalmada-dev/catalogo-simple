// lib/images.ts
import { SUPABASE_URL, STORAGE_BUCKET } from '@/lib/env';

export function toPublicStorageUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // ya viene absoluto

  const clean = String(path).replace(/^\/+/, '');
  const objectPath = clean.startsWith(`${STORAGE_BUCKET}/`)
    ? clean
    : `${STORAGE_BUCKET}/${clean}`;

  try {
    const base = new URL(SUPABASE_URL);
    return `${base.origin}/storage/v1/object/public/${objectPath}`;
  } catch {
    return null;
  }
}
