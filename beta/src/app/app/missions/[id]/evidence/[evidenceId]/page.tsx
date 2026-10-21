import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { canManage, requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function EvidencePage({ params }: { params: Promise<{ id: string; evidenceId: string }> }) {
  const viewer = await requireViewer();
  if (!canManage(viewer.role)) redirect("/app/conversations");
  const { id, evidenceId } = await params;
  if (!z.string().uuid().safeParse(id).success || !z.string().uuid().safeParse(evidenceId).success) notFound();
  const supabase = await createClient();
  const { data: evidence, error } = await supabase.from("management_observations")
    .select("id,mission_id,summary,detail,category,confidence,confidentiality,user_id,created_at")
    .eq("organisation_id", viewer.organisationId).eq("id", evidenceId)
    .eq("participant_approved", true).neq("confidentiality", "PRIVATE").maybeSingle();
  if (error) throw new Error("This evidence could not be loaded. Please try again.");
  if (!evidence) notFound();
  if (evidence.mission_id !== id) {
    const relationship = await supabase.from("investigation_links").select("child_mission_id").eq("root_mission_id",id).eq("child_mission_id",evidence.mission_id).eq("organisation_id",viewer.organisationId).maybeSingle();
    if (relationship.error) throw new Error("The evidence relationship could not be checked.");
    if (!relationship.data) notFound();
  }
  const { data: mission, error: missionError } = await supabase.from("missions").select("title")
    .eq("organisation_id", viewer.organisationId).eq("id", id).maybeSingle();
  if (missionError) throw new Error("The mission could not be loaded. Please try again.");
  if (!mission) notFound();
  let contributor: string | null = null;
  if (evidence.confidentiality === "SHARE" && evidence.user_id) {
    const profile = await supabase.from("profiles").select("full_name").eq("id", evidence.user_id).maybeSingle();
    if (profile.error) throw new Error("The contributor could not be loaded. Please try again.");
    contributor = profile.data?.full_name || "Workspace member";
  }
  return <div className="page evidence-detail">
    <header className="page-header"><div className="page-title">
      <Link className="text-link" href={`/app/missions/${id}`}><ArrowLeft size={14} />Back to mission</Link>
      <h1>Approved evidence</h1><p>{mission.title}</p>
    </div><span className="status-pill"><ShieldCheck size={14} />Participant approved</span></header>
    <section className="panel form-panel">
      <div className="row-meta"><span className="chip">{evidence.category === "participant_response" ? "Written response" : evidence.category}</span><span className="chip green">{evidence.confidentiality}</span>
        {contributor && <span className="chip">{contributor}</span>}
        <time>{new Date(evidence.created_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</time>
      </div>
      <h2>{evidence.summary}</h2><p className="evidence-body">{evidence.detail}</p>
      {evidence.confidentiality === "CONTRIBUTE" && <p className="muted">Account attribution is withheld. The content itself may still identify its contributor.</p>}
      <div className="page-actions"><Link className="button button-primary" href={`/app/follow-ups?${new URLSearchParams({ title: evidence.summary.slice(0,160), description: evidence.detail.slice(0,1500), missionId: id })}`}>Review and assign follow-up <ArrowRight size={15} /></Link></div>
    </section>
  </div>;
}
