import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AudienceDepartment, AudienceMember } from "@/lib/audience";

export type PublishingRule = {
  allowed: boolean;
  audience_scope?: "department" | "organisation";
  approval?: "none" | "owner" | "head_then_owner";
  visibility?: "owners" | "department" | "management";
  revision?: number;
  direct_department?:string|null;
};

export async function getPublishingRule(workspace: string, kind: "mission" | "policy") {
  const db = await createClient();
  const { data, error } = await db.rpc("my_publishing_rule", { workspace, publication_kind: kind });
  if (error || !data) throw new Error("Publishing permissions could not be checked.");
  return data as PublishingRule;
}

export async function getPublishingDirectory(workspace: string, kind: "mission" | "policy") {
  const db = await createClient();
  const { data, error } = await db.rpc("publishing_directory", { workspace, publication_kind: kind });
  if (error || !data) throw new Error("Your permitted recipients could not be loaded.");
  return data as { members: AudienceMember[]; departments: AudienceDepartment[]; rule: PublishingRule };
}

export async function getOperationalDirectory(workspace: string) {
  const rule = await getPublishingRule(workspace, "mission");
  if (!rule.allowed) return { members: [], departments: [] };
  return getPublishingDirectory(workspace, "mission");
}

export const approvalLabels = { none: "No approval required", owner: "Owner approval", head_then_owner: "Department head, then owner" };
export const visibilityLabels = { owners: "Workspace owners", department: "Department management and appointed head", management: "Workspace management" };
