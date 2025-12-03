'use client';

import { FormEvent, useMemo, useRef, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Cat = { slug: string; name: string };

export default function CatalogFilters({ categories }: { categories: Cat[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Leemos siempre desde la URL
  const qFromUrl = params.get('q') ?? '';
  const catFromUrl = params.get('category') ?? 'all';

  // Input de búsqueda NO controlado (sin estado) con defaultValue.
  // Usamos un key para remount cuando cambian los params → sincroniza back/forward sin efecto ni setState.
  const qInputRef = useRef<HTMLInputElement>(null);
  const qInputKey = useMemo(() => qFromUrl, [qFromUrl]);

  function applyFilters(nextQ?: string, nextCategory?: string) {
    const search = new URLSearchParams();
    const effectiveQ = (nextQ ?? qInputRef.current?.value ?? '').trim();
    const effectiveCat = (nextCategory ?? catFromUrl) || 'all';

    if (effectiveQ.length >= 2) search.set('q', effectiveQ);
    if (effectiveCat !== 'all') search.set('category', effectiveCat);

    // cada cambio de filtros resetea page
    search.set('page', '1');

    const url = `${pathname}${search.toString() ? `?${search.toString()}` : ''}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    applyFilters(); // usa el valor actual del input
  }

  function onClear() {
    if (qInputRef.current) qInputRef.current.value = '';
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  function onCategoryChange(value: string) {
    // Aplica al instante con el valor actual del input
    applyFilters(qInputRef.current?.value ?? '', value);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex w-full gap-2">
        <input
          key={qInputKey}
          ref={qInputRef}
          defaultValue={qFromUrl}
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
        value={catFromUrl}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-2 text-sm sm:w-64"
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
