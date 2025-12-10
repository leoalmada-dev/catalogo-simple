// app/admin/(protected)/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import AdminUserBar from "@/components/admin/AdminUserBar";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/admin"
            className="rounded text-sm font-medium text-neutral-800 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Ir al listado principal del panel de administración"
          >
            Panel de administración
          </Link>

          <AdminUserBar email={user.email ?? null} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
