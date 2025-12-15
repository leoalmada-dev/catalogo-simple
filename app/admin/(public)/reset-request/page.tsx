// app/admin/(public)/reset-request/page.tsx
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailSchema } from "@/lib/validation/auth";

type ApiResponse = { ok: boolean; message: string; retryAfterSeconds?: number };

function clampInt(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, Math.trunc(n)));
}

export default function ResetRequestPage() {
    const emailId = useId();
    const hintId = useId();
    const liveId = useId();

    const [email, setEmail] = useState("");
    const [pending, setPending] = useState(false);

    const [cooldown, setCooldown] = useState(0);

    const [status, setStatus] = useState<{
        type: "idle" | "success" | "error";
        message: string;
    }>({ type: "idle", message: "" });

    const liveRegionRef = useRef<HTMLParagraphElement | null>(null);

    const focusStatus = () => {
        requestAnimationFrame(() => {
            liveRegionRef.current?.focus();
        });
    };

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = window.setInterval(() => {
            setCooldown((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => window.clearInterval(t);
    }, [cooldown]);

    const startCooldown = (seconds: number) => {
        setCooldown(clampInt(seconds, 5, 60));
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus({ type: "idle", message: "" });

        const parsed = emailSchema.safeParse(email);
        if (!parsed.success) {
            const message = parsed.error.issues[0]?.message ?? "Ingresá un email válido.";
            setStatus({ type: "error", message });
            toast.error(message);
            focusStatus();
            return;
        }

        setPending(true);
        try {
            const res = await fetch("/api/admin/auth/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: parsed.data }),
            });

            const data = (await res.json().catch(() => null)) as ApiResponse | null;

            if (!res.ok || !data?.ok) {
                // UX: si nos informan retryAfterSeconds lo usamos; sino, aplicamos 20s por defecto
                const retry = data?.retryAfterSeconds ?? 20;
                startCooldown(retry);

                const message =
                    data?.message ??
                    "No se pudo enviar el email. Esperá unos segundos e intentá de nuevo.";
                setStatus({ type: "error", message });
                toast.error(message);
                focusStatus();
                return;
            }

            // Para evitar spam: también cooldown tras éxito (por si hacen click varias veces)
            startCooldown(20);

            setStatus({ type: "success", message: data.message });
            toast.success("Listo. Revisá tu correo.");
            focusStatus();
        } catch {
            startCooldown(20);
            const message = "Error inesperado. Esperá unos segundos e intentá de nuevo.";
            setStatus({ type: "error", message });
            toast.error(message);
            focusStatus();
        } finally {
            setPending(false);
        }
    };

    const isError = status.type === "error";
    const isSuccess = status.type === "success";

    const disabled = pending || cooldown > 0;

    const buttonText = pending
        ? "Enviando…"
        : cooldown > 0
            ? `Reintentar en ${cooldown}s…`
            : "Enviar enlace";

    return (
        <div className="mx-auto mt-24 mb-20 max-w-sm">
            <h1 className="mb-2 text-xl font-semibold">Restablecer contraseña</h1>
            <p className="mb-6 text-sm text-muted-foreground">
                Ingresá tu email y te enviaremos un enlace para definir una nueva contraseña.
            </p>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div className="space-y-1">
                    <Label htmlFor={emailId}>Email</Label>
                    <Input
                        id={emailId}
                        type="email"
                        inputMode="email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-describedby={hintId}
                        required
                        disabled={disabled}
                    />
                    <p id={hintId} className="text-xs text-muted-foreground">
                        Si no llega en unos minutos, revisá spam/promociones.
                    </p>
                </div>

                {(isError || isSuccess) && (
                    <p
                        ref={liveRegionRef}
                        id={liveId}
                        tabIndex={-1}
                        className={[
                            "rounded-md border px-3 py-2 text-sm outline-none",
                            isError
                                ? "border-red-200 text-red-700"
                                : "border-emerald-200 text-emerald-700",
                        ].join(" ")}
                        role={isError ? "alert" : "status"}
                        aria-live="polite"
                    >
                        {status.message}
                    </p>
                )}

                <Button type="submit" className="w-full" disabled={disabled}>
                    {buttonText}
                </Button>

                <div className="flex items-center justify-between text-sm">
                    <Link
                        href="/admin/login"
                        className="rounded-sm underline underline-offset-4 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        Volver a iniciar sesión
                    </Link>
                </div>
            </form>
        </div>
    );
}
