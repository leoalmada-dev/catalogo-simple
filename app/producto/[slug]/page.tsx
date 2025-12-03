export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    getProductBySlug,
    getProductImages,
    getProductVariants,
    getCatalogConfig,
} from '@/lib/data/catalog';
import { toPublicStorageUrl } from '@/lib/images';
import { WHATSAPP_PHONE, SITE_URL } from '@/lib/env';
import VariantSelector from '@/components/catalog/VariantSelector';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const p = await getProductBySlug(slug);
        const ogImg = toPublicStorageUrl(p.primary_image) ?? undefined;
        const title = p.name;
        const description = p.description ?? undefined;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                images: ogImg ? [{ url: ogImg, width: 1200, height: 630 }] : undefined,
            },
            alternates: { canonical: `/producto/${p.slug}` },
        };
    } catch {
        return { title: 'Producto' };
    }
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;

    // 1) Fetch/compute dentro del try...
    let p: Awaited<ReturnType<typeof getProductBySlug>>;
    let gallery: Awaited<ReturnType<typeof getProductImages>>;
    let variants: Awaited<ReturnType<typeof getProductVariants>>;
    let config: Awaited<ReturnType<typeof getCatalogConfig>>;
    try {
        p = await getProductBySlug(slug);
        [gallery, variants, config] = await Promise.all([
            getProductImages(p.id),
            getProductVariants(p.id),
            getCatalogConfig(),
        ]);
    } catch (e: unknown) {
        const err = e as { code?: string };
        if (err?.code === 'NOT_FOUND') return notFound();
        throw e;
    }

    // 2) Derivados (fuera del try)
    const mainImg = toPublicStorageUrl(p.primary_image);
    const currencyCode = (config.currency_code || 'UYU') as Intl.NumberFormatOptions['currency'];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        image: mainImg ? [mainImg] : undefined,
        description: p.description ?? undefined,
        url: `${SITE_URL}/producto/${p.slug}`,
        offers:
            p.min_price_visible != null
                ? {
                    '@type': 'Offer',
                    priceCurrency: config.currency_code || 'UYU',
                    price: Number(p.min_price_visible).toFixed(2),
                    availability: 'https://schema.org/InStock',
                }
                : undefined,
    };

    // 3) Render
    return (
        <>
            <Breadcrumbs
                items={[
                    { label: 'Inicio', href: '/' },
                    { label: 'Catálogo', href: '/' },
                    { label: p.name, href: `/producto/${p.slug}` },
                ]}
            />
            <article className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-50">
                        {mainImg && (
                            <Image
                                src={mainImg}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        )}
                    </div>

                    {gallery.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {gallery.map((g, i) => {
                                const url = toPublicStorageUrl(g.path);
                                if (!url) return null;
                                return (
                                    <div
                                        key={`${g.path}-${i}`}
                                        className="relative aspect-square overflow-hidden rounded-xl bg-neutral-50"
                                    >
                                        <Image src={url} alt={g.alt ?? p.name} fill className="object-cover" sizes="25vw" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold">{p.name}</h1>

                    {/* Precio mínimo visible (si aplica) */}
                    {p.min_price_visible != null ? (
                        <p className="text-xl font-medium">
                            Desde{' '}
                            {new Intl.NumberFormat('es-UY', {
                                style: 'currency',
                                currency: currencyCode,
                            }).format(Number(p.min_price_visible))}
                        </p>
                    ) : (
                        <p className="text-sm text-neutral-600">Consultar precio</p>
                    )}

                    {p.description && (
                        <p className="whitespace-pre-line text-sm leading-6 text-neutral-800">{p.description}</p>
                    )}

                    {/* Variantes elegibles + CTA */}
                    <VariantSelector
                        variants={variants}
                        productName={p.name}
                        productSlug={p.slug}
                        showPrices={Boolean(p.effective_show_prices)}
                        currencyCode={config.currency_code || 'UYU'}
                        whatsappPhone={WHATSAPP_PHONE || undefined}
                    />
                </div>
            </article>

            {/* JSON-LD para SEO */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </>
    );
}
