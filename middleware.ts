// middleware.ts
import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { proxy } from "./proxy";

export async function middleware(req: NextRequest) {
    const res = proxy(req);

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
    const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
    if (!supabaseUrl || !supabaseAnonKey) return res;

    try {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        res.cookies.set(name, value, options);
                    });
                },
            },
        });

        // Sincronia sesión/cookies. Si el refresh es inválido, no rompemos la request.
        await supabase.auth.getUser();
    } catch {
        // no-op
    }

    return res;
}

export const config = {
    matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml|api/health).*)"],
};
