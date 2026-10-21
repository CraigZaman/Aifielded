import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { getPublishingRule } from "@/lib/publishing";
import { createClient } from "@/lib/supabase/server";
import { policyLaunchSchema } from "@/lib/policy-schema";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer || !(await getPublishingRule(viewer.organisationId, "policy")).allowed) return NextResponse.json({ error: "Policy publishing permission required." }, { status: 403 });
  const parsed = policyLaunchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Review the policy and questions." }, { status: 400 });
  const p = parsed.data;
  const supabase = await createClient();
  if (viewer.role !== "owner") {
    const result = await supabase.rpc("submit_publication", { request_id: p.requestId, workspace: viewer.organisationId, publication_kind: "policy", body: { title: p.title, version: p.version, policyText: p.policyText, briefing: p.briefing, sourceName: p.sourceName, questions: p.questions }, audience_mode: p.audience.mode, department_keys: p.audience.departmentKeys, individual_ids: p.recipients });
    if (result.error || !result.data) return NextResponse.json({ error: "The request could not be submitted. Check your publishing scope and active recipients. Your draft is retained." }, { status: result.error?.code === "P0001" ? 400 : 503 });
    revalidatePath("/app", "layout");
    return NextResponse.json({ id: result.data.id, request: true, status: result.data.status });
  }
  const { data, error } = await supabase.rpc("launch_policy_targeted", {
    request_id: p.requestId, workspace_id: viewer.organisationId, policy_title: p.title,
    policy_version: p.version, source_text: p.policyText, policy_briefing: p.briefing,
    source_filename: p.sourceName, quiz: p.questions, individual_ids: p.recipients,
    audience_mode:p.audience.mode,department_keys:p.audience.departmentKeys,
  });
  if (error || !data) return NextResponse.json({ error: "The communication could not be published. Check the recipients and try again; your draft is retained." }, { status: error?.code === "P0001" ? 400 : 503 });
  revalidatePath("/app", "layout");
  return NextResponse.json({ id: data });
}
