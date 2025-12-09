// components/catalog/ProductCard.tsx
import Link from "next/link";
import type { ProductPublic } from "@/lib/data/catalog";
import { toPublicStorageUrl } from "@/lib/images";
import SafeImage from "../ui/SafeImage";

export default function ProductCard({ product }: { product: ProductPublic }) {
    const href = `/producto/${product.slug}`;
    const imgUrl = toPublicStorageUrl(product.primary_image);

    const hasPrice = product.min_price_visible != null;

    return (
        <Link
            href={href}
            aria-label={product.name}
            className="block rounded-2xl border bg-white shadow-xs transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-neutral-50">
                {imgUrl ? (
                    <SafeImage
                        src={imgUrl || "/no-image.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-200 hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                        Sin imagen
                    </div>
                )}
            </div>

            <div className="p-3 space-y-1.5">
                <h2 className="line-clamp-2 text-sm font-medium text-neutral-900">
                    {product.name}
                </h2>

                {hasPrice ? (
                    <p className="text-sm font-medium text-neutral-800">
                        $
                        {Number(product.min_price_visible).toLocaleString("es-UY", {
                            minimumFractionDigits: 0,
                        })}
                    </p>
                ) : (
                    <p className="text-xs text-neutral-600">Consultar precio</p>
                )}
            </div>
        </Link>
    );
}
