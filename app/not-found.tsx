export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getCategories } from '@/lib/data/catalog';

export default async function NotFound() {
  // Sugerimos algunas categorías para reencauzar al usuario
  let categories: { slug: string; name: string }[] = [];
  try {
    categories = await getCategories();
  } catch {
    // si falla Supabase, seguimos con UI básica
  }
  const suggest = categories.slice(0, 8);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="space-y-6 rounded-2xl border bg-white p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <span className="text-2xl" aria-hidden>
            🔎
          </span>
        </div>

        <h1 className="text-2xl font-semibold">Página no encontrada</h1>
        <p className="text-sm text-neutral-600">
          El enlace puede estar roto o la página ya no existe.
        </p>

        {/* Búsqueda rápida hacia el catálogo */}
        <form action="/" method="get" className="mx-auto mt-2 flex max-w-md gap-2">
          <input
            name="q"
            placeholder="Buscar productos…"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            aria-label="Buscar en el catálogo"
          />
          <button
            type="submit"
            className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-neutral-50"
          >
            ← Volver al inicio
          </Link>
          <Link
            href="/?category=all"
            className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Ver todo el catálogo
          </Link>
        </div>

        {suggest.length > 0 && (
          <>
            <p className="mt-4 text-xs uppercase tracking-wide text-neutral-500">
              Explorar categorías
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {suggest.map((c) => (
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
    </main>
  );
}
