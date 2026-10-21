"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { appUrl } from "@/lib/env";
import { sendWorkspaceInvitationEmail } from "@/lib/email";
import { canManage, canManagePeople, requireViewer } from "@/lib/auth";
import { BUSINESS_ROLE_VALUES, DEPARTMENT_VALUES } from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/server";
import { processApprovedAssignment } from "@/lib/mission-analysis";
import { tryDispatchWorkNotifications } from "@/lib/work-notifications";
import { audienceSchema } from "@/lib/audience";
import { getPublishingRule } from "@/lib/publishing";

const missionSchema = z.object({
  requestId: z.string().uuid(),
  title: z.string().trim().min(4).max(120),
  objective: z.string().trim().min(20).max(2000),
  context: z.string().max(4000).optional(),
  desiredOutcome: z.string().trim().min(8).max(1000),
  departments: z.string().max(500).optional(),
  participantIds: z.array(z.string().uuid()).max(200),
  audience: audienceSchema,
});
export type MissionLaunchState = { error: string | null };

function digest(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function createMission(_previous: MissionLaunchState, formData: FormData): Promise<MissionLaunchState> {
  const viewer = await requireViewer();
  const publishingRule = await getPublishingRule(viewer.organisationId, "mission");
  if (!publishingRule.allowed) return { error: "The workspace owner has not enabled mission creation for this account." };
  const parsed = missionSchema.safeParse({
    requestId: formData.get("requestId"),
    title: formData.get("title"),
    objective: formData.get("objective"),
    context: formData.get("context") || undefined,
    desiredOutcome: formData.get("desiredOutcome"),
    departments: formData.get("departments") || undefined,
    participantIds: formData.getAll("participantId"),
    audience: { mode: formData.get("audienceMode") || "individuals", departmentKeys: formData.getAll("audienceDepartment") },
  });
  if (!parsed.success) return { error: "Complete the mission brief and choose no more than 200 participants." };

  const supabase = await createClient();
  if (viewer.role !== "owner") {
    const p = parsed.data;
    const result = await supabase.rpc("submit_publication", {
      request_id: p.requestId, workspace: viewer.organisationId, publication_kind: "mission",
      body: { title: p.title, objective: p.objective, context: p.context || "", desiredOutcome: p.desiredOutcome },
      audience_mode: p.audience.mode, department_keys: p.audience.departmentKeys, individual_ids: [...new Set(p.participantIds)],
    });
    if (result.error || !result.data) return { error: "The request could not be submitted. Check your publishing scope and choose 1 to 200 active recipients. Your brief is still here." };
    if (result.data.status === "published") after(() => tryDispatchWorkNotifications(viewer.organisationId));
    revalidatePath("/app", "layout");
    redirect(`/app/publishing/${result.data.id}`);
  }
  const token = crypto.randomBytes(24).toString("base64url");
  const { data, error } = await supabase.rpc("launch_mission_targeted", {
    requested_mission_id: parsed.data.requestId,
    workspace_id: viewer.organisationId,
    mission_title: parsed.data.title,
    mission_objective: parsed.data.objective,
    mission_context: parsed.data.context || null,
    mission_outcome: parsed.data.desiredOutcome,
    mission_departments: parsed.data.departments ? parsed.data.departments.split(",").map(item => item.trim()).filter(Boolean) : [],
    individual_ids: [...new Set(parsed.data.participantIds)],
    audience_mode: parsed.data.audience.mode,
    department_keys: parsed.data.audience.departmentKeys,
    invitation_digest: digest(token),
  });
  if (error || !data) return { error: "The mission could not be launched. Your brief is still here. Check that selected employees have active workspace access, then try again." };
  after(() => tryDispatchWorkNotifications(viewer.organisationId));
  revalidatePath("/app", "layout");
  const result = data as { mission_id: string; created: boolean };
  redirect(result.created ? `/app/missions/${result.mission_id}?invite=${encodeURIComponent(`${appUrl()}/join/${token}`)}` : `/app/missions/${result.mission_id}`);
}

export async function createMissionInvite(formData: FormData) {
  const viewer = await requireViewer();
  if (!canManage(viewer.role)) throw new Error("Not authorised.");
  const missionId = z.string().uuid().parse(formData.get("missionId"));
  const token = crypto.randomBytes(24).toString("base64url");
  const supabase = await createClient();
  const { error } = await supabase.from("invitations").insert({
    organisation_id: viewer.organisationId,
    mission_id: missionId,
    created_by: viewer.id,
    role: "participant",
    token_digest: digest(token),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  });
  if (error) redirect(`/app/missions/${missionId}?message=${encodeURIComponent(error.message)}`);
  redirect(`/app/missions/${missionId}?invite=${encodeURIComponent(`${appUrl()}/join/${token}`)}`);
}

export async function createWorkspaceInvite(formData: FormData) {
  const viewer = await requireViewer();
  const db = await createClient();
  const allowed = await db.rpc("can_invite_team", { workspace: viewer.organisationId });
  if (allowed.error || !allowed.data) throw new Error("Team invitations are not enabled for this account.");
  const role = z.enum(["manager", "hr", "participant", "consultant"]).parse(formData.get("role"));
  if (viewer.role !== "owner" && role !== "participant") throw new Error("This account can invite employees using the fixed employee preset.");
  const department = z.union([z.string().uuid(), z.literal("")]).parse(formData.get("departmentId") || "");
  const manager = z.union([z.string().uuid(), z.literal("")]).parse(formData.get("managerId") || "");
  const email = z.string().email().parse(formData.get("email"));
  const token = crypto.randomBytes(24).toString("base64url");
  const supabase = await createClient();
  const { error } = await supabase.from("invitations").insert({
    organisation_id: viewer.organisationId,
    created_by: viewer.id,
    role,
    department_id: department || null,
    reports_to: manager || null,
    invited_email: email,
    max_uses: 1,
    token_digest: digest(token),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  });
  if (error) redirect(`/app/people?message=${encodeURIComponent(error.message)}`);
  const inviteUrl = `${appUrl()}/join/${token}`;
  const accessLabels = { manager: "Manager", hr: "HR and People", participant: "Employee", consultant: "Consultant" } as const;
  const delivery = await sendWorkspaceInvitationEmail({
    to: email,
    organisationName: viewer.organisationName,
    inviterName: viewer.name,
    accessLabel: accessLabels[role],
    inviteUrl,
  });
  const status = delivery.sent ? `Email provider accepted the invitation to ${email}.` : delivery.reason === "not_configured" ? "Invitation created. Email delivery is not connected yet; share the secure link below." : "Invitation created, but email delivery could not be confirmed. Share the secure link below.";
  redirect(`/app/people?invite=${encodeURIComponent(inviteUrl)}&message=${encodeURIComponent(status)}`);
}

export async function updateMemberAccess(formData: FormData) {
  const viewer = await requireViewer();
  const accessDb = await createClient();
  const allowed = await accessDb.rpc("can_admin_memberships", { workspace_id: viewer.organisationId });
  if (allowed.error || !allowed.data) throw new Error("People and access administration are required to change working access.");
  const parsed = z.object({
    membershipId: z.string().uuid(),
    role: z.enum(["manager", "hr", "participant", "consultant"]),
    status: z.enum(["active", "suspended"]),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/app/people?message=Choose+a+valid+access+level.");

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("organisation_memberships")
    .select("id,user_id,role")
    .eq("id", parsed.data.membershipId)
    .eq("organisation_id", viewer.organisationId)
    .maybeSingle();
  if (!membership || membership.role === "owner" || membership.user_id === viewer.id) throw new Error("This membership cannot be changed here.");
  if (viewer.role !== "owner" && (membership.role === "manager" || parsed.data.role === "manager")) throw new Error("Only the workspace owner can manage manager access.");

  const { error } = await supabase
    .from("organisation_memberships")
    .update({ role: parsed.data.role, status: parsed.data.status })
    .eq("id", membership.id)
    .eq("organisation_id", viewer.organisationId);
  if (error) redirect(`/app/people?message=${encodeURIComponent(error.message)}`);
  await supabase.from("audit_events").insert({
    organisation_id: viewer.organisationId,
    actor_id: viewer.id,
    action: "membership.access_updated",
    entity_type: "membership",
    entity_id: membership.id,
    metadata: { role: parsed.data.role, status: parsed.data.status },
  });
  revalidatePath("/app", "layout");
}

export async function acceptInvitation(formData: FormData) {
  const token = z.string().min(20).parse(formData.get("token"));
  const profile = z.object({
    fullName: z.string().min(2).max(80),
    businessRole: z.enum(BUSINESS_ROLE_VALUES),
    department: z.enum(DEPARTMENT_VALUES),
  }).safeParse(Object.fromEntries(formData));
  if (!profile.success) redirect(`/join/${token}?message=Complete+your+work+profile+to+join.`);
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?next=${encodeURIComponent(`/join/${token}`)}`);
  if (formData.get("accountId") !== auth.user.id) {
    redirect(`/join/${token}?message=Your+signed-in+account+changed.+Check+the+account+shown+and+try+again.`);
  }
  // Reject invalid, expired or wrong-account invitations before changing any profile.
  const { data, error } = await supabase.rpc("accept_invitation", { raw_token: token });
  if (error) redirect(`/join/${token}?message=${encodeURIComponent(error.message)}`);
  const { error: profileError } = await supabase.from("profiles").update({
    full_name: profile.data.fullName,
    business_role: profile.data.businessRole,
    department: profile.data.department,
  }).eq("id", auth.user.id);
  if (profileError) redirect("/app/settings?message=Invitation+accepted,+but+your+profile+could+not+be+updated.+Please+check+your+name.");
  revalidatePath("/app", "layout");
  const result = data as { assignment_id?: string } | null;
  redirect(result?.assignment_id ? `/app/conversations/${result.assignment_id}` : "/app");
}

export async function createFollowUp(formData: FormData) {
  const viewer = await requireViewer();
  if (!canManage(viewer.role)) throw new Error("Not authorised.");
  const schema = z.object({
    assigneeId: z.string().uuid(),
    title: z.string().min(4).max(160),
    description: z.string().min(6).max(1500),
    dueDate: z.union([z.iso.date(), z.literal("")]).optional(),
    missionId: z.string().uuid().optional().or(z.literal("")),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/app/follow-ups?message=Complete+the+follow-up+details.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_follow_up", {
    workspace_id: viewer.organisationId,
    linked_mission_id: parsed.data.missionId || null,
    recipient_id: parsed.data.assigneeId,
    task_title: parsed.data.title,
    task_description: parsed.data.description,
    task_due_at: parsed.data.dueDate ? `${parsed.data.dueDate}T17:00:00Z` : null,
  });
  if (error) redirect(`/app/follow-ups?message=${encodeURIComponent(error.message)}`);
  after(() => tryDispatchWorkNotifications(viewer.organisationId));
  revalidatePath("/app/follow-ups");
  revalidatePath("/app");
  redirect("/app/follow-ups?message=Task+assigned+and+available+in+the+employee+portal.");
}

export async function updateFollowUp(formData: FormData) {
  const viewer = await requireViewer();
  const parsed = z.object({ taskId: z.string().uuid(), status: z.enum(["acknowledged", "in_progress", "blocked", "completed"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/app/follow-ups?message=Choose+a+valid+task+status.");
  const { taskId, status } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_own_follow_up", { task_id: taskId, next_status: status });
  if (error) redirect("/app/follow-ups?message=The+task+status+could+not+be+saved.+Refresh+and+try+again.");
  after(() => tryDispatchWorkNotifications(viewer.organisationId));
  revalidatePath("/app/follow-ups");
  revalidatePath("/app");
}

export async function sendClarification(formData: FormData) {
  const viewer = await requireViewer();
  const parsed = z.object({ taskId: z.string().uuid(), content: z.string().trim().min(2).max(1200) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/app/follow-ups?message=Enter+a+reply+between+2+and+1200+characters.");
  const { taskId, content } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_follow_up_clarification", { target_task_id: taskId, comment_text: content });
  if (error) redirect("/app/follow-ups?message=Your+reply+could+not+be+saved.+Refresh+and+try+again.");
  after(() => tryDispatchWorkNotifications(viewer.organisationId));
  revalidatePath("/app/follow-ups");
}

export async function assignMissionParticipant(formData: FormData) {
  const viewer = await requireViewer();
  if (!canManage(viewer.role)) throw new Error("Not authorised.");
  const missionId = z.string().uuid().parse(formData.get("missionId"));
  const participantId = z.string().uuid().parse(formData.get("participantId"));
  const supabase = await createClient();
  const { error } = await supabase.rpc("assign_mission_participant", { target_mission_id: missionId, participant_id: participantId });
  if (error) redirect(`/app/missions/${missionId}?message=${encodeURIComponent(error.message)}`);
  after(() => tryDispatchWorkNotifications(viewer.organisationId));
  revalidatePath("/app");
  revalidatePath(`/app/missions/${missionId}`);
  redirect(`/app/missions/${missionId}?message=Discussion+assigned.+Existing+assignments+are+preserved.`);
}

export async function assignMissionAudience(_state: { error: string | null }, formData: FormData): Promise<{error:string|null}> {
  const viewer=await requireViewer();
  if (!canManage(viewer.role)) return {error:"Management access is required."};
  const parsed=z.object({missionId:z.string().uuid(),audience:audienceSchema,individuals:z.array(z.string().uuid()).max(200)}).safeParse({missionId:formData.get("missionId"),audience:{mode:formData.get("audienceMode"),departmentKeys:formData.getAll("audienceDepartment")},individuals:formData.getAll("participantId")});
  if (!parsed.success) return {error:"Choose the recipients for this discussion."};
  const db=await createClient(),p=parsed.data;
  const result=await db.rpc("assign_mission_audience",{target_mission:p.missionId,audience_mode:p.audience.mode,department_keys:p.audience.departmentKeys,individual_ids:p.individuals});
  if (result.error) return {error:"Assignments could not be sent. Check that the mission is active, the audience has 1 to 200 active members and you have permission. Linked investigation recipients require owner approval."};
  after(()=>tryDispatchWorkNotifications(viewer.organisationId));
  revalidatePath("/app","layout");
  redirect(`/app/missions/${p.missionId}?message=${encodeURIComponent(`${result.data} new discussions assigned. Existing responses are preserved.`)}`);
}

export async function retryWorkNotifications() {
  const viewer = await requireViewer();
  if (!canManagePeople(viewer.role)) throw new Error("Not authorised.");
  after(() => tryDispatchWorkNotifications(viewer.organisationId));
  redirect("/app/settings?message=Queued+email+processing+requested.+Refresh+to+check+the+result.");
}

export async function submitWrittenResponse(formData: FormData) {
  const viewer = await requireViewer();
  const parsed = z.object({
    assignmentId: z.string().uuid(),
    title: z.string().trim().min(4).max(160),
    response: z.string().trim().min(20).max(6000),
    confidentiality: z.enum(["PRIVATE", "SHARE"]),
    confirmed: z.literal("on"),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Complete your response and confirm your sharing choice.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_written_response", {
    target_assignment: parsed.data.assignmentId, response_title: parsed.data.title,
    response_text: parsed.data.response, visibility: parsed.data.confidentiality,
  });
  if (error) redirect(`/app/conversations/${parsed.data.assignmentId}?message=${encodeURIComponent(error.message)}`);
  after(() => processApprovedAssignment(parsed.data.assignmentId, viewer.id));
  revalidatePath("/app", "layout");
  redirect(`/app/conversations/${parsed.data.assignmentId}?message=Your+response+has+been+saved+and+the+assignment+is+complete.`);
}
