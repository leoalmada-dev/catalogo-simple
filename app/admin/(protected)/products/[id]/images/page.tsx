import { notFound } from "next/navigation";
import { getProductById } from "@/app/admin/server-actions";
import { ImageManager } from "@/components/admin/ImageManager";

export default async function ImagesPage({ params }: { params: { id: string }}) {
  const product = await getProductById(params.id);
  if (!product) return notFound();
  return (
    <div className="max-w-4xl space-y-4">
      <h2 className="text-xl font-semibold">Imágenes — {product.title}</h2>
      <ImageManager productId={product.id} />
    </div>
  );
}
