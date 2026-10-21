import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, Compass, FileText, MessageSquareText, Radio, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import type { Viewer } from "@/lib/types";

export type Mission = { id: string; title: string; objective: string; status: string; created_at: string; mission_assignments?: { id: string; status: string; user_id: string }[] };
type Task = { id: string; title: string; description: string; status: string; due_at: string | null };
type Signal = { id: string; category: string; summary: string; confidentiality: string; created_at: string };
type Finding = { id: string; title: string; summary: string; confidence: number; recommended_action: string | null };

function firstName(name: string) { return name.trim().split(/\s+/)[0] || "there"; }
function missionStage(status: string) {
  if (status === "completed") return "Action ready";
  if (status === "paused") return "Paused";
  if (status === "draft") return "Designing";
  return "Discovering";
}

export function ManagerDashboard({ viewer, missions, observations, findings, people, sourceCount, signals, leadingFindings, tasks = [] }: {
  viewer: Viewer;
  missions: Mission[];
  observations: number;
  findings: number;
  people: number;
  sourceCount: number;
  signals: Signal[];
  leadingFindings: Finding[];
  tasks?: Task[];
}) {
  const activeMissions = missions.filter((mission) => mission.status === "active");
  return (
    <div className="page organisation-overview">
      <header className="workspace-hero">
        <div>
          <span className="eyebrow">{viewer.role === "hr" ? "People and organisational dialogue" : "Organisation-wide intelligence"}</span>
          <h1>Good morning, {firstName(viewer.name)}.</h1>
          <p>The ongoing picture of how {viewer.organisationName} works, built from approved employee dialogue, missions and connected work systems.</p>
        </div>
      </header>

      <section className="overview-status">
        <div><span>Source channels</span><strong>{sourceCount}</strong><small>Approved files and connected records</small></div>
        <div><span>Active members</span><strong>{people}</strong><small>People in this workspace</small></div>
        <div><span>Active missions</span><strong>{activeMissions.length}</strong><small>Focused investigations</small></div>
        <div><span>Evidence base</span><strong>{observations}</strong><small>Participant-approved observations</small></div>
      </section>

      <section className="engine-flow" aria-label="Fielded evidence flow">
        <div><span>Listen</span><strong>Work channels and conversations</strong><small>Fielded dialogue, files, Slack and Google</small></div><ArrowRight size={18} />
        <div><span>Understand</span><strong>Permission-aware evidence engine</strong><small>Context, corroboration and contradictions</small></div><ArrowRight size={18} />
        <div><span>Improve</span><strong>Useful action at every level</strong><small>Employee support, team changes and decisions</small></div>
      </section>

      <div className="overview-columns">
        <section>
          <div className="section-title-row"><div><span className="eyebrow">Mission portfolio</span><h2>What {viewer.organisationName} is investigating</h2></div><Link href="/app/missions">View all missions <ArrowRight size={14} /></Link></div>
          {missions.length ? <div className="mission-portfolio">{missions.slice(0, 4).map((mission, index) => {
            const participantCount = mission.mission_assignments?.length || 0;
            const completed = mission.mission_assignments?.filter((item) => item.status === "completed").length || 0;
            const progress = participantCount ? Math.round(completed / participantCount * 100) : 0;
            return <Link className="portfolio-card" href={`/app/missions/${mission.id}`} key={mission.id}>
              <header><span>{String(index + 1).padStart(2, "0")}</span><em>{missionStage(mission.status)}</em></header>
              <h3>{mission.title}</h3><p>{mission.objective}</p>
              <div className="portfolio-progress"><span role="progressbar" aria-label="Conversations completed" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progress}%` }} /></span><strong>{completed} of {participantCount} complete</strong></div>
              <footer><span>Open mission intelligence</span><ArrowRight size={15} /></footer>
            </Link>;
          })}</div> : <div className="panel empty-state overview-empty"><Compass size={27} /><h3>Ask your first organisational question</h3><p>Create a focused mission and invite the people closest to the work. Fielded will follow the evidence and show where accounts agree or differ.</p><Link className="button button-primary" href="/app/missions">Open missions</Link></div>}
        </section>

        <aside className="overview-insights">
          <div className="section-title-row"><div><span className="eyebrow">Where Fielded can help</span><h2>Decision signals</h2></div><span className="count-label">{findings}</span></div>
          {leadingFindings.length ? leadingFindings.map((finding) => <article className="decision-signal" key={finding.id}>
            <span><SearchCheck size={13} />{Math.round(Number(finding.confidence) * 100)}% confidence</span><h3>{finding.title}</h3><p>{finding.summary}</p>{finding.recommended_action && <small>{finding.recommended_action}</small>}
          </article>) : <article className="decision-signal quiet"><Sparkles size={18} /><h3>Evidence is still forming</h3><p>Findings appear once approved observations support a traceable pattern.</p></article>}
          <Link className="button button-quiet button-full" href="/app/intelligence">Explore intelligence <ArrowRight size={15} /></Link>
        </aside>
      </div>

      <section className="dialogue-feed panel" style={{ marginBottom: 24 }}>
        <div className="panel-head"><h2>Delivery progress</h2><Link className="text-link" href="/app/follow-ups">All follow-up work <ArrowRight size={14} /></Link></div>
        <div className="panel-body"><div className="row-meta"><span className="chip">{tasks.length} assigned</span><span className="chip green">{tasks.filter((task) => task.status === "completed").length} completed</span><span className="chip amber">{tasks.filter((task) => task.status === "blocked").length} blocked</span></div></div>
        <div className="row-list">{tasks.slice(0,5).map((task) => <Link className="row-item" key={task.id} href={`/app/follow-ups#task-${task.id}`}><div><h3>{task.title}</h3><p>{task.description}</p></div><span className={`chip ${task.status === "completed" ? "green" : ""}`}>{task.status.replaceAll("_", " ")}</span></Link>)}</div>
      </section>

      <section className="dialogue-feed panel">
        <div className="panel-head"><div><span className="eyebrow">Continuous dialogue layer</span><h2>Organisational dialogue feed</h2></div><span className="status-pill"><span className="live-dot" />Permission-aware</span></div>
        {signals.length ? <div className="row-list">{signals.map((signal) => <div className="row-item signal-row" key={signal.id}>
          <span className="activity-icon">{signal.category === "policy" ? <ShieldCheck size={14} /> : <CircleDot size={14} />}</span>
          <div><div className="signal-head"><strong>{signal.category}</strong><time>{new Date(signal.created_at).toLocaleDateString()}</time></div><p>{signal.summary}</p></div>
          <span className={`chip ${signal.confidentiality === "CONTRIBUTE" ? "green" : ""}`}>{signal.confidentiality}</span>
        </div>)}</div> : <div className="empty-state"><Radio size={25} /><h3>The feed is ready</h3><p>Approved conversation notes and connected records will appear here. PRIVATE content is never included.</p></div>}
      </section>
    </div>
  );
}

export function ParticipantDashboard({ viewer, assignments, tasks }: { viewer: Viewer; assignments: Array<{ id: string; status: string; missions: { title: string; objective: string } | null }>; tasks: Task[] }) {
  const openAssignments = assignments.filter((item) => item.status === "invited" || item.status === "in_progress");
  const completedAssignments = assignments.filter((item) => item.status === "completed");
  const openTasks = tasks.filter((item) => item.status !== "completed");
  const activeConversation = openAssignments[0];
  return (
    <div className="page employee-workspace">
      <header className="employee-welcome"><div><span className="eyebrow">Your Fielded workspace</span><h1>Good morning, {firstName(viewer.name)}.<br /><span>Want to have a quick chat?</span></h1><p>Your conversation helps make work clearer. You control what stays private and what can contribute to {viewer.organisationName}.</p></div><span className="status-pill"><span className="live-dot" />Your perspective, in context</span></header>
      <section className="employee-engine panel"><div className="engine-avatar">F</div><div><span>Your digital deployed engineer</span><h2>What has your attention today?</h2><p>Talk through a process, bring a document, or continue a discussion requested by your organisation.</p></div>{activeConversation ? <Link className="button button-primary" href={`/app/conversations/${activeConversation.id}`}>Open conversation <ArrowRight size={15} /></Link> : <Link className="button button-quiet" href="/app/conversations">View conversations</Link>}</section>
      <section className="employee-summary"><div className="lead"><span>Needs your attention</span><strong>{openTasks.length + openAssignments.length}</strong><small>Follow-ups and conversations</small></div><div><span>Follow-ups</span><strong>{openTasks.length}</strong><small>Sent by your team</small></div><div><span>Active discussions</span><strong>{openAssignments.length}</strong><small>Digital fieldwork</small></div><div><span>Completed</span><strong>{completedAssignments.length}</strong><small>Approved contributions</small></div></section>

      <div className="employee-columns">
        <section>
          <div className="section-title-row"><div><span className="eyebrow">Digital fieldwork</span><h2>Your assignments</h2></div><Link href="/app/conversations">View all</Link></div>
          {openAssignments.length ? <div className="employee-card-list">{openAssignments.map((assignment) => <article className="employee-assignment" key={assignment.id}><header><span><MessageSquareText size={14} />Policy or mission</span><em>{assignment.status === "invited" ? "Ready to start" : "In progress"}</em></header><h3>{assignment.missions?.title || "Fielded conversation"}</h3><p>{assignment.missions?.objective}</p><footer><span><i className="live-dot" />Your draft is saved privately</span><Link className="button button-primary" href={`/app/conversations/${assignment.id}`}>{assignment.status === "invited" ? "Open assignment" : "Continue assignment"}</Link></footer></article>)}</div> : <div className="panel empty-state"><CheckCircle2 size={25} /><h3>You are up to date</h3><p>New policies and missions from your organisation will appear here.</p></div>}
        </section>
        <aside>
          <div className="section-title-row"><div><span className="eyebrow">Sent to you</span><h2>Follow-up work</h2></div><span className="count-label">{openTasks.length}</span></div>
          {openTasks.length ? <div className="employee-card-list">{openTasks.slice(0, 5).map((task) => <Link className="employee-task" href="/app/follow-ups" key={task.id}><header><span><FileText size={13} />Assigned action</span><em>{task.status.replace("_", " ")}</em></header><h3>{task.title}</h3><p>{task.description}</p><footer>{task.due_at ? `Due ${new Date(task.due_at).toLocaleDateString()}` : "No due date"}<ArrowRight size={14} /></footer></Link>)}</div> : <div className="panel empty-state"><CheckCircle2 size={25} /><h3>No open follow-ups</h3><p>Policy updates and actions from HR or your manager will appear here.</p></div>}
          <div className="employee-privacy"><ShieldCheck size={18} /><div><strong>Status is not conversation access.</strong><p>Your team can see whether assigned work is open or complete. They cannot read your conversation unless you approve a note to contribute or share.</p></div></div>
        </aside>
      </div>
    </div>
  );
}
