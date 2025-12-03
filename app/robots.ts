// app/robots.ts
export const dynamic = 'force-dynamic';

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env';

const isProd =
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

export default function robots(): MetadataRoute.Robots {
  if (!isProd) {
    // Previews / Dev: bloquear todo
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      // sin sitemap en previews
    };
  }

  // Producción: permitir todo salvo /admin y exponer sitemap
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
