// app/admin/(protected)/page.tsx
import Link from "next/link";
import { listProducts } from "@/app/admin/server-actions";
import { ImportCSVForm, ExportCSVButton } from "@/components/admin/CSVTools";
import StatusToggle from "@/components/admin/StatusToggle";

type AdminListRow = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  visible: boolean;
  min_price: string | null;
  variants_total: number;
  variants_available: number;
  updated_at: string;
};

export default async function AdminHome() {
  const { rows } = await listProducts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Productos</h1>
        <div className="flex flex-wrap items-center gap-2">
          <ExportCSVButton />
          <Link
            href="/admin/products/new"
            className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Nuevo producto
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-sm">
          <caption className="sr-only">
            Listado de productos configurados en el catálogo
          </caption>
          <thead className="bg-neutral-50 text-left text-xs font-medium text-neutral-600">
            <tr>
              <th scope="col" className="px-3 py-2">
                Título
              </th>
              <th scope="col" className="px-3 py-2">
                Slug
              </th>
              <th scope="col" className="px-3 py-2">
                Estado
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Precio (min)
              </th>
              <th scope="col" className="px-3 py-2 text-center">
                Variantes
              </th>
              <th scope="col" className="px-3 py-2">
                Actualizado
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {(rows as AdminListRow[]).map((p) => (
              <tr
                key={p.id}
                className="border-t text-neutral-800 hover:bg-neutral-50"
              >
                <th
                  scope="row"
                  className="px-3 py-2 font-normal text-neutral-900"
                >
                  {p.name}
                </th>
                <td className="px-3 py-2 text-neutral-500">{p.slug}</td>
                <td className="px-3 py-2">
                  <StatusToggle productId={p.id} value={p.status} />
                </td>
                <td className="px-3 py-2 text-right">
                  {p.min_price ?? "—"}
                </td>
                <td className="px-3 py-2 text-center text-xs text-neutral-700">
                  {p.variants_available}/{p.variants_total}
                </td>
                <td className="px-3 py-2 text-neutral-500">
                  {new Date(p.updated_at).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-xs font-medium text-neutral-800 underline hover:text-neutral-600"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}/images`}
                      className="text-xs font-medium text-neutral-800 underline hover:text-neutral-600"
                    >
                      Imágenes
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {!rows.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-sm text-neutral-500"
                >
                  Sin productos aún. Creá tu primer producto con el botón{" "}
                  <span className="font-medium">“Nuevo producto”</span>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ImportCSVForm />
      </div>
    </div>
  );
}
