"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { requireViewer } from "@/lib/auth";
import { getCompanyAccess } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { tryDispatchWorkNotifications } from "@/lib/work-notifications";

export type PublishingActionState = { error: string | null; success?: string };

export async function savePublishingPermission(_state: PublishingActionState, form: FormData): Promise<PublishingActionState> {
  const viewer = await requireViewer();
  if ((await getCompanyAccess(viewer.organisationId)).access < 2) return { error: "Access administration is not enabled for this account." };
  const parsed = z.object({ person: z.string().uuid(), kind: z.enum(["mission", "policy"]), allowed: z.enum(["true", "false"]), scope: z.enum(["department", "organisation"]), approval: z.enum(["none", "owner", "head_then_owner"]), visibility: z.enum(["owners", "department", "management"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Review all the permission settings." };
  const p = parsed.data;
  const db = await createClient();
  const result = await db.rpc("set_publishing_permission", { workspace: viewer.organisationId, person: p.person, publication_kind: p.kind, can_publish: p.allowed === "true", recipient_scope: p.scope, approval_sequence: p.approval, result_visibility: p.visibility });
  if (result.error) return { error: "Permissions could not be saved. Check the member still has active access." };
  revalidatePath("/app", "layout");
  return { error: null, success: "Publishing permissions saved. Existing mission visibility is unchanged; pending requests must still match the current rule." };
}

export async function reviewPublication(_state: PublishingActionState, form: FormData): Promise<PublishingActionState> {
  const viewer = await requireViewer();
  const parsed = z.object({ id: z.string().uuid(), decision: z.enum(["approve", "reject"]), note: z.string().max(1000) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Choose a decision and keep the note under 1,000 characters." };
  const db = await createClient();
  const result = await db.rpc("decide_publication", { request_id: parsed.data.id, approve: parsed.data.decision === "approve", note: parsed.data.note });
  if (result.error) return { error: "The decision was not applied. Check the approval step, current permissions and active recipients. If the team or permissions changed, decline this request and ask the author to submit a fresh one." };
  if (result.data === "published") after(() => tryDispatchWorkNotifications(viewer.organisationId));
  revalidatePath("/app", "layout");
  return { error: null, success: result.data === "published" ? "Approved and assigned to the reviewed recipients." : result.data === "pending_owner" ? "Head review complete. Waiting for the owner." : "Request declined. No discussions were assigned." };
}

export async function saveMissionVisibility(_state: PublishingActionState, form: FormData): Promise<PublishingActionState> {
  const viewer = await requireViewer();
  if (viewer.role !== "owner") return { error: "Only the owner can change mission visibility." };
  const parsed = z.object({ mission: z.string().uuid(), scope: z.enum(["owners", "department", "management"]), department: z.union([z.string().uuid(), z.literal("")]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Choose a visibility level and department where required." };
  const db = await createClient();
  const result = await db.rpc("set_mission_visibility", { target_mission: parsed.data.mission, result_scope: parsed.data.scope, target_department: parsed.data.department || null });
  if (result.error) return { error: "Visibility could not be saved. Use the original mission and an existing department." };
  revalidatePath("/app", "layout");
  return { error: null, success: "Mission intelligence visibility updated, including linked follow-up discussions." };
}
