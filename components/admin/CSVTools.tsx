"use client";
import { useRef, useState, startTransition } from "react";
import { importCSVv2 } from "@/app/admin/server-actions";
import { Button } from "@/components/ui/button";

export function ImportCSVForm() {
  const ref = useRef<HTMLInputElement>(null);
  const [result, setResult] =
    useState<{ ok: number; fail: number; errors?: string[] } | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startTransition(async () => {
      const form = new FormData();
      form.append("file", file);
      const res = await importCSVv2(form);
      setResult(res);
      if (res?.errors?.length) console.warn("Errores de importación:", res.errors);
      if (ref.current) ref.current.value = "";
    });
  };

  return (
    <div className="flex items-center gap-3">
      <input ref={ref} type="file" accept=".csv" onChange={onChange} />
      {result && (
        <span className="text-sm">
          ✅ {result.ok} ok • {result.fail} con error {result.errors?.length ? `(ver consola)` : ""}
        </span>
      )}
    </div>
  );
}

export function ExportCSVButton() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => window.location.assign("/admin/export")}
    >
      Exportar CSV
    </Button>
  );
}
