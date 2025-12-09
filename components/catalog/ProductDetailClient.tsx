// components/catalog/ProductDetailClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { buildWaTrackingUrl } from "@/lib/whatsapp";

type ProductImage = {
    url: string;
    alt: string;
};

type Variant = {
    id: string;
    sku: string;
    name: string | null;
    price_cents: number;
    stock: number;
    attributes: Record<string, unknown>;
};

type ProductDetailClientProps = {
    product: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        min_price_visible: number | null;
    };
    gallery: ProductImage[];
    variants: Variant[];
    currencyCode: string;
    showPrices: boolean;
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

export default function ProductDetailClient({
    product,
    gallery,
    variants,
    currencyCode,
    showPrices,
}: ProductDetailClientProps) {
    // 👉 Si hay solo 1 variante, la seleccionamos de entrada.
    // Si hay 0 o más de 1, arrancamos sin selección.
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
        variants.length === 1 ? variants[0].id : null,
    );

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);

    const hasVariants = variants.length > 0;
    const hasImages = gallery.length > 0;

    const selectedVariant = useMemo(() => {
        if (!selectedVariantId) return null;
        return variants.find((v) => v.id === selectedVariantId) ?? null;
    }, [variants, selectedVariantId]);

    const activeImage = gallery[activeImageIndex] ?? gallery[0] ?? null;

    // Cuando el usuario CAMBIA la variante, intentamos matchear con la imagen cuyo alt contenga el nombre de la variante.
    // No se ejecuta en el primer render para conservar la imagen principal.
    useEffect(() => {
        if (!hasInteracted) return;
        if (!selectedVariant || gallery.length === 0) return;

        const name = selectedVariant.name?.trim();
        if (!name) return;

        const lowerName = name.toLowerCase();

        const matchIndex = gallery.findIndex((img) =>
            img.alt.toLowerCase().includes(lowerName),
        );

        if (matchIndex >= 0) {
            setActiveImageIndex(matchIndex);
        }
    }, [selectedVariant, gallery, hasInteracted]);

    const waHref = buildWaTrackingUrl({
        productId: product.id,
        productSlug: product.slug,
        source: "product",
        variantId: selectedVariant?.id,
        productName: product.name,
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

    // Si hay variantes pero ninguna seleccionada, deshabilitamos el CTA
    const ctaDisabled = hasVariants && !selectedVariant;
    const linkHref = ctaDisabled ? undefined : waHref;

    return (
        <article
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            aria-label={product.name}
        >
            {/* Galería de imágenes */}
            <section
                className="space-y-3"
                aria-label={`Imágenes del producto ${product.name}`}
            >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-50">
                    {activeImage && (
                        <Image
                            src={activeImage.url}
                            alt={activeImage.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    )}
                </div>

                {hasImages && gallery.length > 1 && (
                    <div
                        className="grid grid-cols-4 gap-2"
                        aria-label="Miniaturas de imágenes del producto"
                    >
                        {gallery.map((img, index) => {
                            const isActive = index === activeImageIndex;
                            return (
                                <button
                                    key={`${img.url}-${index}`}
                                    type="button"
                                    onClick={() => {
                                        setActiveImageIndex(index);
                                        setHasInteracted(true);
                                    }}
                                    className="group relative"
                                    aria-pressed={isActive}
                                    aria-label={`Ver imagen ${index + 1} del producto`}
                                >
                                    <div
                                        className={[
                                            "relative aspect-square overflow-hidden rounded-xl bg-neutral-50 border-2",
                                            isActive
                                                ? "border-neutral-900"
                                                : "border-transparent group-hover:border-neutral-400",
                                        ].join(" ")}
                                    >
                                        <Image
                                            src={img.url}
                                            alt={img.alt}
                                            fill
                                            className="object-cover"
                                            sizes="25vw"
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Detalle + variantes + CTA */}
            <section className="space-y-4">
                <h1 className="text-2xl font-semibold">{product.name}</h1>

                {product.min_price_visible != null ? (
                    <p className="text-xl font-medium">
                        Desde{" "}
                        {new Intl.NumberFormat("es-UY", {
                            style: "currency",
                            currency: currencyCode,
                        }).format(Number(product.min_price_visible))}
                    </p>
                ) : (
                    <p className="text-sm text-neutral-600">Consultar precio</p>
                )}

                {product.description && (
                    <p className="whitespace-pre-line text-sm leading-6 text-neutral-800">
                        {product.description}
                    </p>
                )}

                {/* Variantes */}
                <div className="space-y-3">
                    <p className="text-sm font-medium text-neutral-700">Variantes</p>

                    {hasVariants ? (
                        <>
                            <div
                                className="flex flex-wrap gap-2"
                                role="group"
                                aria-label="Seleccionar variante"
                            >
                                {variants.map((v) => {
                                    const isActive = v.id === selectedVariant?.id;
                                    const label = v.name || v.sku;

                                    return (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedVariantId(v.id);
                                                setHasInteracted(true);
                                            }}
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

                            {!selectedVariant && variants.length > 1 && (
                                <p className="text-xs text-neutral-600">
                                    Seleccioná una variante para ver el precio y consultar por
                                    WhatsApp.
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-xs text-neutral-600">
                            No hay variantes configuradas por ahora. Podés escribirnos por
                            WhatsApp para consultar.
                        </p>
                    )}

                    {/* Precio + stock de la variante seleccionada */}
                    {selectedVariant && (
                        <div
                            className="space-y-1 text-sm"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {showPrices ? (
                                <p className="font-medium">
                                    {formatMoney(selectedVariant.price_cents, currencyCode)}
                                </p>
                            ) : (
                                <p className="text-xs text-neutral-600">
                                    Precio de la variante a consultar.
                                </p>
                            )}

                            {showStockInfo && stockLabel && (
                                <p className="text-xs text-neutral-600">{stockLabel}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* CTA WhatsApp */}
                <a
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                        if (ctaDisabled) {
                            e.preventDefault();
                        }
                    }}
                    className={[
                        "inline-flex w-full items-center justify-center rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition",
                        "hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        ctaDisabled ? "pointer-events-none opacity-60" : "",
                    ].join(" ")}
                    aria-disabled={ctaDisabled}
                    aria-label={
                        ctaDisabled
                            ? `Seleccioná una variante para consultar por WhatsApp sobre ${product.name}`
                            : selectedVariant
                                ? `Consultar por WhatsApp sobre ${product.name} - variante ${selectedVariant.name || selectedVariant.sku}`
                                : `Consultar por WhatsApp sobre ${product.name}`
                    }
                >
                    {ctaDisabled ? "Seleccioná una variante" : "Consultar por WhatsApp"}
                </a>
            </section>
        </article>
    );
}
