// app/admin/(protected)/layout.tsx
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

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
          <p className="text-sm font-medium text-neutral-800">
            Panel de administración
          </p>
          <div className="text-xs text-neutral-600">{user.email}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
