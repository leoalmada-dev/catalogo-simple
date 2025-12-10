// components/admin/ImageManager.tsx
"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Img = {
  id: string;
  name: string;
  path: string;
  url: string;
  alt: string | null;
  is_primary: boolean;
  position: number;
  variant_id: string | null;
};

function errorMessage(e: unknown, fallback = "Error") {
  if (e instanceof Error) return e.message;
  try {
    const maybe = e as { error?: string; message?: string };
    return maybe.error || maybe.message || fallback;
  } catch {
    return fallback;
  }
}

export function ImageManager({
  productId,
  variantId,
}: {
  productId: string;
  variantId?: string;
}) {
  const [items, setItems] = useState<Img[]>([]);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cleanVariantId =
    variantId && variantId !== "undefined" && variantId !== "null"
      ? variantId
      : undefined;

  const baseUrl = useMemo(() => {
    const v = cleanVariantId
      ? `?variant_id=${encodeURIComponent(cleanVariantId)}`
      : "";
    return `/api/admin/products/${productId}/images${v}`;
  }, [productId, cleanVariantId]);

  const refresh = useCallback(async () => {
    const res = await fetch(baseUrl, { method: "GET", cache: "no-store" });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        if (err?.error) msg += ` · ${err.error}`;
      } catch {
        // ignore
      }
      throw new Error(msg || "No se pudo listar las imágenes");
    }
    const json = (await res.json()) as { images: Img[] };
    setItems(json.images ?? []);
  }, [baseUrl]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        if (cleanVariantId) fd.append("variant_id", cleanVariantId);
        fd.append("file", file);

        const res = await fetch(
          `/api/admin/products/${productId}/images`,
          {
            method: "POST",
            body: fd,
          },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err?.error || `Error al subir ${file.name}`,
          );
        }
      }
      await refresh();
      toast.success("Imagen(es) subida(s)");
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Error al subir"));
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function makePrimary(img: Img) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/images/${img.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_primary: true }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error || "No se pudo marcar como principal",
        );
      }
      await refresh();
      toast.success("Marcada como principal");
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Error"));
    } finally {
      setBusy(false);
    }
  }

  async function saveAlt(img: Img, alt: string) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/images/${img.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alt }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error || "No se pudo actualizar el ALT",
        );
      }
      await refresh();
      toast.success("ALT guardado");
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Error al guardar ALT"));
    } finally {
      setBusy(false);
    }
  }

  async function remove(img: Img) {
    const confirmDelete = window.confirm(
      "¿Seguro que querés borrar esta imagen? Esta acción no se puede deshacer.",
    );
    if (!confirmDelete) return;

    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/images/${img.id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error || "No se pudo borrar la imagen",
        );
      }
      await refresh();
      toast.success("Imagen borrada");
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Error al borrar"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Uploader */}
      <div
        className="flex flex-wrap items-center gap-3"
        aria-busy={busy}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          onChange={(e) => void upload(e.target.files)}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          Subir imágenes
        </Button>
        <span className="text-xs text-neutral-500">
          PNG/JPG. Podés seleccionar varias a la vez.
        </span>
        {busy && (
          <span className="text-xs text-neutral-600">
            Procesando…
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((img) => (
          <ImageCard
            key={img.id}
            img={img}
            busy={busy}
            onDelete={() => remove(img)}
            onMakePrimary={() => makePrimary(img)}
            onSaveAlt={(alt) => saveAlt(img, alt)}
          />
        ))}

        {!items.length && (
          <p className="col-span-full text-sm text-neutral-500">
            Sin imágenes aún. Subí al menos una imagen para este
            producto.
          </p>
        )}
      </div>
    </div>
  );
}

function ImageCard({
  img,
  busy,
  onDelete,
  onMakePrimary,
  onSaveAlt,
}: {
  img: Img;
  busy: boolean;
  onDelete: () => void;
  onMakePrimary: () => void;
  onSaveAlt: (alt: string) => void;
}) {
  const [altValue, setAltValue] = useState(img.alt ?? "");

  const isVariantImage = Boolean(img.variant_id);

  const altChanged = altValue !== (img.alt ?? "");

  const altInputId = `alt-${img.id}`;

  return (
    <figure className="flex h-full flex-col rounded border bg-white p-2">
      <div className="relative aspect-square w-full overflow-hidden rounded bg-neutral-50">
        <Image
          src={img.url}
          alt={img.alt || img.name}
          fill
          sizes="200px"
          className="object-cover"
        />
        {img.is_primary && (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
            Principal
          </span>
        )}
        <span className="absolute right-2 top-2 rounded bg-white/80 px-2 py-0.5 text-[10px] text-neutral-700">
          {isVariantImage ? "Para variante" : "General"}
        </span>
      </div>

      <figcaption className="mt-2 flex flex-1 flex-col gap-2">
        <p className="truncate text-xs text-neutral-600">{img.name}</p>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={altInputId}
            className="text-[11px] font-medium text-neutral-700"
          >
            Texto alternativo (ALT)
          </label>
          <div className="flex items-center gap-2">
            <input
              id={altInputId}
              className="w-full rounded border px-2 py-1 text-xs"
              placeholder="Ej: Café en frasco de vidrio 170g"
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              disabled={busy}
            />
            <Button
              size="sm"
              className="h-8"
              onClick={() => onSaveAlt(altValue)}
              disabled={busy || !altChanged}
            >
              Guardar
            </Button>
          </div>
          <p className="text-[10px] text-neutral-500">
            El ALT se usa para accesibilidad y ayuda a identificar la
            variante en la página de producto.
          </p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={onMakePrimary}
            disabled={busy || img.is_primary}
          >
            Hacer principal
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={busy}
          >
            Borrar
          </Button>
        </div>
      </figcaption>
    </figure>
  );
}
