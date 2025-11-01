import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById } from "@/app/admin/server-actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;              // <-- desenvuelve la Promise
  const product = await getProductById(id);
  if (!product) return notFound();

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">Editar producto</h2>
      <ProductForm mode="edit" initial={product} />
    </div>
  );
}
