import Link from "next/link";
import { listProducts } from "@/app/admin/server-actions";
import { ImportCSVForm, ExportCSVButton } from "@/components/admin/CSVTools";

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
              <th className="p-2 text-center">Visible</th>
              <th className="p-2 text-right">Precio (min)</th>
              <th className="p-2 text-center">Variantes</th>
              <th className="p-2">Actualizado</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2 text-gray-500">{p.slug}</td>
                <td className="p-2 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                    p.visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {p.visible ? "Sí" : "No"}
                  </span>
                  <span className="ml-2 text-[11px] text-gray-500">({p.status})</span>
                </td>
                <td className="p-2 text-right">{p.min_price ?? "—"}</td>
                <td className="p-2 text-center">
                  {p.variants_available}/{p.variants_total}
                </td>
                <td className="p-2 text-gray-500">
                  {new Date(p.updated_at).toLocaleString()}
                </td>
                <td className="p-2 text-right">
                  <Link href={`/admin/products/${p.id}`} className="underline">Editar</Link>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="p-4 text-center text-gray-500" colSpan={7}>Sin productos aún</td></tr>
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
