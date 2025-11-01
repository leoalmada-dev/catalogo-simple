import { notFound } from "next/navigation";
import { getProductById } from "@/app/admin/server-actions";
import { ImageManager } from "@/components/admin/ImageManager";

export default async function ImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;              // <-- desenvuelve la Promise
  const product = await getProductById(id);
  if (!product) return notFound();

  return (
    <div className="max-w-4xl space-y-4">
      <h2 className="text-xl font-semibold">Imágenes — {product.title ?? product.name}</h2>
      <ImageManager productId={product.id} />
    </div>
  );
}
