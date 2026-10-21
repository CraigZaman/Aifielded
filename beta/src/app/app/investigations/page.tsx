import Link from "next/link";
import { ArrowLeft, ArrowRight, GitBranch } from "lucide-react";
import { redirect } from "next/navigation";
import { canManage, requireViewer } from "@/lib/auth";
import { DEPARTMENT_OPTIONS, optionLabel } from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/server";
import { InvestigationDecision } from "@/components/investigation-decision";
import { evidenceHref } from "@/lib/evidence-links";
import { getOperationalDirectory } from "@/lib/publishing";

export default async function InvestigationsPage({ searchParams }: { searchParams: Promise<{ message?: string; mission?: string }> }) {
  const viewer = await requireViewer();
  if (!canManage(viewer.role)) redirect("/app");
  const query = await searchParams;
  const supabase = await createClient();
  let request = supabase.from("investigation_proposals").select("id,root_mission_id,title,rationale,question,departments,evidence_ids,status,origin,created_at").eq("organisation_id",viewer.organisationId).order("created_at",{ ascending: false }).limit(100);
  if (query.mission) request = request.eq("root_mission_id",query.mission);
  const proposals = await request;
  const links = await supabase.from("investigation_links").select("proposal_id,child_mission_id,root_mission_id").eq("organisation_id",viewer.organisationId);
  if (proposals.error || links.error) throw new Error("Investigation proposals could not be loaded.");
  const {members,departments}=await getOperationalDirectory(viewer.organisationId);
  const pending = (proposals.data || []).filter(p => p.status === "pending");
  const history = (proposals.data || []).filter(p => p.status !== "pending");
  return <div className="page">
    <header className="page-header"><div className="page-title"><Link className="text-link" href="/app"><ArrowLeft size={14} />Dashboard</Link><h1>Investigation follow-ups</h1><p>{pending.length} {pending.length===1 ? "proposal" : "proposals"} awaiting a decision{query.mission ? " for this mission" : ""}</p></div><GitBranch size={22} /></header>
    {query.message && <div className="form-message" role="status">{query.message}</div>}
    {!pending.length && <section className="empty-state"><h2>No proposals awaiting approval</h2><p>New evidence may reveal questions that need another department&apos;s perspective.</p></section>}
    {pending.map(p => <section className="panel form-panel" style={{ marginBottom:24 }} id={`proposal-${p.id}`} key={p.id}>
      <div className="row-meta"><span className="chip amber">Owner approval required</span><span className="chip">{p.origin === "ai" ? "Suggested by Fielded" : "Requested by management"}</span></div>
      <h2>{p.title}</h2><p>{p.rationale}</p>
      <div className="row-meta">{p.departments.map((d: string) => <span className="chip" key={d}>{departments.find(dept=>dept.key===d)?.name || optionLabel(DEPARTMENT_OPTIONS,d)}</span>)}</div>
      <h3>Evidence behind this question</h3><ul>{p.evidence_ids.map((id: string,index: number) => <li key={id}><Link className="text-link" href={evidenceHref(p.root_mission_id,id)}>Approved source {index+1}</Link></li>)}</ul>
      <Link className="text-link" href={`/app/missions/${p.root_mission_id}`}>Original mission <ArrowRight size={14} /></Link>
      {viewer.role === "owner" ? <InvestigationDecision proposalId={p.id} question={p.question} suggestedDepartments={p.departments} members={members} departments={departments} /> : <p className="muted">The workspace owner can review the question, choose recipients and approve these discussions.</p>}
    </section>)}
    {history.length > 0 && <section className="panel"><div className="panel-head"><h2>Investigation history</h2><span className="chip">Latest {history.length}</span></div><div className="row-list">{history.map(p => { const link = links.data?.find(l => l.proposal_id === p.id); return <article className="row-item" key={p.id}><div><h3>{p.title}</h3><p>{p.rationale}</p><span className="chip">{p.status}</span>{link && <Link className="text-link" style={{ marginLeft:12 }} href={`/app/missions/${link.child_mission_id}`}>Follow-up discussions <ArrowRight size={14} /></Link>}</div></article>; })}</div></section>}
  </div>;
}
