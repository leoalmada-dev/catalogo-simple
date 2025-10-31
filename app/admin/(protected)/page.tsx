import Link from "next/link";
import { listProducts } from "@/app/admin/server-actions";
import { ImportCSVForm, ExportCSVButton } from "@/components/admin/CSVTools";
import StatusToggle from "@/components/admin/StatusToggle";

export default async function AdminHome() {
  const { rows } = await listProducts();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Productos</h1>
        <div className="flex items-center gap-2">
          <ExportCSVButton />
          <Link href="/admin/products/new" className="px-3 py-2 rounded bg-black text-white">
            Nuevo producto
          </Link>
        </div>
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-2">Título</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Estado</th>
              <th className="p-2 text-right">Precio (min)</th>
              <th className="p-2 text-center">Variantes</th>
              <th className="p-2">Actualizado</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2 text-gray-500">{p.slug}</td>
                <td className="p-2">
                  <StatusToggle productId={p.id} value={p.status} />
                </td>
                <td className="p-2 text-right">{p.min_price ?? "—"}</td>
                <td className="p-2 text-center">
                  {p.variants_available}/{p.variants_total}
                </td>
                <td className="p-2 text-gray-500">{new Date(p.updated_at).toLocaleString()}</td>
                <td className="p-2 text-right">
  <Link href={`/admin/products/${p.id}`} className="underline mr-3">Editar</Link>
  <Link href={`/admin/products/${p.id}/images`} className="underline">Imágenes</Link>
</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">Sin productos aún</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Importar CSV</span>
        <ImportCSVForm />
      </div>
    </div>
  );
}
