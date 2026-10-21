import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requirePlatformAdmin() {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) redirect("/sign-in?next=%2Fops");
  const { data, error } = await supabase.rpc("is_platform_admin");
  if (error) {
    console.error("Platform admin access check failed", { code: error.code });
    redirect("/ops/access?state=unavailable");
  }
  if (data !== true) redirect("/ops/access");
  return auth.user;
}
