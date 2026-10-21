"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { canManage, requireViewer } from "@/lib/auth";
import { parseEvidenceReference } from "@/lib/evidence-links";
import { createClient } from "@/lib/supabase/server";
import { tryDispatchWorkNotifications } from "@/lib/work-notifications";
import { audienceSchema } from "@/lib/audience";

export async function investigateHypothesis(form: FormData) {
  const viewer = await requireViewer();
  if (!canManage(viewer.role)) throw new Error("Not authorised.");
  const hypothesisId = z.string().uuid().parse(form.get("hypothesisId"));
  const supabase = await createClient();
  const { data: hypothesis, error } = await supabase.from("hypotheses").select("mission_id,title,description,evidence_for,evidence_against").eq("id", hypothesisId).eq("organisation_id", viewer.organisationId).maybeSingle();
  if (error || !hypothesis) redirect("/app/investigations?message=This+hypothesis+has+changed.+Refresh+the+mission+and+try+again.");
  const mission = await supabase.from("missions").select("title,objective").eq("id", hypothesis.mission_id).eq("organisation_id", viewer.organisationId).maybeSingle();
  if (mission.error || !mission.data) throw new Error("The source mission could not be loaded.");
  const sources = [...new Set([...(hypothesis.evidence_for || []), ...(hypothesis.evidence_against || [])].flatMap(value => { const ref = parseEvidenceReference(value); return ref ? [ref.id] : []; }))].slice(0,12);
  const result = await supabase.rpc("propose_investigation", {
    target_mission: hypothesis.mission_id,
    proposal_title: `Investigate: ${hypothesis.title}`.slice(0,120),
    reason: hypothesis.description.slice(0,1500),
    discussion_question: `Please describe your team's part in this process, including upstream inputs, time spent waiting, and how you verify that a handoff is ready. ${mission.data.objective}`.slice(0,2000),
    target_departments: [], sources,
  });
  if (result.error || !result.data) redirect("/app/investigations?message=The+proposal+could+not+be+saved.+Its+evidence+may+have+changed.");
  revalidatePath("/app", "layout");
  redirect(`/app/investigations#proposal-${result.data}`);
}

export async function decideInvestigation(_state: { error: string | null }, form: FormData): Promise<{ error: string | null }> {
  const viewer = await requireViewer();
  if (viewer.role !== "owner") return { error: "Only the workspace owner can approve or decline these discussions." };
  const parsed = z.object({
    proposal: z.string().uuid(), decision: z.enum(["approve","reject"]), question: z.string().max(2000),
    audience: audienceSchema, individuals: z.array(z.string().uuid()).max(200),
  }).safeParse({ proposal: form.get("proposalId"), decision: form.get("decision"), question: form.get("question") || "", audience: {mode:form.get("audienceMode"),departmentKeys:form.getAll("audienceDepartment")}, individuals: form.getAll("participantId") });
  if (!parsed.success) return { error: "Review the question and recipients." };
  const value = parsed.data;
  if (value.decision === "approve" && (value.question.trim().length < 20 || value.audience.mode === "departments" && !value.audience.departmentKeys.length || value.audience.mode === "individuals" && !value.individuals.length)) return { error: "Add a question and choose at least one recipient or department." };
  const supabase = await createClient();
  const result = await supabase.rpc("decide_investigation", { proposal: value.proposal, approve: value.decision === "approve", discussion_question: value.question, recipient_mode: value.audience.mode, department_names: value.audience.departmentKeys, individual_ids: value.individuals });
  if (result.error) return { error: "The decision could not be saved. Check that the proposal is still pending, its evidence remains shared, and recipients have active access (maximum 200)." };
  if (result.data) after(() => tryDispatchWorkNotifications(viewer.organisationId));
  revalidatePath("/app", "layout");
  redirect(result.data ? `/app/missions/${result.data}?message=Follow-up+discussions+assigned.` : "/app/investigations?message=Proposal+declined.+No+discussions+were+sent.");
}
