import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { FieldedChat } from "@/components/fielded-chat";
import { submitWrittenResponse } from "@/app/app/actions";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 180;

export default async function ConversationPage({ params, searchParams }: {
  params: Promise<{ assignmentId: string }>;
  searchParams: Promise<{ message?: string; mode?: string }>;
}) {
  const viewer = await requireViewer();
  const { assignmentId } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const { data: assignment, error: assignmentError } = await supabase.from("mission_assignments")
    .select("id,status,missions(id,title,objective,context,desired_outcome,status)")
    .eq("id", assignmentId).eq("organisation_id", viewer.organisationId).eq("user_id", viewer.id).maybeSingle();
  if (assignmentError) throw new Error("Your assignment could not be loaded.");
  if (!assignment) notFound();
  const { data: conversation, error } = await supabase.from("conversations")
    .select("id,messages(id,sender,content,confidentiality,created_at),conversation_summaries(id,summary,status),observations(category,summary,confidentiality)")
    .eq("assignment_id", assignmentId).maybeSingle();
  if (error) throw new Error("Your saved response could not be loaded.");
  const mission = assignment.missions as unknown as { id: string; title: string; objective: string; context: string | null; desired_outcome: string | null; status: string };
  if (!mission) notFound();
  const policy = await supabase.from("policy_communications").select("briefing,policy_text").eq("mission_id", mission.id).maybeSingle();
  if (policy.error) throw new Error("The assignment type could not be checked.");
  if (policy.data && (assignment.status === "completed" || query.mode === "written")) redirect(`/app/communications/respond/${assignmentId}`);
  const messages = ((conversation?.messages || []) as Array<{ id: string; sender: "participant" | "fielded"; content: string; confidentiality: "PRIVATE" | "CONTRIBUTE" | "SHARE"; created_at: string }>).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const completed = assignment.status === "completed";
  const summaries = conversation?.conversation_summaries;
  const summary = (Array.isArray(summaries) ? summaries[0] : summaries) as { id: string; summary: string; status: string } | null;
  const initialReview = summary?.status === "draft" ? { reviewId: summary.id, summary: summary.summary, observations: ((conversation?.observations || []) as Array<{ category: string; summary: string; confidentiality: "PRIVATE" | "CONTRIBUTE" | "SHARE" }>).map(item => ({ category: item.category, summary: item.summary, sourceConfidentiality: item.confidentiality })) } : null;
  if (query.mode !== "written" && ["invited", "in_progress"].includes(assignment.status) && mission.status === "active") return <>
    <div className="page-actions" style={{ padding: "12px 24px" }}><Link href={policy.data ? `/app/communications/respond/${assignmentId}` : `/app/conversations/${assignmentId}?mode=written`} className="text-link"><ArrowLeft size={14} />{policy.data ? "Policy and understanding check" : "Mission brief and written response"}</Link></div>
    <FieldedChat assignmentId={assignmentId} missionTitle={mission.title} missionObjective={policy.data?.briefing || [mission.objective, mission.context, mission.desired_outcome].filter(Boolean).join("\n\n")} participantName={viewer.name} initialMessages={messages} initialReview={policy.data ? null : initialReview} policyMode={Boolean(policy.data)} />
  </>;
  return <div className="page">
    <header className="page-header"><div className="page-title">
      <Link className="text-link" href="/app"><ArrowLeft size={16} />Back to dashboard</Link>
      <h1>{mission.title}</h1><p>{mission.objective}</p>
    </div><span className={`chip ${completed ? "green" : ""}`}>{completed ? "Completed" : mission.status}</span></header>
    {query.message && <div className="form-message" role="status">{query.message}</div>}
    <div className="content-grid">
      <section className="panel form-panel">
        {completed ? <><CheckCircle2 size={24} /><h2>Response submitted</h2><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{summary?.summary || "Your approved response has been saved."}</p><Link className="button button-primary" href="/app">Return to dashboard</Link></>
          : mission.status !== "active" || assignment.status === "declined" ? <><h2>Responses are closed</h2><p>This assignment is closed. Your saved contributions remain available.</p></>
          : <><h2>Your response</h2><form action={submitWrittenResponse} className="stack-form">
            <input type="hidden" name="assignmentId" value={assignmentId} />
            <label>Headline<input name="title" required minLength={4} maxLength={160} placeholder="Safety procedure reviewed" /></label>
            <label>Update, acknowledgement or feedback<textarea name="response" required minLength={20} maxLength={6000} rows={8} placeholder="What have you understood, completed or found needs attention?" /></label>
            <label>Sharing<select name="confidentiality" defaultValue="PRIVATE"><option value="PRIVATE">Private: only I can read this response</option><option value="SHARE">Share: authorised managers can read it with my name</option></select></label>
            <label style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "flex-start" }}><input type="checkbox" name="confirmed" required style={{ width: "auto", marginTop: 4 }} /><span>I confirm this response and sharing choice. My organisation can see that I have completed the assignment.</span></label>
            <button className="button button-primary" type="submit">Confirm and submit response</button>
          </form><Link className="text-link" style={{ display: "inline-block", marginTop: 20 }} href={`/app/conversations/${assignmentId}?mode=chat`}>Open AI conversation (requires an available AI connection)</Link></>}
      </section>
      <aside className="panel form-panel"><h2>Mission brief</h2><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{mission.context || mission.objective}</p>{mission.desired_outcome && <><h3>Requested outcome</h3><p>{mission.desired_outcome}</p></>}</aside>
    </div>
  </div>;
}
