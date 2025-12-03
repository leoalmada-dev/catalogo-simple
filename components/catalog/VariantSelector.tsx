'use client';

import { useMemo, useState } from 'react';
import { buildWaTrackingUrl } from '@/lib/whatsapp';

type Variant = {
  id: string;
  sku: string;
  name: string | null;
  price_cents: number;
  stock: number;
  attributes: Record<string, unknown>;
};

function formatMoney(cents: number, currency: string) {
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency }).format(value);
  } catch {
    // fallback si el currency code es extraño
    return `${value.toLocaleString()} ${currency}`;
  }
}

export default function VariantSelector({
  variants,
  productId,
  productName,
  productSlug,
  showPrices,
  currencyCode,
  whatsappPhone,
  source = 'product',
}: {
  variants: Variant[];
  productId: string;
  productName: string;
  productSlug: string;
  showPrices: boolean;
  currencyCode: string;
  whatsappPhone?: string; // solo para saber si mostrar u ocultar CTA
  source?: 'home' | 'category' | 'product' | string;
}) {
  const [selected, setSelected] = useState<Variant | null>(variants[0] ?? null);

  const trackingHref = useMemo(() => {
    if (!selected) return undefined;

    return buildWaTrackingUrl({
      productId,
      productSlug,
      productName,
      variantId: selected.id,
      variantLabel: selected.name || selected.sku,
      source,
    });
  }, [selected, productId, productSlug, productName, source]);

  if (!variants.length) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
        No hay variantes disponibles para este producto.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {variants.map((v) => {
          const isActive = selected?.id === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelected(v)}
              className={`rounded-xl border p-3 text-left transition-colors ${isActive ? 'border-black bg-neutral-50' : 'bg-white hover:bg-neutral-50'
                }`}
              aria-pressed={isActive}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{v.name || v.sku}</p>

                  {v.attributes && Object.keys(v.attributes).length > 0 && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                      {Object.entries(v.attributes)
                        .map(([k, val]) => `${k}: ${String(val)}`)
                        .join(' · ')}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-sm">
                  {showPrices ? (
                    <span className="font-medium">
                      {formatMoney(v.price_cents, currencyCode)}
                    </span>
                  ) : (
                    <span className="text-neutral-500">Consultar</span>
                  )}
                </div>
              </div>

              {v.stock <= 0 && (
                <p className="mt-1 text-xs text-red-600">Sin stock</p>
              )}
            </button>
          );
        })}
      </div>

      {/* CTA WhatsApp pasando SIEMPRE por /w */}
      {whatsappPhone ? (
        trackingHref ? (
          <a
            href={trackingHref}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            aria-label={`Consultar por WhatsApp sobre ${productName}${selected ? ` (${selected.name || selected.sku})` : ''
              }`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar por WhatsApp
          </a>
        ) : (
          <p className="text-xs text-neutral-500">
            Seleccioná una variante para consultar por WhatsApp.
          </p>
        )
      ) : (
        <p className="text-xs text-red-600">
          Falta configurar WHATSAPP_PHONE en .env
        </p>
      )}
    </div>
  );
}
