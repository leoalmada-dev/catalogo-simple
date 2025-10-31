import { requireAdmin } from "@/lib/auth";
import { exportCSVv2 } from "@/app/admin/server-actions";

export const dynamic = "force-dynamic";
export async function GET() {
  await requireAdmin();
  const csv = await exportCSVv2();
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="catalogo-export-v2.csv"`,
    },
  });
}
