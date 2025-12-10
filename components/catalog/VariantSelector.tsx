// components/catalog/VariantSelector.tsx
"use client";

import { useMemo, useState } from "react";
import { buildWaTrackingUrl } from "@/lib/whatsapp";

type Variant = {
  id: string;
  sku: string;
  name: string | null;
  price_cents: number;
  stock: number;
  attributes: Record<string, unknown>;
};

type VariantSelectorProps = {
  variants: Variant[];
  productId: string;
  productName: string;
  productSlug: string;
  showPrices: boolean;
  currencyCode: string;
  source: "home" | "category" | "product" | string;
};

function formatMoney(cents: number, currency: string) {
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value.toLocaleString("es-UY")} ${currency}`;
  }
}

export default function VariantSelector({
  variants,
  productId,
  productName,
  productSlug,
  showPrices,
  currencyCode,
  source,
}: VariantSelectorProps) {
  const hasVariants = variants.length > 0;

  // Selección inicial
  const [selectedId, setSelectedId] = useState<string | null>(
    variants.length === 1 ? variants[0]?.id ?? null : null
  );

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? null,
    [variants, selectedId]
  );

  const waHref = buildWaTrackingUrl({
    productId,
    productSlug,
    source,
    variantId: selectedVariant?.id,
    productName,
    variantLabel: selectedVariant?.name ?? undefined,
  });

  const ctaDisabled = hasVariants && !selectedVariant;

  return (
    <section className="space-y-4" aria-label="Opciones de variantes y consulta">
      {/* ===== Variantes ===== */}

      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Variantes</p>

        {hasVariants ? (
          <>
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label="Seleccionar variante"
            >
              {variants.map((v) => {
                const isActive = v.id === selectedVariant?.id;
                const label = v.name || v.sku;

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedId(v.id)}
                    role="radio"
                    aria-checked={isActive}  // ✔ obligatorio
                    className={[
                      "inline-flex items-center justify-center rounded-full border px-3.5 py-1.5 text-xs sm:text-sm transition",
                      "min-h-[2.25rem] min-w-[2.5rem]",
                      isActive
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {!selectedVariant && variants.length > 1 && (
              <p className="text-xs text-neutral-600">
                Seleccioná una variante para ver el precio y consultar por WhatsApp.
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-neutral-600">
            No hay variantes configuradas por ahora. Podés escribirnos por WhatsApp para consultar.
          </p>
        )}
      </div>

      {/* ===== Precio + stock ===== */}
      {selectedVariant && (
        <div className="space-y-1 text-sm" aria-live="polite" aria-atomic="true">
          {showPrices ? (
            <p className="font-medium">
              {formatMoney(selectedVariant.price_cents, currencyCode)}
            </p>
          ) : (
            <p className="text-xs text-neutral-600">
              El precio de esta variante se confirma por WhatsApp.
            </p>
          )}

          {typeof selectedVariant.stock === "number" && (
            <p className="text-xs text-neutral-600">
              {selectedVariant.stock > 0
                ? `Stock: ${selectedVariant.stock}`
                : "Sin stock"}
            </p>
          )}
        </div>
      )}

      {/* ===== CTA WhatsApp ===== */}
      <a
        href={ctaDisabled ? undefined : waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (ctaDisabled) e.preventDefault();
        }}
        className={[
          "inline-flex w-full items-center justify-center rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition",
          "hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "min-h-[2.75rem]",
          ctaDisabled ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
        aria-disabled={ctaDisabled}
      >
        {ctaDisabled ? "Seleccioná una variante" : "Consultar por WhatsApp"}
      </a>
    </section>
  );
}
