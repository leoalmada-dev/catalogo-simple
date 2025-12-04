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

type VariantSelectorProps = {
  variants: Variant[];
  productId: string;
  productName: string;
  productSlug: string;
  showPrices: boolean;
  currencyCode: string;
  source: 'home' | 'category' | 'product' | string;
};

function formatMoney(cents: number, currency: string) {
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency }).format(value);
  } catch {
    // fallback si el currency code es raro
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
  source,
}: VariantSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    variants[0]?.id ?? null,
  );

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

  return (
    <div className="space-y-4">
      {/* listado de variantes */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Variantes</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const isActive = v.id === selectedVariant?.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedId(v.id)}
                className={[
                  'rounded-full border px-3 py-1 text-xs',
                  isActive
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500',
                ].join(' ')}
              >
                {v.name || v.sku}
              </button>
            );
          })}
        </div>
      </div>

      {/* precio + stock de la variante seleccionada */}
      {selectedVariant && (
        <div className="space-y-1 text-sm">
          {showPrices && (
            <p className="font-medium">
              {formatMoney(selectedVariant.price_cents, currencyCode)}
            </p>
          )}
          {typeof selectedVariant.stock === 'number' && (
            <p className="text-xs text-neutral-600">
              Stock: {selectedVariant.stock > 0 ? selectedVariant.stock : 'Sin stock'}
            </p>
          )}
        </div>
      )}

      {/* CTA WhatsApp */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-md border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        Consultar por WhatsApp
      </a>
    </div>
  );
}
