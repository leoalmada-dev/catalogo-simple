"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { uploadImageAction, listImagesAction, deleteImageAction } from "@/app/admin/server-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Img = { id: string; name: string; path: string; url: string };

export function ImageManager({ productId }: { productId: string }) {
  const [items, setItems] = useState<Img[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const list = await listImagesAction(productId);
    setItems(list as Img[]);
  }, [productId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await uploadImageAction(productId, form);
      await refresh();
      toast.success("Imagen subida");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo subir la imagen";
      toast.error(msg);
    } finally {
      setBusy(false);
      if (e.target) e.target.value = "";
    }
  };

  const onDelete = async (img: Img) => {
    setBusy(true);
    try {
      await deleteImageAction(img.id);
      await refresh();
      toast.success("Imagen borrada");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo borrar la imagen";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input type="file" accept="image/*" onChange={onUpload} disabled={busy} />
        {busy && <span className="text-sm opacity-70">Procesando…</span>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((img) => (
          <figure key={img.id} className="border rounded p-2">
            <div className="relative w-full aspect-square">
              <Image src={img.url} alt={img.name} fill sizes="200px" className="object-cover rounded" />
            </div>
            <figcaption className="text-xs mt-1 truncate">{img.name}</figcaption>
            <Button
              variant="destructive"
              className="mt-2 w-full"
              onClick={() => onDelete(img)}
              disabled={busy}
            >
              Borrar
            </Button>
          </figure>
        ))}
        {!items.length && <p className="col-span-full text-sm text-gray-500">Sin imágenes aún.</p>}
      </div>
    </div>
  );
}
