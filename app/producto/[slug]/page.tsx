// app/producto/[slug]/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    getProductBySlug,
    getProductImages,
    getProductVariants,
    getCatalogConfig,
} from '@/lib/data/catalog';
import { toPublicStorageUrl } from '@/lib/images';
import { SITE_URL } from '@/lib/env';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductDetailClient from '@/components/catalog/ProductDetailClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const p = await getProductBySlug(slug);
        const ogImg = toPublicStorageUrl(p.primary_image) ?? undefined;
        const title = p.name;
        const description = p.description ?? undefined;

        const url = `${SITE_URL.replace(/\/$/, '')}/producto/${p.slug}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                url,
                images: ogImg
                    ? [{ url: ogImg, width: 1200, height: 630 }]
                    : undefined,
            },
            alternates: {
                canonical: `/producto/${p.slug}`,
            },
        };
    } catch {
        return { title: 'Producto' };
    }
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;

    const p = await (async () => {
        try {
            return await getProductBySlug(slug);
        } catch (e: unknown) {
            const err = e as { code?: string };
            if (err?.code === 'NOT_FOUND') return null;
            throw e;
        }
    })();

    if (!p) return notFound();

    const [galleryRows, variantsRows, config] = await Promise.all([
        getProductImages(p.id),
        getProductVariants(p.id),
        getCatalogConfig(),
    ]);

    const mainImg = toPublicStorageUrl(p.primary_image);

    // 👇 lo tipamos explícitamente como string, sin undefined
    const currencyCode: string = config.currency_code || 'UYU';

    const gallery = galleryRows
        .map((g) => {
            const url = toPublicStorageUrl(g.path);
            return {
                url: url ?? '',
                alt: g.alt ?? p.name,
            };
        })
        .filter((g) => g.url);

    const variants = variantsRows.map((v) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        price_cents: v.price_cents,
        stock: v.stock,
        attributes: v.attributes,
    }));

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        image: mainImg ? [mainImg] : undefined,
        description: p.description ?? undefined,
        url: `${SITE_URL}/producto/${p.slug}`,
        offers:
            p.effective_show_prices && p.min_price_cents != null
                ? {
                    '@type': 'Offer',
                    priceCurrency: currencyCode,
                    price: Number(p.min_price_cents / 100).toFixed(2),
                    availability: 'https://schema.org/InStock',
                }
                : undefined,
    };

    return (
        <>
            <Breadcrumbs
                items={[
                    { label: 'Inicio', href: '/' },
                    { label: 'Catálogo', href: '/' },
                    { label: p.name, href: `/producto/${p.slug}` },
                ]}
            />

            <ProductDetailClient
                product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    description: p.description,
                    min_price_cents: p.min_price_cents,
                    effective_show_prices: p.effective_show_prices,
                }}
                gallery={
                    gallery.length
                        ? gallery
                        : mainImg
                            ? [{ url: mainImg, alt: p.name }]
                            : []
                }
                variants={variants}
                currencyCode={currencyCode}
            />

            {/* JSON-LD para SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </>
    );
}
