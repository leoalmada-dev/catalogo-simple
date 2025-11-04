export function normalizeObjectPath(path: string) {
  const bucket = process.env.STORAGE_BUCKET || 'products';
  const prefix = `${bucket}/`;
  return path?.startsWith(prefix) ? path.slice(prefix.length) : path;
}

// Consideramos "válido" el path si tiene al menos una subcarpeta (productId/…)
function isLikelyValidPath(path: string) {
  if (!path) return false;
  const clean = normalizeObjectPath(path);
  // Requiere al menos un slash: productId/archivo
  return clean.includes('/') && /\.[a-z0-9]+$/i.test(clean);
}

/** Convierte path relativo del bucket -> URL pública de Supabase; null si no es válido */
export function toPublicStorageUrl(path?: string | null) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const bucket = process.env.STORAGE_BUCKET || 'products';
  if (!isLikelyValidPath(path)) return null; // 👈 clave para evitar 400
  const clean = normalizeObjectPath(path);
  return `${base}/storage/v1/object/public/${bucket}/${clean}`;
}
