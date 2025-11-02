// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env';
import { createServerClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerClient();

  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1, lastModified: new Date() }
  ];

  const { data, error } = await supabase
    .from('catalogo_v_products_public')
    .select('slug, updated_at');

  if (error) {
    console.warn('[sitemap] Supabase error:', error.message);
  } else {
    (data ?? []).forEach((row) => {
      routes.push({
        url: `${SITE_URL}/producto/${row.slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
        lastModified: row.updated_at ? new Date(row.updated_at) : undefined
      });
    });
  }

  return routes;
}
