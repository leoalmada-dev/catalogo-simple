// components/catalog/CatalogFilters.tsx
"use client";

import { FormEvent, useMemo, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Cat = { slug: string; name: string };

export default function CatalogFilters({ categories }: { categories: Cat[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const qFromUrl = params.get("q") ?? "";
  const catFromUrl = params.get("category") ?? "all";

  const qInputRef = useRef<HTMLInputElement>(null);
  const qInputKey = useMemo(() => qFromUrl, [qFromUrl]);

  const hasActiveFilters =
    qFromUrl.trim().length > 0 || catFromUrl !== "all";

  function applyFilters(nextQ?: string, nextCategory?: string) {
    const search = new URLSearchParams();

    // Usamos el texto tal cual lo escribe la persona (con o sin tilde)
    const rawQ = (nextQ ?? qInputRef.current?.value ?? "").trim();
    const effectiveCat = (nextCategory ?? catFromUrl) || "all";

    if (rawQ.length >= 2) {
      search.set("q", rawQ);
    }

    if (effectiveCat !== "all") {
      search.set("category", effectiveCat);
    }

    // siempre resetea a la página 1
    search.set("page", "1");

    const url = `${pathname}${search.toString() ? `?${search.toString()}` : ""
      }`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    applyFilters();
  }

  function onClear() {
    if (!hasActiveFilters) return;
    if (qInputRef.current) qInputRef.current.value = "";
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  function onCategoryChange(value: string) {
    applyFilters(qInputRef.current?.value ?? "", value);
  }

  return (
    <section
      className="space-y-1.5"
      aria-label="Filtros del catálogo de productos"
    >
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        role="search"
      >
        {/* Búsqueda por texto */}
        <div className="flex w-full gap-2">
          <input
            key={qInputKey}
            ref={qInputRef}
            name="q"
            defaultValue={qFromUrl}
            placeholder="Buscar productos…"
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Buscar productos por texto"
            autoComplete="off"
          />

          <button
            type="submit"
            className="rounded-xl border bg-black px-4 py-2 text-sm text-white shadow-xs transition hover:opacity-90 disabled:opacity-60"
            aria-label="Aplicar filtros de búsqueda"
            disabled={isPending}
          >
            Buscar
          </button>

          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border bg-white px-4 py-2 text-sm shadow-xs transition hover:bg-neutral-50 disabled:opacity-40"
            aria-label="Limpiar filtros y volver al catálogo completo"
            disabled={isPending || !hasActiveFilters}
          >
            Limpiar
          </button>
        </div>

        {/* Filtro por categoría */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label htmlFor="category-select" className="sr-only">
            Filtrar por categoría
          </label>

          <select
            id="category-select"
            name="category"
            value={catFromUrl}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-64"
            aria-label="Filtrar por categoría"
            disabled={isPending && categories.length === 0}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Indicador de actualización SIN mover el select */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="min-h-[1rem]"
      >
        {isPending && (
          <p className="text-xs text-neutral-500">
            Actualizando resultados…
          </p>
        )}
      </div>
    </section>
  );
}
