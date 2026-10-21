import { cache } from "react";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Viewer } from "@/lib/types";

export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError && ![400, 401, 403].includes(authError.status || 0)) {
    throw new Error("Sign-in status could not be checked. Please try again.");
  }
  if (!auth.user || !auth.user.email_confirmed_at) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("organisation_memberships")
    .select("role, organisation_id, organisations!organisation_memberships_organisation_id_fkey(name)")
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) throw new Error("Workspace access could not be checked. Please try again.");
  if (!membership) return null;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (profileError) throw new Error("Your profile could not be loaded. Please try again.");
  const organisation = membership.organisations as unknown as { name: string } | null;
  if (!organisation) throw new Error("Your workspace could not be loaded. Please try again.");

  return {
    id: auth.user.id,
    email: auth.user.email || "",
    name: profile?.full_name || auth.user.user_metadata?.full_name || "Member",
    organisationId: membership.organisation_id,
    organisationName: organisation.name,
    role: membership.role,
  };
});

export async function requireViewer() {
  if (!hasSupabaseEnv()) redirect("/setup");
  const viewer = await getViewer();
  if (!viewer) redirect("/onboarding");
  return viewer;
}

export function canManage(role: Viewer["role"]) {
  switch (role) {
    case "owner":
    case "manager":
    case "hr":
    case "consultant":
      return true;
    default:
      return false;
  }
}

export function canManagePeople(role: Viewer["role"]) {
  return role === "owner" || role === "manager" || role === "hr";
}

export function canManageIntegrations(role: Viewer["role"]) {
  return role === "owner" || role === "manager";
}
