// components/admin/AdminUserBar.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function AdminUserBar({ email }: { email: string | null }) {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const handleLogout = () => {
        startTransition(async () => {
            try {
                const supabase = createBrowserClient();
                await supabase.auth.signOut();
            } catch {
                // si falla el signOut remoto, igual seguimos
            }

            // limpiar cookie de sesión admin (TTL)
            document.cookie =
                "admin_last_login=; Max-Age=0; path=/; SameSite=Lax";

            router.push("/admin/login");
        });
    };

    return (
        <div className="flex items-center gap-3 text-xs text-neutral-600">
            {email && (
                <span
                    className="max-w-[200px] truncate"
                    title={email}
                >
                    {email}
                </span>
            )}
            <button
                type="button"
                onClick={handleLogout}
                disabled={pending}
                className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
                Cerrar sesión
            </button>
        </div>
    );
}
