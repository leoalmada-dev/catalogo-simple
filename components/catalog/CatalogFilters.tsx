'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Cat = { slug: string; name: string };

export default function CatalogFilters({ categories }: { categories: Cat[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [q, setQ]   = useState(params.get('q') ?? '');
  const [cat, setCat] = useState(params.get('category') ?? 'all');

  // Sincronizar si cambian los params por back/forward o enlaces
  useEffect(() => {
    setQ(params.get('q') ?? '');
    setCat(params.get('category') ?? 'all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function applyFilters(nextCategory?: string) {
    const next = new URLSearchParams();
    const qTrim = q.trim();

    if (qTrim.length >= 2) next.set('q', qTrim);
    const categoryToUse = (nextCategory ?? cat) || 'all';
    if (categoryToUse !== 'all') next.set('category', categoryToUse);

    // cada cambio de filtros resetea page
    next.set('page', '1');

    const url = `${pathname}${next.toString() ? `?${next.toString()}` : ''}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    applyFilters(); // aplica texto + categoría actual
  }

  function onClear() {
    setQ('');
    setCat('all');
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  function onCategoryChange(value: string) {
    setCat(value);
    applyFilters(value); // 👈 aplica al instante
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex w-full gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar productos… (mín. 2 letras)"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          aria-label="Buscar por texto"
        />
        <button
          type="submit"
          className="rounded-xl border px-4 py-2 text-sm bg-black text-white hover:opacity-90 disabled:opacity-60"
          aria-label="Aplicar filtros"
          disabled={isPending}
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border px-4 py-2 text-sm bg-white hover:bg-neutral-50"
          aria-label="Limpiar filtros"
        >
          Limpiar
        </button>
      </div>

      <select
        value={cat}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full sm:w-64 rounded-xl border px-3 py-2 text-sm"
        aria-label="Filtrar por categoría"
      >
        <option value="all">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      {isPending && <span className="text-xs text-neutral-500">Actualizando…</span>}
    </form>
  );
}
