import { NextResponse } from "next/server";
import { extractConversation, hasAIProvider, type EvidenceMessage } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { describeAIFailure } from "@/lib/ai-failure";
import { analysableContributions } from "@/lib/conversation-evidence";

export const maxDuration = 180;

export async function POST(_: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: assignment } = await supabase.from("mission_assignments").select("id,mission_id,user_id,status,missions(title,status)").eq("id", assignmentId).eq("user_id", auth.user.id).maybeSingle();
  if (!assignment) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  const mission = assignment.missions as unknown as { title: string; status: string };
  if (!["invited", "in_progress"].includes(assignment.status) || mission?.status !== "active") {
    return NextResponse.json({ error: "This assignment is closed. Its submitted response cannot be replaced." }, { status: 409 });
  }
  const policy = await supabase.from("policy_communications").select("mission_id").eq("mission_id", assignment.mission_id).maybeSingle();
  if (policy.error) return NextResponse.json({ error: "The assignment type could not be checked. Please retry." }, { status: 503 });
  if (policy.data) return NextResponse.json({ error: "This policy requires the three-question understanding check. Open Check understanding above." }, { status: 409 });
  const { data: conversation, error: conversationError } = await supabase.from("conversations").select("id,messages(id,sender,content,confidentiality,created_at),conversation_summaries(id,summary,status),observations(category,summary,detail,confidence,confidentiality)").eq("assignment_id", assignmentId).maybeSingle();
  if (conversationError) return NextResponse.json({ error: "Your saved conversation could not be loaded. Please retry; no messages were deleted.", code: "TRANSCRIPT_READ_FAILED" }, { status: 503 });
  if (!conversation) return NextResponse.json({ error: "Start the conversation first." }, { status: 400 });
  const savedReviews = Array.isArray(conversation.conversation_summaries) ? conversation.conversation_summaries : [conversation.conversation_summaries];
  const draft = savedReviews.find((item: { id: string; summary: string; status: string } | null) => item?.status === "draft");
  // New messages invalidate drafts transactionally. A retry can reuse a current review.
  if (draft) return NextResponse.json({
    reviewId: draft.id,
    summary: draft.summary,
    observations: (conversation.observations || []).map((item: { category: string; summary: string; detail: string; confidence: number; confidentiality: string }) => ({
      category: item.category, summary: item.summary, detail: item.detail, confidence: item.confidence, sourceConfidentiality: item.confidentiality,
    })),
  });
  if (!hasAIProvider()) return NextResponse.json({ error: "AI summaries are currently unavailable. Your conversation is saved; please try again later.", saved: true }, { status: 503 });
  const messages = (conversation.messages as Array<{ id: string; sender: string; content: string; confidentiality: string; created_at: string }>).sort((a, b) => a.created_at.localeCompare(b.created_at));
  if (!analysableContributions(messages).length) {
    return NextResponse.json({ error: "All your answers are Private. Mark at least one answer Contribute or Share before preparing a summary." }, { status: 400 });
  }
  try {
    const extraction = await extractConversation({ mission: mission.title, messages: messages as EvidenceMessage[] });
    const saved = await supabase.rpc("save_conversation_draft", { target_assignment: assignmentId, expected_message_ids: messages.map(item => item.id), draft_summary: extraction.summary, draft_observations: extraction.observations });
    if (saved.error) {
      console.error("Conversation summary save failed", { code: "SUMMARY_SAVE_FAILED", databaseCode: /^[A-Z0-9]{5,12}$/.test(saved.error.code || "") ? saved.error.code : "unknown" });
      return NextResponse.json({ error: "Your transcript is saved. The conversation changed or its review could not be saved. Reload and prepare a fresh review.", code: "SUMMARY_SAVE_FAILED", saved: true }, { status: 409 });
    }
    return NextResponse.json({ ...extraction, reviewId: saved.data.review_id });
  } catch (error) {
    const failure = describeAIFailure(error);
    console.error("Conversation summary processing failed", { code: failure.code, finishReason: failure.finishReason });
    return NextResponse.json({ error: failure.message, code: failure.code, saved: true }, { status: failure.code === "AI_DAILY_LIMIT" ? 429 : 503 });
  }
}
