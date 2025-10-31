import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { T_PROFILES } from "@/lib/db/tables";

const DEFAULT_ADMIN_ROLES = ["owner", "editor"]; // tus roles válidos

export async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/(public)/login");

  // 1) por email (DEV)
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const byEmail = adminEmails.length > 0
    && user.email && adminEmails.includes(user.email.toLowerCase());

  // 2) por tabla de perfiles (owner/editor)
  let profileRole: string | null = null;
  try {
    const { data } = await supabase
      .from(T_PROFILES)
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    profileRole = (data as any)?.role ?? null;
  } catch { /* tabla/rls: dejamos null */ }

  const accepted = (process.env.ADMIN_ROLES ?? "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const adminRoles = accepted.length ? accepted : DEFAULT_ADMIN_ROLES;

  const hasAdminRole = profileRole && adminRoles.includes(profileRole.toLowerCase());

  if (!(byEmail || hasAdminRole)) redirect("/admin/(public)/login");
  return { user, role: profileRole ?? null };
}
