import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceAccess = {
  active: boolean; plan: "startup" | "sme" | "enterprise";
  state: "trial" | "tester" | "paid" | "expired";
  ends_at: string; seats: number; used_seats: number;
  ai_limit: number; ai_used: number;
};
export const getWorkspaceAccess = cache(async (workspace: string): Promise<WorkspaceAccess> => {
  const db = await createClient();
  const result = await db.rpc("workspace_commercial_status", { workspace });
  if (result.error || !result.data) throw new Error("Workspace access could not be checked. Please retry shortly.");
  return result.data as WorkspaceAccess;
});
