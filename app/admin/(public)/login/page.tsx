// app/admin/(public)/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 horas

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPending(true);

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Cookie para limitar la sesión admin a ~12 horas
      document.cookie = `admin_last_login=${Date.now()}; Max-Age=${ADMIN_SESSION_TTL_SECONDS}; Path=/; SameSite=Lax`;

      router.push("/admin");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error inesperado al iniciar sesión";
      setErrorMsg(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto mt-24 mb-20 max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">Acceder al panel</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600" role="alert" aria-live="polite">
            {errorMsg}
          </p>
        )}

        <div className="flex items-center justify-end">
          <Link
            href="/admin/reset-request"
            className="rounded-sm text-sm underline underline-offset-4 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Ingresando…" : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
