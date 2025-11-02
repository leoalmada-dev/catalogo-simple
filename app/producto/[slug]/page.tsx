export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getProductBySlug, getProductImages } from '@/lib/data/catalog';
import { toPublicStorageUrl } from '@/lib/images';
import { SITE_URL, WHATSAPP_PHONE } from '@/lib/env';
import { WhatsAppButton } from '@/components/WhatsAppButton';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // Next 16: unwrap
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
        type: 'website', // evitar 'product' en Next 16
        images: ogImg ? [{ url: ogImg, width: 1200, height: 630 }] : undefined,
      },
      alternates: { canonical: `/producto/${p.slug}` },
    };
  } catch {
    return { title: 'Producto' };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params; // Next 16: unwrap

  try {
    const p = await getProductBySlug(slug);
    const gallery = await getProductImages(p.id);
    const mainImg = toPublicStorageUrl(p.primary_image);

    // JSON-LD Product
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
              priceCurrency: 'UYU', // ajustá si usás otra moneda
              price: Number(p.min_price_visible).toFixed(2),
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
            { label: p.name },
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
                      <Image
                        src={url}
                        alt={g.alt ?? p.name}
                        fill
                        className="object-cover"
                        sizes="25vw"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">{p.name}</h1>

            {p.min_price_visible != null && (
              <p className="text-xl font-medium">
                ${Number(p.min_price_visible).toLocaleString()}
              </p>
            )}

            {p.description && (
              <p className="text-sm leading-6 text-neutral-800 whitespace-pre-line">
                {p.description}
              </p>
            )}

            {WHATSAPP_PHONE ? (
              <WhatsAppButton
                phone={WHATSAPP_PHONE}
                text={`Hola, me interesa el producto: ${p.name} (${p.slug})`}
              />
            ) : (
              <p className="text-xs text-red-600">
                Falta configurar WHATSAPP_PHONE en .env
              </p>
            )}
          </div>
        </article>

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </>
    );
  } catch (e: any) {
    if (e?.code === 'NOT_FOUND') return notFound();
    throw e;
  }
}
