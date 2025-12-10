// components/catalog/ProductCard.tsx
import Link from "next/link";
import type { ProductPublic } from "@/lib/data/catalog";
import { toPublicStorageUrl } from "@/lib/images";
import SafeImage from "../ui/SafeImage";

type Props = {
    product: ProductPublic;
};

export default function ProductCard({ product }: Props) {
    const href = `/producto/${product.slug}`;
    const imgUrl = toPublicStorageUrl(product.primary_image);

    const hasVisiblePrice =
        product.effective_show_prices && product.min_price_visible != null;

    const formattedPrice = hasVisiblePrice
        ? new Intl.NumberFormat("es-UY", {
            style: "currency",
            currency: "UYU",
        }).format(Number(product.min_price_visible))
        : null;

    return (
        <article className="group block rounded-2xl border bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)] transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-sm focus-within:shadow-sm">
            <Link
                href={href}
                aria-label={`Ver detalle de ${product.name}`}
                className="flex h-full flex-col rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-neutral-50">
                    {imgUrl ? (
                        <SafeImage
                            src={imgUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width:768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-200 group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                            Sin imagen
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col p-3">
                    <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">
                        {product.name}
                    </h3>

                    {hasVisiblePrice ? (
                        <p className="mt-1 text-sm text-neutral-800">
                            <span className="text-xs uppercase text-neutral-500">
                                Desde{" "}
                            </span>
                            <span className="font-medium">{formattedPrice}</span>
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-neutral-500">
                            Consultar precio
                        </p>
                    )
                    }
                </div>
            </Link>
        </article>
    );
}
