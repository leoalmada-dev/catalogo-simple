// app/producto/[slug]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
    getProductBySlug,
    getProductImages,
    getProductVariants,
    getCatalogConfig,
} from "@/lib/data/catalog";
import { toPublicStorageUrl } from "@/lib/images";
import { SITE_URL } from "@/lib/env";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductDetailClient from "@/components/catalog/ProductDetailClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const p = await getProductBySlug(slug);
        const ogImg = toPublicStorageUrl(p.primary_image) ?? undefined;
        const title = p.name;
        const description = p.description ?? undefined;

        const url = `${SITE_URL.replace(/\/$/, "")}/producto/${p.slug}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: "website",
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
        return { title: "Producto" };
    }
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;

    let p: Awaited<ReturnType<typeof getProductBySlug>>;
    let galleryRaw: Awaited<ReturnType<typeof getProductImages>>;
    let variants: Awaited<ReturnType<typeof getProductVariants>>;
    let config: Awaited<ReturnType<typeof getCatalogConfig>>;

    try {
        p = await getProductBySlug(slug);
        [galleryRaw, variants, config] = await Promise.all([
            getProductImages(p.id),
            getProductVariants(p.id),
            getCatalogConfig(),
        ]);
    } catch (e: unknown) {
        const err = e as { code?: string };
        if (err?.code === "NOT_FOUND") return notFound();
        throw e;
    }

    const mainImg = toPublicStorageUrl(p.primary_image);

    // Normalizamos galería para el cliente: URL pública + alt
    type ClientImage = { url: string; alt: string };

    const seen = new Set<string>();
    const gallery: ClientImage[] = [];

    if (mainImg) {
        gallery.push({ url: mainImg, alt: p.name });
        seen.add(mainImg);
    }

    for (const g of galleryRaw) {
        const url = toPublicStorageUrl(g.path);
        if (!url || seen.has(url)) continue;
        gallery.push({
            url,
            alt: g.alt ?? p.name,
        });
        seen.add(url);
    }

    // 👇 aseguramos string puro, sin undefined
    const currencyCode: string = config.currency_code ?? "UYU";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        image: mainImg ? [mainImg] : undefined,
        description: p.description ?? undefined,
        url: `${SITE_URL}/producto/${p.slug}`,
        offers:
            p.min_price_visible != null
                ? {
                    "@type": "Offer",
                    priceCurrency: config.currency_code || "UYU",
                    price: Number(p.min_price_visible).toFixed(2),
                    availability: "https://schema.org/InStock",
                }
                : undefined,
    };

    return (
        <div className="space-y-4">
            <Breadcrumbs
                items={[
                    { label: "Inicio", href: "/" },
                    { label: "Catálogo", href: "/" },
                    { label: p.name, href: `/producto/${p.slug}` },
                ]}
            />

            <ProductDetailClient
                product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    description: p.description ?? null,
                    min_price_visible: p.min_price_visible ?? null,
                }}
                gallery={gallery}
                variants={variants}
                currencyCode={currencyCode}
                showPrices={Boolean(p.effective_show_prices)}
            />

            <script
                type="application/ld+json"
                // JSON-LD para SEO del producto
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </div>
    );
}
