export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { UTM_COOKIE_NAME, parseUtmCookie } from '@/lib/utm';
import { sanitizePhone, buildWaMessage } from '@/lib/whatsapp';
import { WHATSAPP_PHONE, SITE_URL } from '@/lib/env';

export async function GET(req: NextRequest) {
    // 1) Params
    const url = new URL(req.url);
    const pid = url.searchParams.get('pid') || undefined;
    const vid = url.searchParams.get('vid') || undefined;
    const src = url.searchParams.get('src') || undefined;
    const productSlug = url.searchParams.get('pslug') || '';
    const productName = url.searchParams.get('pname') || '';
    const variantLabel = url.searchParams.get('vlabel') || '';

    // 2) UTM cookie
    const utm = parseUtmCookie(req.cookies.get(UTM_COOKIE_NAME)?.value);

    // 3) Privacidad mínima opcional
    const ip = req.headers.get('x-forwarded-for') || '';
    const salt = process.env.UTM_IP_SALT || '';
    const ip_hash = ip && salt ? await sha256(`${ip}${salt}`) : null;
    const ua = req.headers.get('user-agent') || null;

    // 4) Insert evento (service role)
    try {
        const supa = createAdminClient();
        await supa.from('catalogo_events').insert({
            event: 'cta_whatsapp_click',
            product_id: pid ?? null,
            variant_id: vid ?? null,
            src: src ?? null,
            utm_source: utm?.utm_source ?? null,
            utm_medium: utm?.utm_medium ?? null,
            utm_campaign: utm?.utm_campaign ?? null,
            ref: utm?.ref ?? null,
            ip_hash: ip_hash,
            ua,
        });
    } catch {
        // no romper el flujo si el log falla
    }

    // 5) Redirigir a wa.me con mensaje
    const phone = sanitizePhone(WHATSAPP_PHONE || '');
    if (!phone) {
        // fallback: redirigimos al producto si no hay teléfono
        const fallback = productSlug ? `${SITE_URL}/producto/${productSlug}` : `${SITE_URL}/`;
        return NextResponse.redirect(fallback, { status: 302 });
    }

    const msg = buildWaMessage({
        productName: productName || 'Producto',
        productSlug: productSlug || '',
        variantLabel: variantLabel || undefined,
        siteUrl: SITE_URL,
    });

    const wa = new URL(`https://wa.me/${phone}`);
    wa.searchParams.set('text', msg);
    return NextResponse.redirect(wa.toString(), { status: 302 });
}

async function sha256(input: string) {
    const enc = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
