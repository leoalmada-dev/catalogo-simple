"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { uploadFromClient } from "@/lib/storage";
import { listImagesAction, deleteImageAction } from "@/app/admin/server-actions";
import { Button } from "@/components/ui/button";

export function ImageManager({ productId }: { productId: string }) {
  const [items, setItems] = useState<{name:string; path:string; url:string;}[]>([]);
  const refresh = async () => setItems(await listImagesAction(productId));

  useEffect(()=>{ refresh(); }, [productId]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    await uploadFromClient(productId, file);
    await refresh();
  };

  return (
    <div className="space-y-3">
      <input type="file" accept="image/*" onChange={onUpload} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(img => (
          <figure key={img.path} className="border rounded p-2">
            <div className="relative w-full aspect-square">
              <Image src={img.url} alt={img.name} fill sizes="200px" className="object-cover rounded" />
            </div>
            <figcaption className="text-xs mt-1 truncate">{img.name}</figcaption>
            <Button variant="destructive" className="mt-2 w-full" onClick={async()=>{
              await deleteImageAction(img.path); await refresh();
            }}>Borrar</Button>
          </figure>
        ))}
      </div>
    </div>
  );
}
