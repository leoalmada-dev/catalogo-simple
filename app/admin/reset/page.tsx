// app/admin/reset/page.tsx
"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetConfirmSchema } from "@/lib/validation/auth";

type HashParams = {
    access_token?: string;
    refresh_token?: string;
    expires_in?: string;
    token_type?: string;
    type?: string;
};

function parseHashParams(hash: string): HashParams {
    const raw = hash.startsWith("#") ? hash.slice(1) : hash;
    const params = new URLSearchParams(raw);
    return {
        access_token: params.get("access_token") ?? undefined,
        refresh_token: params.get("refresh_token") ?? undefined,
        expires_in: params.get("expires_in") ?? undefined,
        token_type: params.get("token_type") ?? undefined,
        type: params.get("type") ?? undefined,
    };
}

export default function AdminResetPage() {
    const router = useRouter();

    const passwordId = useId();
    const confirmId = useId();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [pending, setPending] = useState(false);
    const [validating, setValidating] = useState(true);
    const [status, setStatus] = useState<{
        type: "idle" | "success" | "error" | "info";
        message: string;
    }>({ type: "info", message: "Validando enlace…" });

    const liveRegionRef = useRef<HTMLParagraphElement | null>(null);

    const focusStatus = () => {
        requestAnimationFrame(() => {
            liveRegionRef.current?.focus();
        });
    };

    // 1) Al cargar: consumir token del hash (#access_token=...) y guardar sesión con setSession().
    useEffect(() => {
        const run = async () => {
            try {
                const supabase = createBrowserClient();

                // Si viene hash con access_token/refresh_token, lo usamos para setear la sesión.
                const hash = typeof window !== "undefined" ? window.location.hash : "";
                const { access_token, refresh_token, type } = parseHashParams(hash);

                if (access_token && refresh_token && type === "recovery") {
                    const { error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    });

                    if (error) {
                        console.error("[reset] setSession error:", error);
                        setStatus({
                            type: "error",
                            message:
                                "Este enlace no es válido o venció. Volvé a solicitar el restablecimiento.",
                        });
                        toast.error("Enlace inválido o vencido.");
                        setValidating(false);
                        focusStatus();
                        return;
                    }

                    // Limpieza: sacar el hash de la URL (evita compartir tokens accidentalmente)
                    window.history.replaceState(
                        window.history.state,
                        "",
                        window.location.pathname + window.location.search
                    );
                }

                // Verificar que efectivamente hay usuario
                const { data: userData, error: userErr } = await supabase.auth.getUser();

                if (userErr || !userData?.user) {
                    setStatus({
                        type: "error",
                        message:
                            "Este enlace no es válido o venció. Volvé a solicitar el restablecimiento.",
                    });
                    toast.error("Enlace inválido o vencido.");
                    setValidating(false);
                    focusStatus();
                    return;
                }

                setStatus({ type: "idle", message: "" });
                setValidating(false);
            } catch (e) {
                console.error("[reset] unexpected:", e);
                setStatus({
                    type: "error",
                    message:
                        "No pudimos validar el enlace. Volvé a solicitar el restablecimiento.",
                });
                toast.error("No pudimos validar el enlace.");
                setValidating(false);
                focusStatus();
            }
        };

        void run();
    }, []);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus({ type: "idle", message: "" });

        const parsed = resetConfirmSchema.safeParse({ password, confirmPassword });
        if (!parsed.success) {
            const message =
                parsed.error.issues[0]?.message ?? "Revisá los datos ingresados.";
            setStatus({ type: "error", message });
            toast.error(message);
            focusStatus();
            return;
        }

        setPending(true);
        try {
            const supabase = createBrowserClient();

            const { data: userData, error: userErr } = await supabase.auth.getUser();
            if (userErr || !userData?.user) {
                const message =
                    "Este enlace no es válido o venció. Volvé a solicitar el restablecimiento.";
                setStatus({ type: "error", message });
                toast.error("Enlace inválido o vencido.");
                focusStatus();
                return;
            }

            const { error } = await supabase.auth.updateUser({
                password: parsed.data.password,
            });

            if (error) {
                console.error("[reset] updateUser error:", error);
                const message =
                    "No se pudo actualizar la contraseña. Intentá de nuevo.";
                setStatus({ type: "error", message });
                toast.error(message);
                focusStatus();
                return;
            }

            setStatus({
                type: "success",
                message: "Contraseña actualizada. Ya podés iniciar sesión.",
            });
            toast.success("Contraseña actualizada.");

            setTimeout(() => {
                router.replace("/admin/(public)/login");
            }, 900);
        } catch (e) {
            console.error("[reset] unexpected submit:", e);
            const message = "Error inesperado. Intentá de nuevo.";
            setStatus({ type: "error", message });
            toast.error(message);
            focusStatus();
        } finally {
            setPending(false);
        }
    };

    const isError = status.type === "error";
    const isSuccess = status.type === "success";
    const isInfo = status.type === "info";

    const disableForm = pending || validating || isInfo;

    return (
        <div className="mx-auto mt-24 mb-20 max-w-sm">
            <h1 className="mb-2 text-xl font-semibold">Definir nueva contraseña</h1>
            <p className="mb-6 text-sm text-muted-foreground">
                Elegí una contraseña nueva para tu cuenta de administración.
            </p>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div className="space-y-1">
                    <Label htmlFor={passwordId}>Nueva contraseña</Label>
                    <Input
                        id={passwordId}
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={disableForm}
                    />
                    <p className="text-xs text-muted-foreground">Mínimo 10 caracteres.</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor={confirmId}>Repetir contraseña</Label>
                    <Input
                        id={confirmId}
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={disableForm}
                    />
                </div>

                {(isError || isSuccess || isInfo) && (
                    <p
                        ref={liveRegionRef}
                        tabIndex={-1}
                        className={[
                            "rounded-md border px-3 py-2 text-sm outline-none",
                            isError
                                ? "border-red-200 text-red-700"
                                : isSuccess
                                    ? "border-emerald-200 text-emerald-700"
                                    : "border-border text-foreground",
                        ].join(" ")}
                        role={isError ? "alert" : "status"}
                        aria-live="polite"
                    >
                        {status.message}
                    </p>
                )}

                <Button type="submit" className="w-full" disabled={disableForm}>
                    {validating ? "Validando…" : pending ? "Guardando…" : "Guardar nueva contraseña"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                    <Link
                        href="/admin/(public)/reset-request"
                        className="rounded-sm underline underline-offset-4 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        Volver a pedir el enlace
                    </Link>

                    <Link
                        href="/admin/(public)/login"
                        className="rounded-sm underline underline-offset-4 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        Ir al login
                    </Link>
                </div>
            </form>
        </div>
    );
}
