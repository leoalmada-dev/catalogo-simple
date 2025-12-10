// app/admin/(public)/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <div>
          <Input
            type="email"
            placeholder="Email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={pending}
        >
          {pending ? "Ingresando…" : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
