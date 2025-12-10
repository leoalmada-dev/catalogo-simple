// components/admin/ProductForm.tsx
"use client";

import {
  useForm,
  useFieldArray,
  type SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/admin/server-actions";
import {
  productSchema,
  type ProductFormData,
} from "@/lib/schemas/product";

export function ProductForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Partial<ProductFormData> & { id?: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const resolver =
    zodResolver(productSchema) as unknown as Resolver<ProductFormData>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver,
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? null,
      status: (initial?.status as ProductFormData["status"]) ?? "draft",
      variants: initial?.variants ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    startTransition(async () => {
      if (mode === "create") {
        await createProduct(data);
      } else {
        await updateProduct({ id: String(initial?.id), data });
      }
      router.push("/admin");
    });
  };

  function handleCancel() {
    router.push("/admin");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Nombre
          </label>
          <Input {...register("name")} />
          {errors.name && (
            <p className="text-xs text-red-600">
              {String(errors.name.message)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Slug
          </label>
          <Input {...register("slug")} />
          {errors.slug && (
            <p className="text-xs text-red-600">
              {String(errors.slug.message)}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">
            Descripción
          </label>
          <Textarea rows={5} {...register("description")} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Estado
          </label>
          <select
            className="h-9 w-full rounded border px-2 text-sm"
            {...register("status")}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
      </div>

      <fieldset className="space-y-3 rounded border p-3">
        <legend className="px-1 text-sm font-medium">Variantes</legend>

        {fields.map((f, idx) => (
          <div
            key={f.id}
            className="grid grid-cols-2 items-end gap-2 md:grid-cols-6"
          >
            <Input
              placeholder="SKU *"
              {...register(`variants.${idx}.sku` as const)}
            />
            <Input
              placeholder="Nombre"
              {...register(`variants.${idx}.name` as const)}
            />
            <Input
              placeholder="Precio"
              type="number"
              step="0.01"
              {...register(`variants.${idx}.price` as const, {
                valueAsNumber: true,
              })}
            />
            <Input
              placeholder="Stock"
              type="number"
              {...register(`variants.${idx}.stock` as const, {
                valueAsNumber: true,
              })}
            />
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                {...register(
                  `variants.${idx}.is_available` as const,
                )}
                defaultChecked
              />
              Disponible
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => remove(idx)}
            >
              Quitar
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              sku: "",
              price: 0,
              is_available: true,
              stock: 0,
            })
          }
        >
          + Variante
        </Button>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {mode === "create" ? "Crear" : "Guardar"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={handleCancel}
        >
          Cancelar
        </Button>

        {mode === "edit" && initial?.id && (
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await deleteProduct(String(initial.id));
                router.push("/admin");
              });
            }}
          >
            Eliminar
          </Button>
        )}
      </div>
    </form>
  );
}
