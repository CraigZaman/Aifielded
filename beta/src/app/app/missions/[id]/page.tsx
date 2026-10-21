import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Link2, Plus, RefreshCw, Users } from "lucide-react";
import { createMissionInvite } from "@/app/app/actions";
import { investigateHypothesis } from "@/app/app/investigations/actions";
import { CopyLink } from "@/components/copy-link";
import { EvidenceReferences } from "@/components/evidence-references";
import { AskFielded } from "@/components/ask-fielded";
import { evidenceHref, evidencePage } from "@/lib/evidence-links";
import { canManage, requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getOperationalDirectory } from "@/lib/publishing";
import { AssignmentAudienceForm } from "@/components/assignment-audience-form";
import { MissionVisibilityControl } from "@/components/publishing-controls";

export default async function MissionPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string; message?: string; evidencePage?: string }>;
}) {
  const viewer = await requireViewer();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const query = await searchParams;
  const page = evidencePage(query.evidencePage);
  const pageSize = 12;
  const supabase = await createClient();
  const investigationLinks = canManage(viewer.role) ? await supabase.from("investigation_links").select("child_mission_id,root_mission_id").eq("organisation_id",viewer.organisationId).or(`root_mission_id.eq.${id},child_mission_id.eq.${id}`) : { data: [], error: null };
  if (investigationLinks.error) throw new Error("Investigation relationships could not be loaded.");
  const evidenceMissionIds = [id,...(investigationLinks.data || []).filter(l => l.root_mission_id === id).map(l => l.child_mission_id)];
  const parent = investigationLinks.data?.find(l => l.child_mission_id === id);
  const [mission, assignments, observations, themes, findings, hypotheses, analysis] = await Promise.all([
    supabase.from("missions").select("*").eq("id", id).eq("organisation_id", viewer.organisationId).maybeSingle(),
    supabase.from("mission_assignments").select("id,mission_id,user_id,status,started_at,completed_at").in("mission_id", evidenceMissionIds).order("created_at"),
    supabase.from("management_observations").select("id,mission_id,category,summary,detail,user_id,confidence,confidentiality,created_at", { count: "exact" }).eq("organisation_id", viewer.organisationId).in("mission_id", evidenceMissionIds).eq("participant_approved", true).neq("confidentiality", "PRIVATE").order("created_at", { ascending: false }).order("id").range((page - 1) * pageSize, page * pageSize - 1),
    supabase.from("themes").select("id,title,description,confidence,evidence_count,participant_count").eq("mission_id", id).order("confidence", { ascending: false }),
    supabase.from("findings").select("id,title,summary,evidence_summary,confidence,impact,recommended_action").eq("mission_id", id).order("confidence", { ascending: false }),
    supabase.from("hypotheses").select("id,title,description,status,confidence,evidence_for,evidence_against").eq("mission_id", id).order("confidence", { ascending: false }),
    supabase.from("mission_analysis_status").select("status,completed_at,error_code").eq("mission_id", id).eq("organisation_id", viewer.organisationId).maybeSingle(),
  ]);

  if (mission.error || assignments.error || observations.error || themes.error || findings.error || hypotheses.error || analysis.error) throw new Error("Mission data could not be loaded.");
  if (!mission.data) notFound();
  const access = await supabase.rpc("mission_access_context", { target_mission: id });
  if (access.error || !access.data) throw new Error("Mission permissions could not be checked.");
  const canAdminister = canManage(viewer.role) && access.data.intelligence;
  const governed = Boolean(access.data.governed);
  const visibility = viewer.role === "owner" && !parent ? await supabase.from("mission_visibility").select("scope,department_id").eq("mission_id", id).maybeSingle() : { data: null, error: null };
  if (visibility.error) throw new Error("Mission visibility could not be loaded.");
  const policy = await supabase.from("policy_communications").select("mission_id").eq("mission_id", id).maybeSingle();
  if (policy.error) throw new Error("The communication type could not be checked.");
  const directory=canManage(viewer.role) ? await getOperationalDirectory(viewer.organisationId) : {members:[],departments:[]};
  const participantIds = [...new Set([...(assignments.data?.map((assignment) => assignment.user_id) || []), ...directory.members.map(member => member.id)])];
  const profiles = participantIds.length
    ? await supabase.from("profiles").select("id,full_name").in("id", participantIds)
    : { data: [] as { id: string; full_name: string }[], error: null };
  if (profiles.error) throw new Error("Participant names could not be loaded.");
  const profileById = new Map(profiles.data?.map((profile) => [profile.id, profile.full_name]) || []);
  const completed = (assignments.data || []).filter((item) => item.status === "completed").length;
  const total = assignments.data?.length || 0;
  const observationCount = observations.count || 0;
  const lastPage = Math.max(1, Math.ceil(observationCount / pageSize));
  const analysisLabels: Record<string,string> = { pending: "Analysis queued", running: "Analysing approved evidence", retry: "Analysis awaiting retry", failed: "Analysis needs attention", ready: "Latest analysis complete" };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-title">
          <Link className="text-link" href="/app/missions"><ArrowLeft size={14} />Missions</Link>
          <h1>{mission.data.title}</h1>
          <p>{mission.data.objective}</p>
        </div>
        <div className="page-actions">{policy.data && <Link className="button button-primary" href={`/app/communications/${id}`}>Policy understanding report</Link>}<span className="chip green">{mission.data.status}</span></div>
      </header>

      {query.message && <div className="form-message">{query.message}</div>}
      {canManage(viewer.role) && <div className="form-message"><Link className="text-link" href={`/app/investigations?mission=${parent?.root_mission_id || id}`}>Review investigation proposals <ArrowRight size={14} /></Link>{parent && <Link className="text-link" style={{ marginLeft:16 }} href={`/app/missions/${parent.root_mission_id}`}>Original investigation <ArrowRight size={14} /></Link>}{evidenceMissionIds.length > 1 && <span> / Evidence includes {evidenceMissionIds.length-1} linked follow-up missions</span>}</div>}
      {analysis.data && <div className="form-message" role="status">{analysisLabels[analysis.data.status] || "Analysis status unavailable"}{analysis.data.error_code === "AI_DAILY_LIMIT" ? ". Daily AI allowance reached; queued for the next UTC day." : ""}{analysis.data.completed_at ? ` / Last completed ${new Date(analysis.data.completed_at).toLocaleString("en-GB", { timeZone: "UTC" })} UTC` : ""}</div>}
      <section className="metric-grid">
        <div className="metric"><span>Participants</span><strong>{total}</strong><small>{completed} completed</small></div>
        <div className="metric"><span>Observations</span><strong>{observationCount}</strong><small>Approved evidence</small></div>
        <div className="metric"><span>Themes</span><strong>{themes.data?.length || 0}</strong><small>Patterns forming</small></div>
        <div className="metric"><span>Findings</span><strong>{findings.data?.length || 0}</strong><small>Leadership review</small></div>
      </section>

      {viewer.role === "owner" && !parent && <MissionVisibilityControl mission={id} departments={directory.departments} scope={visibility.data?.scope || "management"} department={visibility.data?.department_id || ""} />}
      {canAdminister && (
        <section className="panel" style={{ marginBottom: 24 }}>
          <div className="panel-head"><h2>Participant invitation</h2><Link2 size={16} /></div>
          <div className="panel-body">
            {mission.data.status === "active" && (!(parent || governed) || viewer.role === "owner") && <AssignmentAudienceForm missionId={id} members={directory.members} departments={directory.departments} />}
            {parent || governed ? <p className="muted">Reviewed discussions use named recipients. Changes to this audience require the workspace owner.</p> : query.invite ? (
              <div className="copy-row"><div className="code-box">{query.invite}</div><CopyLink value={query.invite} /></div>
            ) : (
              <div className="page-header" style={{ margin: 0, alignItems: "center" }}>
                <div className="page-title"><p>Create a secure link to invite people into the discussion.</p></div>
                <form action={createMissionInvite}>
                  <input type="hidden" name="missionId" value={id} />
                  <button className="button button-dark" type="submit"><Plus size={15} />Create link</button>
                </form>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="content-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section className="panel">
            <div className="panel-head">
              <h2>Emerging intelligence</h2>
              {canManage(viewer.role) && <form action={`/api/missions/${id}/synthesise`} method="post">
                <button className="button button-quiet" type="submit"><RefreshCw size={14} />Synthesise evidence</button>
              </form>}
            </div>
            {findings.data?.length ? (
              <div className="row-list">{findings.data.map((finding) => (
                <div className="row-item" key={finding.id}>
                  <div>
                    <h3>{finding.title}</h3><p>{finding.summary}</p>
                    <div className="row-meta"><span className="chip green">{Math.round(Number(finding.confidence) * 100)}% confidence</span><span className="chip">{finding.impact} impact</span></div>
                    {finding.recommended_action && <p style={{ marginTop: 10 }}><strong>Recommended:</strong> {finding.recommended_action}</p>}
                    <EvidenceReferences missionId={id} references={(finding.evidence_summary || "").split("\n").filter(Boolean)} />
                    {canManage(viewer.role) && finding.recommended_action && <Link className="text-link" href={`/app/follow-ups?${new URLSearchParams({ title: finding.title.slice(0,160), description: finding.recommended_action.slice(0,1500), missionId: id })}`}>Review and assign follow-up</Link>}
                  </div>
                </div>
              ))}</div>
            ) : <div className="empty-state"><RefreshCw size={25} /><h3>Evidence is still forming</h3><p>Once participants have contributed, synthesise the approved observations into themes and findings.</p></div>}
          </section>

          {Boolean(themes.data?.length) && <section className="panel">
            <div className="panel-head"><h2>Themes</h2></div>
            <div className="row-list">{themes.data?.map(theme => <article className="row-item" key={theme.id}>
              <div><h3>{theme.title}</h3><p>{theme.description}</p><div className="row-meta"><span className="chip">{theme.evidence_count} observations</span><span className="chip">{theme.participant_count} contributors</span><span className="chip">{Math.round(Number(theme.confidence) * 100)}% confidence estimate</span></div></div>
            </article>)}</div>
          </section>}
          {Boolean(hypotheses.data?.length) && <section className="panel">
            <div className="panel-head"><h2>Hypotheses</h2></div>
            <div className="row-list">{hypotheses.data?.map(hypothesis => <article className="row-item" key={hypothesis.id}>
              <div><h3>{hypothesis.title}</h3><p>{hypothesis.description}</p><div className="row-meta"><span className="chip amber">{hypothesis.status}</span><span className="chip">{Math.round(Number(hypothesis.confidence) * 100)}% confidence estimate</span></div>
                <h4>Supporting evidence</h4><EvidenceReferences missionId={id} references={hypothesis.evidence_for || []} />
                <h4>Contrary evidence</h4>{hypothesis.evidence_against?.length ? <EvidenceReferences missionId={id} references={hypothesis.evidence_against} /> : <p>No contrary evidence cited. This is not proof of the hypothesis.</p>}
                {canManage(viewer.role) && <form action={investigateHypothesis}><input type="hidden" name="hypothesisId" value={hypothesis.id} /><button className="button button-quiet" type="submit">Investigate further <ArrowRight size={14} /></button></form>}
              </div>
            </article>)}</div>
          </section>}

          <section className="panel" id="approved-evidence">
            <div className="panel-head"><h2>Approved observations</h2><span className="chip">Private excluded</span></div>
            {observations.data?.length ? (
              <div className="row-list">{observations.data.map((observation) => (
                <div className="row-item" id={`evidence-${observation.id}`} key={observation.id}>
                  <div><h3>{observation.summary}</h3><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{observation.detail}</p><div className="row-meta"><span className="chip">{observation.category === "participant_response" ? "Written response" : observation.category}</span><span className="chip green">{observation.confidentiality}</span>{observation.confidentiality === "SHARE" && <span className="chip">{profileById.get(observation.user_id) || "Workspace member"}</span>}</div>
                    {canManage(viewer.role) && <Link className="text-link" style={{ marginTop: 12, display: "block" }} href={evidenceHref(id, observation.id)}>Open evidence <ArrowRight size={14} /></Link>}
                    {canManage(viewer.role) && <Link className="text-link" style={{ marginTop: 12, display: "inline-block" }} href={`/app/follow-ups?${new URLSearchParams({ title: observation.summary.slice(0,160), description: observation.detail.slice(0,1500), missionId: id })}`}>Create follow-up</Link>}
                  </div>
                  {observation.category !== "participant_response" && <span className="confidence">{Math.round(Number(observation.confidence) * 100)}%</span>}
                </div>
              ))}</div>
            ) : <div className="empty-state"><p>{observationCount ? "No observations on this page." : "No participant-approved observations yet."}</p></div>}
            {(lastPage > 1 || page > 1) && <nav className="evidence-pagination" aria-label="Evidence pages">
              {page > 1 && <Link className="button button-quiet" href={`?evidencePage=${Math.min(page - 1, lastPage)}#approved-evidence`}><ArrowLeft size={14} />Previous</Link>}
              <span>{observationCount} observations{page <= lastPage ? ` / Page ${page} of ${lastPage}` : ""}</span>
              {page < lastPage && <Link className="button button-quiet" href={`?evidencePage=${page + 1}#approved-evidence`}>Next <ArrowRight size={14} /></Link>}
            </nav>}
          </section>
        </div>

        <aside className="panel">
          <div className="panel-head"><h2>Participation</h2><Users size={16} /></div>
          {assignments.data?.length ? (
            <div className="row-list">{assignments.data.map((assignment) => (
              <div className="row-item" key={assignment.id}>
                <div><h3>{profileById.get(assignment.user_id) || "Participant"}</h3><div className="row-meta"><span className={`chip ${assignment.status === "completed" ? "green" : ""}`}>{assignment.status}</span>{assignment.mission_id !== id && <Link className="text-link" href={`/app/missions/${assignment.mission_id}`}>Follow-up discussion</Link>}</div></div>
              </div>
            ))}</div>
          ) : <div className="empty-state"><Users size={24} /><h3>No participants yet</h3><p>Share the invitation link to begin.</p></div>}
        </aside>
      </div>
      {canManage(viewer.role) && <AskFielded missionId={id} />}
    </div>
  );
}
