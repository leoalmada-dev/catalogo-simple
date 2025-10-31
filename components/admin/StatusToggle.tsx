"use client";
import { useOptimistic, useTransition } from "react";
import { setProductStatus } from "@/app/admin/server-actions";

type Status = "draft" | "published" | "archived";

export default function StatusToggle({
  productId,
  value,
}: {
  productId: string;
  value: Status;
}) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(value);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Status;
    setOptimistic(next);
    start(async () => {
      await setProductStatus({ id: productId, status: next });
    });
  };

  const badge =
    optimistic === "published"
      ? "bg-green-100 text-green-700"
      : optimistic === "draft"
      ? "bg-gray-100 text-gray-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${badge}`}>
        {optimistic === "published" ? "Visible" : optimistic === "draft" ? "Borrador" : "Archivado"}
      </span>
      <select
        className="h-8 border rounded px-2 text-sm"
        value={optimistic}
        onChange={onChange}
        disabled={pending}
        aria-label="Cambiar estado"
      >
        <option value="draft">Borrador</option>
        <option value="published">Publicado</option>
        <option value="archived">Archivado</option>
      </select>
    </div>
  );
}
