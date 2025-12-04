export function sanitizePhone(raw: string): string {
    return (raw || '').replace(/\D+/g, '');
}

// Mensaje visible que verá el usuario al abrir WhatsApp
export function buildWaMessage(opts: {
    productName: string;
    productSlug: string;
    variantLabel?: string;
    siteUrl?: string;
}) {
    const parts: string[] = [];
    parts.push(`Hola! Me interesa *${opts.productName}*`);
    if (opts.variantLabel) parts.push(`Variante: ${opts.variantLabel}`);
    const baseUrl = (opts.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    const link = baseUrl ? `${baseUrl}/producto/${opts.productSlug}` : `/producto/${opts.productSlug}`;
    parts.push(`Link: ${link}`);
    parts.push('Origen: catalogo-simple');
    return parts.join('\n');
}

// URL de tracking: /w?pid=...&vid=...&src=...&pslug=...&pname=...&vlabel=...
export function buildWaTrackingUrl(args: {
    productId: string;
    productSlug: string;
    source: 'home' | 'category' | 'product' | string;
    variantId?: string;
    productName?: string;
    variantLabel?: string;
}) {
    const sp = new URLSearchParams();
    sp.set('pid', args.productId);
    if (args.variantId) sp.set('vid', args.variantId);
    sp.set('src', args.source);
    sp.set('pslug', args.productSlug);
    if (args.productName) sp.set('pname', args.productName);
    if (args.variantLabel) sp.set('vlabel', args.variantLabel);
    return `/w?${sp.toString()}`;
}
