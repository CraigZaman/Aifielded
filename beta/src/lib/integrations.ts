import "server-only";
import { canManageIntegrations } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function integrationViewer() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, error: "Sign in required." } as const;
  const { data: membership } = await supabase.from("organisation_memberships").select("organisation_id,role").eq("user_id", auth.user.id).eq("status", "active").limit(1).maybeSingle();
  if (!membership || !canManageIntegrations(membership.role)) return { supabase, error: "Workspace owner or manager access required." } as const;
  return { supabase, user: auth.user, membership } as const;
}
