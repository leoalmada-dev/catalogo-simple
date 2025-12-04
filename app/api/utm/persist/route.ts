export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { UTM_COOKIE_NAME, UTM_TTL_DAYS, parseUtmCookie, Utm } from '@/lib/utm';

export async function POST(req: NextRequest) {
    // Si ya existe cookie valida, no sobreescribimos
    const existing = req.cookies.get(UTM_COOKIE_NAME)?.value;
    if (existing) {
        const u = parseUtmCookie(existing);
        if (u?.ts && (Date.now() - u.ts) < UTM_TTL_DAYS * 24 * 60 * 60 * 1000) {
            return NextResponse.json({ ok: true, reason: 'already-set' });
        }
    }

    const body = (await req.json().catch(() => ({}))) as Utm | Record<string, unknown>;
    const u: Utm = {
        utm_source: typeof body.utm_source === 'string' ? body.utm_source : undefined,
        utm_medium: typeof body.utm_medium === 'string' ? body.utm_medium : undefined,
        utm_campaign: typeof body.utm_campaign === 'string' ? body.utm_campaign : undefined,
        ref: typeof body.ref === 'string' ? body.ref : undefined,
        ts: Date.now(),
    };

    const hasAny = u.utm_source || u.utm_medium || u.utm_campaign || u.ref;
    const res = NextResponse.json({ ok: true, set: hasAny ? u : null });

    if (hasAny) {
        const expires = new Date(Date.now() + UTM_TTL_DAYS * 86400 * 1000);
        res.cookies.set({
            name: UTM_COOKIE_NAME,
            value: JSON.stringify(u),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires,
        });
    }

    return res;
}
