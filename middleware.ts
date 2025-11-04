import { NextRequest, NextResponse } from 'next/server';

const isProd =
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Previews / Dev: bloquear indexación globalmente
  if (!isProd) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    return res;
  }

  // Producción: reforzar noindex en /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  return res;
}

export const config = {
  // Evitar tocar assets estáticos ni health checks
  matcher: ['/((?!_next/|favicon.ico|robots.txt|sitemap.xml|api/health).*)'],
};
