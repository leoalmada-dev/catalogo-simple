// components/catalog/ProductCard.tsx
import Link from "next/link";
import type { ProductPublic } from "@/lib/data/catalog";
import { toPublicStorageUrl } from "@/lib/images";
import SafeImage from "../ui/SafeImage";

function formatMinPrice(cents: number | null): string | null {
    if (cents == null) return null;
    const value = cents / 100;
    return new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency: "UYU",
    }).format(value);
}

export default function ProductCard({ product }: { product: ProductPublic }) {
    const href = `/producto/${product.slug}`;
    const imgUrl = toPublicStorageUrl(product.primary_image);

    const canShowPrice =
        product.effective_show_prices && product.min_price_cents != null;
    const formattedPrice = canShowPrice
        ? formatMinPrice(product.min_price_cents)
        : null;

    return (
        <Link
            href={href}
            aria-label={`Ver detalle de ${product.name}`}
            className="group block rounded-2xl border bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)] transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-neutral-50">
                {imgUrl ? (
                    <SafeImage
                        src={imgUrl || "/no-image.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-200 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                        Sin imagen
                    </div>
                )}
            </div>

            <div className="space-y-1.5 p-3">
                <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">
                    {product.name}
                </h3>

                {formattedPrice && (
                    <p className="text-sm text-neutral-700">{formattedPrice}</p>
                )}
            </div>
        </Link>
    );
}
