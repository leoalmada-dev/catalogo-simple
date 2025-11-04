export const dynamic = 'force-dynamic';

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env';
import { createServerClient } from '@/lib/supabase/server';

const isProd =
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProd) return []; // Previews / Dev: sin sitemap

  const supabase = await createServerClient();
  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1, lastModified: new Date() },
  ];

  const { data } = await supabase
    .from('catalogo_v_products_public')
    .select('slug, updated_at');

  (data ?? []).forEach((row) => {
    routes.push({
      url: `${SITE_URL}/producto/${row.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
    });
  });

  return routes;
}
