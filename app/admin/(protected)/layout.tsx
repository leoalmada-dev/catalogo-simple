// Server Component — protege todo /admin excepto /admin/(public)/*
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin(); // redirige a /admin/login si no es admin
  return (
    <div className="min-h-screen p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="text-sm opacity-70">{user.email}</div>
      </header>
      {children}
    </div>
  );
}
