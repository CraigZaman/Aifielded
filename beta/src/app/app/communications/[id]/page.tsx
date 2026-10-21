import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireViewer, canManagePeople } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PolicyQuestion } from "@/lib/policy-schema";

export default async function CommunicationReport({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireViewer();
  if (!canManagePeople(viewer.role)) redirect("/app");
  const { id } = await params;
  const db = await createClient();
  const policy = await db.from("policy_communications").select("*,missions(title,status)").eq("mission_id", id).eq("organisation_id", viewer.organisationId).maybeSingle();
  if (policy.error) throw new Error("The communication could not be loaded.");
  if (!policy.data) notFound();
  const assignments = await db.from("mission_assignments").select("id,user_id,status").eq("mission_id", id);
  const responses = await db.from("policy_responses").select("*").eq("mission_id", id);
  const keys = await db.from("policy_answer_keys").select("questions").eq("mission_id", id).single();
  const themes = await db.from("themes").select("id,title,description,participant_count,evidence_count").eq("mission_id", id);
  if (assignments.error || responses.error || keys.error || themes.error) throw new Error("Communication results could not be loaded.");
  const people = (assignments.data || []).map(a => a.user_id);
  const profiles = people.length ? await db.from("profiles").select("id,full_name").in("id", people) : { data: [], error: null };
  if (profiles.error) throw new Error("Recipient names could not be loaded.");
  const names = new Map((profiles.data || []).map(p => [p.id, p.full_name]));
  const results = responses.data || [];
  const byAssignment = new Map(results.map(r => [r.assignment_id, r]));
  const total = assignments.data?.length || 0;
  const passed = results.filter(r => r.score === 3).length;
  const concerns = results.filter(r => r.has_concerns).length;
  const percent = (n: number, d: number) => d ? `${Math.round(n / d * 100)}%` : "Not yet available";
  const mission = policy.data.missions as unknown as { title: string; status: string };
  return <div className="page"><header className="page-header"><div className="page-title"><Link href="/app/communications" className="text-link"><ArrowLeft size={16} />Communications</Link><h1>{mission.title}</h1><p>{policy.data.version} · {mission.status}</p></div><Link className="button button-quiet" href={`/app/missions/${id}`}>Evidence and follow-up actions</Link></header>
    <section className="role-kpis"><div><span>Assigned</span><strong>{total}</strong><small>Employees in this communication</small></div><div><span>Receipt acknowledged</span><strong>{percent(results.length, total)}</strong><small>{results.length} / {total} assigned</small></div><div><span>All three correct</span><strong>{percent(passed, results.length)}</strong><small>{passed} / {results.length} submitted checks</small></div><div><span>Concerns flagged</span><strong>{percent(concerns, results.length)}</strong><small>{concerns} / {results.length} respondents</small></div><div><span>Awaiting response</span><strong>{total - results.length}</strong><small>Not counted as understood</small></div></section>
    <section className="policy-section"><h2>Understanding by question</h2><p>First submitted answers, graded against the published answer key. Quiz results are not a compliance certification.</p>{(keys.data.questions as PolicyQuestion[]).map((q, i) => { const correct = results.filter(r => r.answers[i] === q.correctIndex).length; return <div className="policy-question" key={i}><h3>{i + 1}. {q.question}</h3><div className="hr-completion-line"><span>{correct} / {results.length} correct</span><strong>{percent(correct, results.length)}</strong></div><progress max={Math.max(results.length, 1)} value={correct} aria-label={`Question ${i + 1} correct answers`} /><details><summary>Answer and policy evidence</summary><p>{q.options[q.correctIndex]}</p><p>{q.explanation}</p><blockquote>{q.sourceQuote}</blockquote></details></div>; })}</section>
    <section className="policy-section"><h2>Question themes</h2>{themes.data?.length ? themes.data.map(t => <div key={t.id} className="row-item"><div><h3>{t.title}</h3><p>{t.description}</p><span className="chip">{t.participant_count} contributor{t.participant_count === 1 ? "" : "s"} in analysed evidence</span><span className="chip">{t.evidence_count} source{t.evidence_count === 1 ? "" : "s"}</span></div></div>) : <p>No analysed themes yet. Only feedback explicitly submitted to HR contributes; private conversation is excluded.</p>}<Link className="text-link" href={`/app/missions/${id}`}>Review evidence and refresh analysis</Link></section>
    <section className="policy-section"><h2>Employee responses</h2><div className="policy-table-wrap"><table className="policy-table"><thead><tr><th>Employee</th><th>Check</th><th>Concern</th><th>Shared feedback</th><th>Follow-up</th></tr></thead><tbody>{(assignments.data || []).map(a => { const r = byAssignment.get(a.id); return <tr key={a.id}><td>{names.get(a.user_id) || "Workspace member"}</td><td>{r ? `${r.score}/3${r.score < 3 ? " · Clarification needed" : " · All correct"}` : a.status === "declined" ? "Declined" : "Awaiting response"}</td><td>{r ? r.has_concerns ? "Yes" : "No" : "Not answered"}</td><td className="policy-copy">{r?.feedback || "None submitted"}</td><td><Link className="text-link" href={`/app/follow-ups?assigneeId=${encodeURIComponent(a.user_id)}&missionId=${id}&title=${encodeURIComponent(`Policy clarification: ${mission.title}`.slice(0, 160))}`}>Assign follow-up</Link></td></tr>; })}</tbody></table></div></section>
    <details className="policy-section"><summary>Published briefing and source</summary><h2>Briefing</h2><p className="policy-copy">{policy.data.briefing}</p><h2>Policy text</h2><p className="policy-copy">{policy.data.policy_text}</p></details>
  </div>;
}
