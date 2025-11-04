'use client';

import { useMemo, useState } from 'react';
import { WhatsAppButton } from '@/components/WhatsAppButton';

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
  productName,
  productSlug,
  showPrices,
  currencyCode,
  whatsappPhone,
}: {
  variants: Variant[];
  productName: string;
  productSlug: string;
  showPrices: boolean;
  currencyCode: string;
  whatsappPhone?: string; // lo pasamos desde el server
}) {
  const [selected, setSelected] = useState(variants[0] ?? null);

  const msg = useMemo(() => {
    if (!selected) return `Hola, me interesa el producto: ${productName} (${productSlug})`;
    const vName = selected.name || selected.sku;
    return `Hola, me interesa el producto: ${productName} (${productSlug}) — Variante: ${vName}`;
  }, [selected, productName, productSlug]);

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
              className={`rounded-xl border p-3 text-left transition-colors ${
                isActive ? 'border-black bg-neutral-50' : 'bg-white hover:bg-neutral-50'
              }`}
              aria-pressed={isActive}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {v.name || v.sku}
                  </p>
                  {/* Atributos básicos visibles */}
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

      {/* CTA WhatsApp con variante seleccionada */}
      {whatsappPhone ? (
        <WhatsAppButton phone={whatsappPhone} text={msg} />
      ) : (
        <p className="text-xs text-red-600">
          Falta configurar WHATSAPP_PHONE en .env
        </p>
      )}
    </div>
  );
}
