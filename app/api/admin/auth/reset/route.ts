// app/api/admin/auth/reset/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resetRequestSchema } from "@/lib/validation/auth";

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
            return NextResponse.json(
                { ok: false, message: "Falta configurar NEXT_PUBLIC_SITE_URL." },
                { status: 500 }
            );
        }

        const redirectTo = `${siteUrl.replace(/\/$/, "")}/admin/reset`;

        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
            parsed.data.email,
            { redirectTo }
        );

        if (error) {
            // Evitamos filtrar detalle sensible; mensaje genérico.
            return NextResponse.json(
                { ok: false, message: "No se pudo enviar el email de restablecimiento. Intentá de nuevo." },
                { status: 400 }
            );
        }

        return NextResponse.json({
            ok: true,
            message: "Si el email existe, te vamos a enviar un enlace para restablecer la contraseña.",
        });
    } catch {
        return NextResponse.json(
            { ok: false, message: "Error inesperado. Intentá de nuevo." },
            { status: 500 }
        );
    }
}
