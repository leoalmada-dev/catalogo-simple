// Server Component — protege todo /admin excepto /admin/(public)/*
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner"; // <- agrega esta línea

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="min-h-screen p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="text-sm opacity-70">{user.email}</div>
      </header>
      {children}
      <Toaster richColors position="top-right" /> {/* <- y esta */}
    </div>
  );
}
