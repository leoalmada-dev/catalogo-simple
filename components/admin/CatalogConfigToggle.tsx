// components/admin/CatalogConfigToggle.tsx
"use client";

import { useState, useTransition } from "react";
import { updateCatalogConfigShowPrices } from "@/app/admin/server-actions";
import { toast } from "sonner";

type CatalogConfigToggleProps = {
    initialShowPrices: boolean;
    lastUpdatedLabel?: string | null;
};

export default function CatalogConfigToggle({
    initialShowPrices,
    lastUpdatedLabel,
}: CatalogConfigToggleProps) {
    const [isPending, startTransition] = useTransition();

    const [showPrices, setShowPrices] = useState<boolean>(() =>
        Boolean(initialShowPrices),
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const next = event.target.checked;
        const prev = showPrices;

        setShowPrices(next);

        startTransition(async () => {
            try {
                await updateCatalogConfigShowPrices(next);
                toast.success(
                    next
                        ? "Los precios ahora se muestran en el catálogo público."
                        : "Los precios ahora están ocultos en el catálogo público.",
                );
            } catch (error: unknown) {
                setShowPrices(prev);
                const msg =
                    error instanceof Error
                        ? error.message
                        : "No se pudo actualizar la configuración de precios.";
                toast.error(msg);
            }
        });
    };

    return (
        <section
            aria-label="Configuración general del catálogo"
            className="rounded border bg-white px-3 py-3 text-sm sm:px-4 sm:py-3"
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-900">
                        Visibilidad de precios en el catálogo
                    </p>
                    <p className="text-xs text-neutral-600">
                        Este ajuste aplica a todas las páginas públicas del catálogo. Los
                        precios por variante se respetan según la configuración de cada
                        producto.
                    </p>
                    {lastUpdatedLabel && (
                        <p className="mt-1 text-[11px] text-neutral-500">
                            Última actualización: {lastUpdatedLabel}
                        </p>
                    )}
                </div>

                <div className="mt-2 flex items-center gap-2 sm:mt-0">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                        <span className="text-xs text-neutral-700">
                            {showPrices ? "Mostrar precios" : "Ocultar precios"}
                        </span>
                        <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-neutral-300 transition data-[checked=true]:bg-emerald-600">
                            <input
                                type="checkbox"
                                className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                checked={showPrices}
                                onChange={handleChange}
                                disabled={isPending}
                                aria-label="Alternar visibilidad de precios en el catálogo"
                            />
                            <span className="pointer-events-none ml-[3px] inline-block h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
                        </span>
                    </label>
                </div>
            </div>

            {isPending && (
                <p className="mt-2 text-[11px] text-neutral-500" aria-live="polite">
                    Guardando cambios…
                </p>
            )}
        </section>
    );
}
