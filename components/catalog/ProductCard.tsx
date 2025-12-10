// components/catalog/ProductCard.tsx
import Link from 'next/link';
import type { ProductPublic } from '@/lib/data/catalog';
import { toPublicStorageUrl } from '@/lib/images';
import SafeImage from '../ui/SafeImage';

function formatMinPrice(cents: number | null): string | null {
    if (cents == null) return null;
    const value = cents / 100;
    return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'UYU',
    }).format(value);
}

export default function ProductCard({ product }: { product: ProductPublic }) {
    const href = `/producto/${product.slug}`;
    const imgUrl = toPublicStorageUrl(product.primary_image);
    const canShowPrice = product.effective_show_prices && product.min_price_cents != null;
    const formattedPrice = canShowPrice
        ? formatMinPrice(product.min_price_cents)
        : null;

    return (
        <Link
            href={href}
            className="block rounded-2xl border bg-white transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-neutral-50">
                {imgUrl ? (
                    <SafeImage
                        src={imgUrl || '/no-image.svg'}
                        alt={product.name}
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-400 text-xs">
                        Sin imagen
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
                {formattedPrice && (
                    <p className="mt-1 text-sm text-neutral-700">{formattedPrice}</p>
                )}
            </div>
        </Link>
    );
}
