"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, deleteProduct } from "@/app/admin/server-actions";
import { productSchema, type ProductFormData } from "@/lib/schemas/product";

export function ProductForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Partial<ProductFormData> & { id?: string };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { register, handleSubmit, control, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initial ?? { status: "draft", variants: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const onSubmit = (data: ProductFormData) => {
    start(async () => {
      if (mode === "create") await createProduct(data);
      else await updateProduct({ id: String(initial?.id), data });
      router.push("/admin");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <Input {...register("name")} />
          {errors.name && <p className="text-xs text-red-600">{String(errors.name.message)}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <Input {...register("slug")} />
          {errors.slug && <p className="text-xs text-red-600">{String(errors.slug.message)}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <Textarea rows={5} {...register("description")} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select className="w-full border rounded h-9 px-2" {...register("status")}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
      </div>

      <fieldset className="border rounded p-3 space-y-3">
        <legend className="px-1 text-sm">Variantes</legend>
        {fields.map((f, idx) => (
          <div key={f.id} className="grid grid-cols-6 gap-2 items-end">
            <Input placeholder="SKU *" {...register(`variants.${idx}.sku` as const)} />
            <Input placeholder="Nombre" {...register(`variants.${idx}.name` as const)} />
            <Input placeholder="Precio" type="number" step="0.01" {...register(`variants.${idx}.price` as const, { valueAsNumber: true })} />
            <Input placeholder="Stock" type="number" {...register(`variants.${idx}.stock` as const, { valueAsNumber: true })} />
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" {...register(`variants.${idx}.is_available` as const)} defaultChecked />
              Disponible
            </label>
            <Button type="button" variant="secondary" onClick={() => remove(idx)}>Quitar</Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ is_available: true, stock: 0 })}>+ Variante</Button>
      </fieldset>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{mode === "create" ? "Crear" : "Guardar"}</Button>
        {mode === "edit" && initial?.id && (
          <Button type="button" variant="destructive" disabled={pending}
            onClick={() => { start(async () => { await deleteProduct(String(initial.id)); router.push("/admin"); }); }}>
            Eliminar
          </Button>
        )}
      </div>
    </form>
  );
}
