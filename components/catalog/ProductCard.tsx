// components/catalog/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { ProductPublic } from '@/lib/data/catalog';
import { toPublicStorageUrl } from '@/lib/images';

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
          <Image
            src={imgUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
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
