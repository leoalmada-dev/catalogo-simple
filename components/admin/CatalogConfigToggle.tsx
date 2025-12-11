// components/admin/CatalogConfigToggle.tsx
"use client";

import { useOptimistic, useTransition } from "react";
import { updateCatalogConfigShowPrices } from "@/app/admin/server-actions";
import { toast } from "sonner";

type CatalogConfigToggleProps = {
    initialShowPrices: boolean;
    lastUpdatedLabel: string | null;
};

export default function CatalogConfigToggle({
    initialShowPrices,
    lastUpdatedLabel,
}: CatalogConfigToggleProps) {
    const [isPending, startTransition] = useTransition();

    // Estado optimista SIEMPRE controlado (sin undefined → nada de warnings)
    const [optimisticValue, setOptimisticValue] = useOptimistic<boolean>(
        initialShowPrices,
    );

    const handleToggle = () => {
        const previous = optimisticValue;
        const next = !previous;

        startTransition(async () => {
            // React 19: el update optimista debe ir *dentro* del transition/action
            setOptimisticValue(next);

            try {
                await updateCatalogConfigShowPrices(next);
                toast.success(
                    next
                        ? "Los precios del catálogo están visibles."
                        : "Los precios del catálogo están ocultos.",
                );
            } catch (error: unknown) {
                // rollback
                setOptimisticValue(previous);

                const msg =
                    error instanceof Error
                        ? error.message
                        : "No se pudo actualizar la configuración global.";
                toast.error(msg);
            }
        });
    };

    return (
        <section
            className="rounded-xl border bg-white px-4 py-3 text-sm shadow-xs"
            aria-label="Configuración global del catálogo"
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="font-medium text-neutral-900">
                        Mostrar precios en el catálogo
                    </p>
                    <p className="text-xs text-neutral-600 max-w-xl">
                        Este interruptor afecta a todo el sitio. Cada producto puede
                        sobrescribir este valor con su propia configuración
                        <span className="hidden sm:inline">
                            {" "}
                            (override por producto).
                        </span>
                    </p>

                    {lastUpdatedLabel && (
                        <p className="text-[11px] text-neutral-500">
                            Última actualización: {lastUpdatedLabel}
                        </p>
                    )}
                </div>

                {/* Toggle accesible */}
                <div className="mt-2 flex items-center gap-3 sm:mt-0">
                    <span className="text-xs text-neutral-600">
                        Estado actual:{" "}
                        <span className="font-medium text-neutral-900">
                            {optimisticValue ? "Mostrando precios" : "Ocultando precios"}
                        </span>
                    </span>

                    <button
                        type="button"
                        onClick={handleToggle}
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-300 transition data-[checked=true]:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60"
                        role="switch"
                        aria-checked={optimisticValue}
                        aria-label="Alternar visibilidad global de precios en el catálogo"
                        disabled={isPending}
                        data-checked={optimisticValue ? "true" : "false"}
                    >
                        <span
                            className="pointer-events-none inline-block h-5 w-5 translate-x-0 rounded-full bg-white shadow transition-transform data-[checked=true]:translate-x-5"
                            data-checked={optimisticValue ? "true" : "false"}
                        />
                    </button>
                </div>
            </div>

            {/* Mensaje de actividad sin mover el layout */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="mt-1 min-h-[1rem] text-[11px] text-neutral-500"
            >
                {isPending && "Guardando cambios…"}
            </div>
        </section>
    );
}
