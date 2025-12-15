// app/api/admin/auth/reset/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resetRequestSchema } from "@/lib/validation/auth";

type SbErr = { name?: string; status?: number; message?: string; code?: string };

function extractRetryAfterSeconds(message?: string): number | null {
    if (!message) return null;
    const m = message.match(/after\s+(\d+)\s+seconds/i);
    if (!m) return null;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const parsed = resetRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." },
                { status: 400 }
            );
        }

        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
        if (!siteUrl) {
            console.error("[auth/reset] Missing NEXT_PUBLIC_SITE_URL");
            return NextResponse.json(
                { ok: false, message: "Falta configurar NEXT_PUBLIC_SITE_URL." },
                { status: 500 }
            );
        }

        const redirectTo = `${siteUrl.replace(/\/$/, "")}/admin/reset`;

        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(parsed.data.email, {
            redirectTo,
        });

        if (error) {
            const e = error as SbErr;

            console.error("[auth/reset] redirectTo=", redirectTo);
            console.error("[auth/reset] supabase error:", {
                name: e.name,
                status: e.status,
                message: e.message,
                code: e.code,
            });

            const isRateLimit =
                e.status === 429 || e.code === "over_email_send_rate_limit";

            if (isRateLimit) {
                const seconds = extractRetryAfterSeconds(e.message) ?? 20;
                return NextResponse.json(
                    {
                        ok: false,
                        retryAfterSeconds: seconds,
                        message: `Por seguridad, esperá ${seconds}s y volvé a intentar.`,
                    },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { ok: false, message: "No se pudo enviar el email de restablecimiento. Intentá de nuevo." },
                { status: 400 }
            );
        }

        return NextResponse.json({
            ok: true,
            message: "Si el email existe, te vamos a enviar un enlace para restablecer la contraseña.",
        });
    } catch (e) {
        console.error("[auth/reset] unexpected:", e);
        return NextResponse.json(
            { ok: false, message: "Error inesperado. Intentá de nuevo." },
            { status: 500 }
        );
    }
}
