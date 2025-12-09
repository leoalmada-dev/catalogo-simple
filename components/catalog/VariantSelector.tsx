// components/catalog/VariantSelector.tsx
"use client";

import { useId, useMemo, useState } from "react";
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
    // fallback si el currency code es raro
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
  const [selectedId, setSelectedId] = useState<string | null>(
    variants[0]?.id ?? null,
  );

  const groupId = useId();
  const hasVariants = variants.length > 0;

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? variants[0] ?? null,
    [variants, selectedId],
  );

  const waHref = buildWaTrackingUrl({
    productId,
    productSlug,
    source,
    variantId: selectedVariant?.id,
    productName,
    variantLabel: selectedVariant?.name ?? undefined,
  });

  const showStockInfo =
    selectedVariant && typeof selectedVariant.stock === "number";

  const stockLabel =
    !selectedVariant || typeof selectedVariant.stock !== "number"
      ? null
      : selectedVariant.stock > 0
        ? `Stock: ${selectedVariant.stock}`
        : "Sin stock";

  return (
    <section
      className="space-y-4"
      aria-label={`Opciones y consulta para ${productName}`}
    >
      {/* listado de variantes */}
      <div className="space-y-2">
        <p
          id={`${groupId}-label`}
          className="text-sm font-medium text-neutral-700"
        >
          Variantes
        </p>

        {hasVariants ? (
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-labelledby={`${groupId}-label`}
          >
            {variants.map((v) => {
              const isActive = v.id === selectedVariant?.id;
              const label = v.name || v.sku;

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs transition",
                    isActive
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  ].join(" ")}
                  aria-pressed={isActive}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-neutral-600">
            No hay variantes configuradas por ahora. Podés escribirnos por
            WhatsApp para consultar.
          </p>
        )}
      </div>

      {/* precio + stock de la variante seleccionada */}
      {selectedVariant && (
        <div className="space-y-1 text-sm" aria-live="polite" aria-atomic="true">
          {showPrices ? (
            <p className="font-medium">
              {formatMoney(selectedVariant.price_cents, currencyCode)}
            </p>
          ) : (
            <p className="text-xs text-neutral-600">Precio a consultar.</p>
          )}

          {showStockInfo && stockLabel && (
            <p className="text-xs text-neutral-600">{stockLabel}</p>
          )}
        </div>
      )}

      {/* CTA WhatsApp */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={
          selectedVariant
            ? `Consultar por WhatsApp sobre ${productName} - variante ${selectedVariant.name || selectedVariant.sku}`
            : `Consultar por WhatsApp sobre ${productName}`
        }
      >
        Consultar por WhatsApp
      </a>
    </section>
  );
}
