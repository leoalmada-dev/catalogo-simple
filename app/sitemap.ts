// app/sitemap.ts
export const dynamic = 'force-dynamic';

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env';
import { getAllProductsSlugs } from '@/lib/data/catalog';

const isProd =
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProd) return []; // Previews / Dev: sin sitemap real

  const base = SITE_URL.replace(/\/$/, '');

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date(),
    },
  ];

  const products = await getAllProductsSlugs();

  for (const row of products) {
    routes.push({
      url: `${base}/producto/${row.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
    });
  }

  return routes;
}
