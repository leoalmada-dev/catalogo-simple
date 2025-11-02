// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";

// Tipos mínimos para el store de cookies (evita depender de tipos internos de Next)
type Cookie = { name: string; value: string };
type CookieStore = {
  getAll(): Cookie[];
  set(name: string, value: string, options?: Record<string, unknown>): void;
};

export async function createServerClient() {
  // En Next 16, en algunos entornos cookies() puede ser async; mantenemos compat.
  const cookieStore = (await cookies()) as unknown as CookieStore;

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createSupabaseServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        // ⚠️ IMPORTANTE: setAll solo se puede usar en Server Actions o Route Handlers.
        // Si se invoca desde un Server Component, Next lanza error. Lo capturamos y seguimos.
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // No-op en Server Components (lectura funciona igual).
        }
      },
    },
  });
}
