// app/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getCategories, searchProducts } from '@/lib/data/catalog';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import ProductCard from '@/components/catalog/ProductCard';

type SParams = Promise<{
  q?: string | string[];
  category?: string | string[];
  page?: string | string[];
}>;

function toStr(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function Home({ searchParams }: { searchParams: SParams }) {
  const sp = await searchParams; // 👈 obligatorio en Next 16
  const q = toStr(sp.q);
  const category = toStr(sp.category) ?? 'all';
  const page = Number(toStr(sp.page) ?? '1');

  const [{ items, total }, categories] = await Promise.all([
    searchProducts({ q, category, page }),
    getCategories(),
  ]);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Catálogo</h1>
        <p className="text-sm text-neutral-600">Filtrá por categoría o buscá por texto.</p>
      </header>

      <CatalogFilters categories={categories} />

      {total === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-neutral-600">
          No se encontraron productos con los filtros aplicados.
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>
      )}
    </div>
  );
}
