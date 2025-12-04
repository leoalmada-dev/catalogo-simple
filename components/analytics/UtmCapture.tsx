'use client';

import { useEffect } from 'react';

export default function UtmCapture() {
    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const hasUtm = sp.has('utm_source') || sp.has('utm_medium') || sp.has('utm_campaign');
        const ref = document.referrer || undefined;
        if (!hasUtm && !ref) return;

        void fetch('/api/utm/persist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                utm_source: sp.get('utm_source') ?? undefined,
                utm_medium: sp.get('utm_medium') ?? undefined,
                utm_campaign: sp.get('utm_campaign') ?? undefined,
                ref,
            }),
        }).catch(() => { });
    }, []);

    return null;
}
