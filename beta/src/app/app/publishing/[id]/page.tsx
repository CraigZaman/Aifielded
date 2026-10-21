import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { approvalLabels, visibilityLabels } from "@/lib/publishing";
import { PublicationDecision } from "@/components/publishing-controls";

export default async function PublicationPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireViewer();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const db = await createClient();
  const { data: request, error } = await db.from("publication_requests").select("*").eq("id", id).eq("organisation_id", viewer.organisationId).maybeSingle();
  if (error) throw new Error("The request could not be loaded.");
  if (!request) notFound();
  const recipients = await db.rpc("publication_recipient_names", { request_id: id });
  if (recipients.error) throw new Error("The reviewed recipients could not be loaded.");
  const body = request.payload;
  const pending = ["pending_head", "pending_owner"].includes(request.status);
  const reviewer = viewer.id !== request.author_id && (viewer.role === "owner" || viewer.id === request.head_id);
  const canApprove = request.status === "pending_owner" ? viewer.role === "owner" : viewer.id === request.head_id;
  const access = request.status === "published" ? await db.rpc("can_read_mission_intelligence", { target_mission: id }) : { data: false };
  const steps: Record<string, string> = { pending_head: "Awaiting department-head review", pending_owner: "Awaiting owner approval", published: "Published and assigned", rejected: "Request declined" };
  return <div className="page">
    <header className="page-header"><div className="page-title"><Link className="text-link" href="/app/publishing"><ArrowLeft size={16} />Publishing and approvals</Link><h1>{body.title}</h1><p>{steps[request.status] || request.status}</p></div>{access.data && <Link className="button button-primary" href={`/app/missions/${id}`}>Mission intelligence <ArrowRight size={16} /></Link>}</header>
    <section className="publishing-section"><div className="publishing-access-grid"><div><h3>Approval sequence</h3><p>{approvalLabels[request.rule_snapshot.approval as keyof typeof approvalLabels]}</p></div><div><h3>Intelligence visibility</h3><p>{visibilityLabels[request.rule_snapshot.visibility as keyof typeof visibilityLabels]}</p></div><div><h3>Recipients</h3><p>{request.recipients.length} named people</p></div></div></section>
    <section className="publishing-section"><div className="panel-head"><h2>Reviewed content</h2><span className="chip">{request.kind}</span></div><div className="publishing-editor publishing-copy"><h3>{request.kind === "policy" ? "Employee briefing" : "Question"}</h3><p>{body.briefing || body.objective}</p>{body.context && <p>{body.context}</p>}{body.desiredOutcome && <><h3>Desired outcome</h3><p>{body.desiredOutcome}</p></>}
      {request.kind === "policy" && <><details><summary>Policy source / {body.version}</summary><p>{body.policyText}</p></details>{(body.questions as Array<{ question: string; options: string[]; correctIndex: number; explanation: string; sourceQuote: string }>).map((q, i) => <div className="policy-question" key={i}><h3>{i + 1}. {q.question}</h3><ol>{q.options.map((option, index) => <li key={index}>{option}{index === q.correctIndex ? " (correct answer)" : ""}</li>)}</ol><p>{q.explanation}</p><blockquote>{q.sourceQuote}</blockquote></div>)}</>}
    </div></section>
    <section className="publishing-section"><div className="panel-head"><h2>Named recipients</h2></div><div className="publishing-recipient-list">{(recipients.data as Array<{ id: string; name: string; active: boolean }>).map(person => <span key={person.id}>{person.name}{person.active ? "" : " / No longer active"}</span>)}</div></section>
    {pending && reviewer && <PublicationDecision id={id} step={request.status} canApprove={canApprove} />}
    {request.decision_note && <div className="form-message"><strong>Decision note</strong><p>{request.decision_note}</p></div>}
  </div>;
}
