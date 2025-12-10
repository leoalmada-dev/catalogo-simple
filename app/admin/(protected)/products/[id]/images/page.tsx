// app/admin/(protected)/products/[id]/images/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/app/admin/server-actions";
import { ImageManager } from "@/components/admin/ImageManager";

export default async function ImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return notFound();

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          Imágenes —{" "}
          <span className="font-normal">{product.name}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/admin"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Volver al listado
          </Link>
          <Link
            href={`/admin/products/${product.id}`}
            className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Editar producto
          </Link>
          <Link
            href={`/producto/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-600 underline hover:text-neutral-800"
          >
            Ver en catálogo
          </Link>
        </div>
      </div>

      <p className="text-xs text-neutral-600">
        Subí imágenes generales del producto o asociadas a una variante. La
        imagen marcada como <span className="font-medium">Principal</span> se
        muestra primero en el catálogo. El texto alternativo (ALT) ayuda a la
        accesibilidad y a que el sistema identifique mejor la variante en la
        página de producto (por ejemplo:
        <span className="italic"> “Café Iguaçu – Lata 170g”</span>).
      </p>

      <ImageManager productId={product.id} />
    </div>
  );
}
