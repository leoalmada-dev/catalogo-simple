// app/admin/reset/page.tsx
"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetConfirmSchema } from "@/lib/validation/auth";

export default function AdminResetPage() {
    const router = useRouter();

    const passwordId = useId();
    const confirmId = useId();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [pending, setPending] = useState(false);
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

            const { data, error: userErr } = await supabase.auth.getUser();
            if (userErr || !data?.user) {
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
        } catch {
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
                    />
                </div>

                {(isError || isSuccess) && (
                    <p
                        ref={liveRegionRef}
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

                <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? "Guardando…" : "Guardar nueva contraseña"}
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
