// lib/auth.ts
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { T_PROFILES } from "@/lib/db/tables";

const DEFAULT_ADMIN_ROLES = ["owner", "editor"];
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

type ProfileRoleRow = { role?: string } | null;

export async function requireAdmin() {
  const cookieStore = await cookies();

  // 1) TTL por cookie: si no existe o está vencida, forzamos login
  const lastLoginRaw = cookieStore.get("admin_last_login")?.value;
  const lastLoginTs = lastLoginRaw ? Number(lastLoginRaw) : NaN;

  if (!Number.isFinite(lastLoginTs)) {
    redirect("/admin/login");
  }

  const now = Date.now();
  if (now - lastLoginTs > ADMIN_SESSION_TTL_MS) {
    redirect("/admin/login");
  }

  // 2) Validación de usuario y rol en Supabase
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const byEmail =
    adminEmails.length > 0 &&
    user.email &&
    adminEmails.includes(user.email.toLowerCase());

  let profileRole: string | null = null;
  try {
    const { data } = (await supabase
      .from(T_PROFILES)
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()) as unknown as { data: ProfileRoleRow };
    profileRole = data?.role ?? null;
  } catch {
    profileRole = null;
  }

  const adminRoles = (process.env.ADMIN_ROLES ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const accepted = adminRoles.length ? adminRoles : DEFAULT_ADMIN_ROLES;

  const hasAdminRole =
    !!profileRole && accepted.includes(profileRole.toLowerCase());

  if (!(byEmail || hasAdminRole)) {
    redirect("/admin/login");
  }

  return { user, role: profileRole ?? null };
}
