'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';

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
    if (to <= 1) next.delete('page');
    else next.set('page', String(to));

    const url = `${pathname}${next.toString() ? `?${next.toString()}` : ''}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={!canPrev || isPending}
        className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50 bg-white hover:bg-neutral-50"
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      <span className="text-xs text-neutral-600">
        Página <strong>{page}</strong> de <strong>{Math.max(totalPages, 1)}</strong>
      </span>

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={!canNext || isPending}
        className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50 bg-white hover:bg-neutral-50"
        aria-label="Página siguiente"
      >
        Siguiente →
      </button>
    </div>
  );
}
