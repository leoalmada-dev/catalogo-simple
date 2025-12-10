// components/admin/StatusToggle.tsx
"use client";

import { useOptimistic, useTransition } from "react";
import { setProductStatus } from "@/app/admin/server-actions";
import { toast } from "sonner";

type Status = "draft" | "published" | "archived";

const statusLabel = (s: Status) =>
  s === "published" ? "Publicado" : s === "draft" ? "Borrador" : "Archivado";

export default function StatusToggle({
  productId,
  value,
}: {
  productId: string;
  value: Status;
}) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic<Status>(value);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Status;

    startTransition(async () => {
      const prev = optimistic; // snapshot para rollback

      // ✅ actualización optimista dentro de la transición
      setOptimistic(next);

      try {
        await setProductStatus({ id: productId, status: next });
        toast.success(`Estado actualizado a ${statusLabel(next)}`);
      } catch (err: unknown) {
        // rollback si falla
        setOptimistic(prev);
        const msg =
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el estado";
        toast.error(msg);
      }
    });
  };

  const badgeClass =
    optimistic === "published"
      ? "bg-green-100 text-green-700"
      : optimistic === "draft"
        ? "bg-gray-100 text-gray-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${badgeClass} ${pending ? "opacity-70" : ""
          }`}
        aria-live="polite"
      >
        {optimistic === "published" ? "Visible" : statusLabel(optimistic)}
      </span>
      <select
        className="h-8 rounded border px-2 text-sm"
        value={optimistic}
        onChange={onChange}
        disabled={pending}
        aria-label="Cambiar estado"
        aria-busy={pending}
      >
        <option value="draft">Borrador</option>
        <option value="published">Publicado</option>
        <option value="archived">Archivado</option>
      </select>
    </div>
  );
}
