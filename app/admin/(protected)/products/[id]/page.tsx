// app/admin/(protected)/products/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById, listCategoriesForAdmin } from "@/app/admin/server-actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProductById(id),
    listCategoriesForAdmin(),
  ]);

  if (!product) return notFound();

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          Editar producto{" "}
          <span className="font-normal text-neutral-700">
            — {product.name}
          </span>
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/admin"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Volver al listado
          </Link>
          <Link
            href={`/admin/products/${product.id}/images`}
            className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Gestionar imágenes
          </Link>
        </div>
      </div>

      <ProductForm mode="edit" initial={product} allCategories={categories} />
    </div>
  );
}
