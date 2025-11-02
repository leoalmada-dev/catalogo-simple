export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getCategories, searchProducts } from '@/lib/data/catalog';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import ProductCard from '@/components/catalog/ProductCard';
import PaginationControls from '@/components/catalog/PaginationControls';
import EmptyState from '@/components/catalog/EmptyState';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

type SParams = Promise<{
  q?: string | string[];
  category?: string | string[];
  page?: string | string[];
}>;

function toStr(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function Home({ searchParams }: { searchParams: SParams }) {
  const sp = await searchParams; // Next 16: unwrap
  const q = toStr(sp.q);
  const category = toStr(sp.category) ?? 'all';
  const page = Number(toStr(sp.page) ?? '1');
  const perPage = 12;

  const [searchRes, categories] = await Promise.all([
    searchProducts({ q, category, page, perPage }),
    getCategories(),
  ]);

  const { items, total } = searchRes;
  const totalPages = Math.ceil(total / perPage) || 1;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Catálogo' }]} />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Catálogo</h1>
        <p className="text-sm text-neutral-600">Filtrá por categoría o buscá por texto.</p>
      </header>

      <CatalogFilters categories={categories} />

      {total === 0 ? (
        <EmptyState q={q} category={category} categories={categories} />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>

          <PaginationControls page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
