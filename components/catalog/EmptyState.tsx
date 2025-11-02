import Link from 'next/link';

type Cat = { slug: string; name: string };

export default function EmptyState({
  q,
  category,
  categories,
}: {
  q?: string | null;
  category?: string | null;
  categories: Cat[];
}) {
  const topCats = categories.slice(0, 6); // muestra algunas categorías como atajos

  return (
    <div className="rounded-2xl border bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <span className="text-2xl" aria-hidden>🧭</span>
      </div>

      <h2 className="text-lg font-semibold">No encontramos resultados</h2>
      <p className="mt-1 text-sm text-neutral-600">
        {q ? <>Probá acotar o cambiar tu búsqueda.</> : <>Probá ajustar los filtros.</>}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-neutral-50"
        >
          Limpiar filtros
        </Link>
        <Link
          href="/?category=all"
          className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Ver todo el catálogo
        </Link>
      </div>

      {topCats.length > 0 && (
        <>
          <p className="mt-6 text-xs uppercase tracking-wide text-neutral-500">
            Explorar categorías
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {topCats.map(c => (
              <Link
                key={c.slug}
                href={`/?category=${encodeURIComponent(c.slug)}`}
                className="rounded-full border bg-white px-3 py-1 text-xs hover:bg-neutral-50"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
