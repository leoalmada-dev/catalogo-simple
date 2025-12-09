// components/catalog/PaginationControls.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function PaginationControls({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const canPrev = page > 1;
  const canNext = page < totalPages;

  function go(to: number) {
    const next = new URLSearchParams(params.toString());
    if (to <= 1) next.delete("page");
    else next.set("page", String(to));

    const url = `${pathname}${next.toString() ? `?${next.toString()}` : ""}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  return (
    <nav
      className="mt-2 flex items-center justify-between gap-3"
      aria-label="Paginación de resultados"
      aria-busy={isPending}
    >
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={!canPrev || isPending}
        aria-disabled={!canPrev || isPending}
        className="rounded-xl border bg-white px-3 py-2 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      <p
        className="text-xs text-neutral-600"
        aria-live="polite"
        aria-atomic="true"
      >
        Página <strong>{page}</strong> de{" "}
        <strong>{Math.max(totalPages, 1)}</strong>
      </p>

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={!canNext || isPending}
        aria-disabled={!canNext || isPending}
        className="rounded-xl border bg-white px-3 py-2 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Página siguiente"
      >
        Siguiente →
      </button>
    </nav>
  );
}
