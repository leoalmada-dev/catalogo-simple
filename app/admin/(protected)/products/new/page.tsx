import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">Nuevo producto</h2>
      <ProductForm mode="create" />
    </div>
  );
}
