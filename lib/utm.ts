// lib/utm.ts
export type Utm = {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    ref?: string;
    ts?: number; // epoch ms del set
};

export function captureUtmFromSearchParams(
    sp: URLSearchParams,
    ref?: string,
): Utm | null {
    const u: Utm = {
        utm_source: sp.get("utm_source") || undefined,
        utm_medium: sp.get("utm_medium") || undefined,
        utm_campaign: sp.get("utm_campaign") || undefined,
        ref: ref || undefined,
        ts: Date.now(),
    };
    const hasAny = u.utm_source || u.utm_medium || u.utm_campaign || u.ref;
    return hasAny ? u : null;
}

export function parseUtmCookie(raw: string | undefined): Utm | null {
    if (!raw) return null;
    try {
        const obj = JSON.parse(raw) as Utm;
        return obj ?? null;
    } catch {
        return null;
    }
}

export const UTM_COOKIE_NAME = "utm";
export const UTM_TTL_DAYS = 7;
