// app/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import type { Metadata } from 'next';
import {
  getCategories,
  ProductPublic,
  searchProducts,
} from "@/lib/data/catalog";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import ProductCard from "@/components/catalog/ProductCard";
import PaginationControls from "@/components/catalog/PaginationControls";
import EmptyState from "@/components/catalog/EmptyState";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: 'Pantera Mini Mayorista – Productos de higiene y limpieza',
  description:
    'Pantera Mini Mayorista: catálogo online de productos de higiene y limpieza para comprar por mayor. Pedí tus productos y coordiná por WhatsApp.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pantera Mini Mayorista – Productos de higiene y limpieza',
    description:
      'Catálogo online Pantera Mini Mayorista. Encontrá productos de limpieza e higiene, y pedí por mayor coordinando por WhatsApp.',
    url: '/',
  },
};

type SParams = Promise<{
  q?: string | string[];
  category?: string | string[];
  page?: string | string[];
}>;

function toStr(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function Home({
  searchParams,
}: {
  searchParams: SParams;
}) {
  const sp = await searchParams; // Next 16: unwrap
  const q = toStr(sp.q);
  const category = toStr(sp.category) ?? "all";
  const page = Number(toStr(sp.page) ?? "1");
  const perPage = 12;

  const [searchRes, categories] = await Promise.all([
    searchProducts({ q, category, page, perPage }),
    getCategories(),
  ]);

  const { items, total } = searchRes;
  const totalPages = Math.ceil(total / perPage) || 1;

  const hasFilters =
    (q && q.trim().length > 0) || (category && category !== "all");

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: "Catálogo" }]}
      />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Catálogo</h1>
        <p
          className="text-xs text-neutral-500"
          aria-live="polite"
          aria-atomic="true"
        >
          {total > 0 ? (
            <>
              Mostrando {items.length} de {total} producto
              {total !== 1 ? "s" : ""}.
            </>
          ) : hasFilters ? (
            <>No se encontraron productos con los filtros actuales.</>
          ) : (
            <>No hay productos para mostrar todavía.</>
          )}
        </p>
      </header>

      <CatalogFilters categories={categories} />

      {total === 0 ? (
        <EmptyState q={q} category={category} categories={categories} />
      ) : (
        <>
          <section
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            aria-label="Resultados del catálogo"
          >
            {items.map((p: ProductPublic) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>

          <PaginationControls page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
