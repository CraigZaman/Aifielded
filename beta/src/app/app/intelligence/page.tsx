import Link from "next/link";
import { Activity, ArrowRight, CircleDot, Lightbulb, SearchCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { AskFielded } from "@/components/ask-fielded";
import { canManage, requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { evidenceHref } from "@/lib/evidence-links";

export default async function IntelligencePage() {
  const viewer = await requireViewer();
  if (!canManage(viewer.role)) redirect("/app");
  const supabase = await createClient();
  const [themes, hypotheses, findings, observations] = await Promise.all([
    supabase.from("themes").select("id,mission_id,title,description,confidence,evidence_count,participant_count,missions(title)").eq("organisation_id", viewer.organisationId).order("confidence", { ascending: false }),
    supabase.from("hypotheses").select("id,mission_id,title,description,status,confidence,evidence_for,evidence_against,missions(title)").eq("organisation_id", viewer.organisationId).order("confidence", { ascending: false }),
    supabase.from("findings").select("id,mission_id,title,summary,impact,confidence,recommended_action,missions(title)").eq("organisation_id", viewer.organisationId).order("confidence", { ascending: false }),
    supabase.from("management_observations").select("id,mission_id,category,summary,detail,confidentiality,created_at", { count: "exact" }).eq("organisation_id", viewer.organisationId).eq("participant_approved", true).neq("confidentiality", "PRIVATE").order("created_at", { ascending: false }).limit(50),
  ]);
  if ([themes, hypotheses, findings, observations].some((result) => result.error)) throw new Error("Workspace intelligence could not be loaded. Please try again.");
  return <div className="page">
    <header className="page-header"><div className="page-title"><h1>Organisational intelligence</h1><p>{viewer.organisationName} · Approved evidence and findings</p></div><span className="status-pill">{observations.count || 0} approved observations</span></header>
    <section className="panel" style={{ marginBottom: 24 }}>
      <div className="panel-head"><h2>Employee responses and evidence</h2><span className="chip">Private excluded</span></div>
      {observations.data?.length ? <div className="row-list">{observations.data.map((item) => <article className="row-item" key={item.id} style={{ display: "block" }}>
        <h3>{item.summary}</h3><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.detail}</p>
        <div className="row-meta"><span className="chip">{item.category === "participant_response" ? "Written response" : item.category}</span><span className="chip">{item.confidentiality}</span><time>{new Date(item.created_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</time></div>
        <div className="page-actions" style={{ marginTop: 12 }}>
          <Link className="text-link" href={evidenceHref(item.mission_id, item.id)}>Open evidence <ArrowRight size={14} /></Link>
          <Link className="text-link" href={`/app/follow-ups?${new URLSearchParams({ title: item.summary.slice(0,160), description: item.detail.slice(0,1500), missionId: item.mission_id })}`}>Create follow-up <ArrowRight size={14} /></Link>
        </div>
      </article>)}</div> : <div className="empty-state"><Activity size={24} /><h3>No shared responses yet</h3></div>}
    </section>
    <div className="section-title-row"><h2>Themes and findings</h2></div>
    <div className="intelligence-grid">
      {findings.data?.map((item) => <article className="intel-card" key={item.id}><span className="chip green"><SearchCheck size={11} />Finding</span><h3>{item.title}</h3><p>{item.summary}</p><footer><span className="chip">{item.impact} impact</span><span className="confidence">{Math.round(Number(item.confidence) * 100)}%</span></footer><Link className="text-link" href={`/app/missions/${item.mission_id}`}>View mission <ArrowRight size={14} /></Link></article>)}
      {themes.data?.map((item) => <article className="intel-card" key={item.id}><span className="chip"><CircleDot size={11} />Theme</span><h3>{item.title}</h3><p>{item.description}</p><footer><span className="chip">{item.evidence_count} evidence</span><span className="confidence">{Math.round(Number(item.confidence) * 100)}%</span></footer><Link className="text-link" href={`/app/missions/${item.mission_id}`}>View mission <ArrowRight size={14} /></Link></article>)}
      {hypotheses.data?.map((item) => <article className="intel-card" key={item.id}><span className="chip amber"><Lightbulb size={11} />Hypothesis</span><h3>{item.title}</h3><p>{item.description}</p><footer><span className="chip">{item.status}</span><span className="confidence">{Math.round(Number(item.confidence) * 100)}%</span></footer><Link className="text-link" href={`/app/missions/${item.mission_id}`}>Review supporting evidence <ArrowRight size={14} /></Link></article>)}
      {!findings.data?.length && !themes.data?.length && !hypotheses.data?.length && <div className="empty-state" style={{ gridColumn: "1 / -1" }}><h3>No synthesised findings yet</h3><p>Shared responses remain available above. AI synthesis requires an available AI connection.</p></div>}
    </div>
    <AskFielded />
  </div>;
}
