import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { T_PROFILES } from "@/lib/db/tables";

const DEFAULT_ADMIN_ROLES = ["owner", "editor"];

type ProfileRoleRow = { role?: string } | null;

export async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/(public)/login");

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const byEmail = adminEmails.length > 0
    && user.email && adminEmails.includes(user.email.toLowerCase());

  let profileRole: string | null = null;
  try {
    const { data } = await supabase
      .from(T_PROFILES)
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle() as unknown as { data: ProfileRoleRow };
    profileRole = data?.role ?? null;
  } catch {
    profileRole = null;
  }

  const adminRoles = (process.env.ADMIN_ROLES ?? "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const accepted = adminRoles.length ? adminRoles : DEFAULT_ADMIN_ROLES;

  const hasAdminRole = profileRole && accepted.includes(profileRole.toLowerCase());
  if (!(byEmail || hasAdminRole)) redirect("/admin/(public)/login");

  return { user, role: profileRole ?? null };
}
