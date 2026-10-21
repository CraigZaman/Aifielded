import { NextResponse } from "next/server";
import { z } from "zod";
import { runDialogue } from "@/lib/ai";
import { getDialogueContext } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
export const maxDuration = 60;

const bodySchema = z.object({
  assignmentId: z.string().uuid(),
  content: z.string().min(1).max(8000),
  confidentiality: z.enum(["PRIVATE", "CONTRIBUTE", "SHARE"]),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid message." }, { status: 400 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: assignment } = await supabase
    .from("mission_assignments")
    .select("id,organisation_id,mission_id,user_id,status,missions(title,objective,context,desired_outcome,status)")
    .eq("id", parsed.data.assignmentId)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!assignment) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  const mission = assignment.missions as unknown as { title: string; objective: string; context?: string; desired_outcome?: string; status: string };
  if (!["invited", "in_progress"].includes(assignment.status) || mission?.status !== "active") {
    return NextResponse.json({ error: "This assignment is closed. Return to your dashboard to view the saved response." }, { status: 409 });
  }
  const policy = await supabase.from("policy_communications").select("policy_text,briefing").eq("mission_id", assignment.mission_id).maybeSingle();
  if (policy.error) return NextResponse.json({ error: "The policy context could not be checked. Nothing was sent." }, { status: 503 });
  if (policy.data && parsed.data.confidentiality !== "PRIVATE") return NextResponse.json({ error: "Policy dialogue is private. Submit feedback for HR with your understanding check." }, { status: 400 });

  let { data: conversation } = await supabase.from("conversations").select("id").eq("assignment_id", assignment.id).maybeSingle();
  if (!conversation) {
    const created = await supabase.from("conversations").insert({
      assignment_id: assignment.id,
      mission_id: assignment.mission_id,
      user_id: auth.user.id,
    }).select("id").single();
    if (created.error) return NextResponse.json({ error: created.error.message }, { status: 400 });
    conversation = created.data;
    await supabase.from("mission_assignments").update({ status: "in_progress", started_at: new Date().toISOString() }).eq("id", assignment.id);
  }

  const userMessage = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender: "participant",
    content: parsed.data.content,
    confidentiality: parsed.data.confidentiality,
  }).select("id").single();
  if (userMessage.error) return NextResponse.json({ error: userMessage.error.message }, { status: 400 });

  const { data: history, error: historyError } = await supabase
    .from("messages")
    .select("sender,content,confidentiality")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (historyError) return NextResponse.json({ error: "Your contribution was saved, but the conversation could not be loaded. Please refresh.", saved: true, participantMessageId: userMessage.data.id }, { status: 503 });
  const transcript = (history || []).reverse().map((item) => `${item.sender} [${item.confidentiality}]: ${item.content}`).join("\n");

  try {
    const background = await getDialogueContext(assignment.organisation_id, auth.user.id);
    const content = await runDialogue({ mission: mission.title, objective: policy.data ? `Policy communication. Published source:\n${policy.data.policy_text}\nBriefing:\n${policy.data.briefing}` : [mission.objective, mission.context, mission.desired_outcome].filter(Boolean).join("\n\n"), transcript, latest: parsed.data.content, policyMode: Boolean(policy.data), background });
    const result = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender: "fielded",
      content,
      confidentiality: parsed.data.confidentiality,
    }).select("id").single();
    if (result.error) throw result.error;
    return NextResponse.json({ id: result.data.id, content, participantMessageId: userMessage.data.id });
  } catch {
    return NextResponse.json({ error: "Fielded could not complete that response. Your contribution was saved.", saved: true, participantMessageId: userMessage.data.id }, { status: 503 });
  }
}
