// components/catalog/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { ProductPublic } from '@/lib/data/catalog';
import { toPublicStorageUrl } from '@/lib/images';
import SafeImage from '../ui/SafeImage';

export default function ProductCard({ product }: { product: ProductPublic }) {
    const href = `/producto/${product.slug}`;
    const imgUrl = toPublicStorageUrl(product.primary_image);

    return (
        <Link
            href={href}
            className="block rounded-2xl border bg-white hover:shadow-sm transition-shadow"
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
                    <div className="flex h-full w-full items-center justify-center text-neutral-400">
                        Sin imagen
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
                {product.min_price_visible != null && (
                    <p className="mt-1 text-sm text-neutral-700">
                        ${Number(product.min_price_visible).toLocaleString()}
                    </p>
                )}
            </div>
        </Link>
    );
}
