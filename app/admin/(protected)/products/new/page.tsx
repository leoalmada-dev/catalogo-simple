// app/admin/(protected)/products/new/page.tsx
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { listCategoriesForAdmin } from "@/app/admin/server-actions";

export default async function NewProductPage() {
  const categories = await listCategoriesForAdmin();

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Nuevo producto</h1>
        <Link
          href="/admin"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Volver al listado
        </Link>
      </div>

      <ProductForm mode="create" allCategories={categories} />
    </div>
  );
}
