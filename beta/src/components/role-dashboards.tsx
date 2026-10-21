import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, MessageSquareText, Plus, ShieldCheck } from "lucide-react";
import type { Mission } from "@/components/dashboard";
import type { Viewer } from "@/lib/types";

type Task = { id: string; title: string; description: string; status: string; due_at: string | null };
type Signal = { id: string; category: string; summary: string; confidentiality: string; created_at: string };
type Props = { viewer: Viewer; missions: Mission[]; tasks: Task[]; signals: Signal[]; people: number };

function progress(mission: Mission) {
  const assignments = mission.mission_assignments || [];
  const complete = assignments.filter((item) => item.status === "completed").length;
  return { total: assignments.length, complete, percent: assignments.length ? Math.round(complete / assignments.length * 100) : 0 };
}

function Portfolio({ missions, heading }: { missions: Mission[]; heading: string }) {
  return <section className="role-portfolio"><div className="section-title-row"><div><span className="eyebrow">Mission portfolio</span><h2>{heading}</h2></div><Link href="/app/missions">View all <ArrowRight size={14} /></Link></div>
    {missions.length ? missions.map((mission) => {
      const value = progress(mission);
      return <Link href={`/app/missions/${mission.id}`} className="role-mission-row" key={mission.id}><span className="role-mission-icon"><ClipboardCheck size={19} /></span><div><h3>{mission.title}</h3><p>{mission.objective}</p></div><div className="role-completion"><small>Completion</small><strong>{value.percent}%</strong><span role="progressbar" aria-label={`${mission.title} completion`} aria-valuenow={value.percent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${value.percent}%` }} /></span></div><span className="chip">{mission.status}</span><ArrowRight size={16} /></Link>;
    }) : <div className="empty-state"><ClipboardCheck size={24} /><h3>No missions yet</h3><Link href="/app/missions" className="button button-primary"><Plus size={16} />Open missions</Link></div>}
  </section>;
}

function TaskRegister({ tasks, heading }: { tasks: Task[]; heading: string }) {
  return <section className="role-task-register"><div className="section-title-row"><div><span className="eyebrow">Close the loop</span><h2>{heading}</h2></div><Link href="/app/follow-ups">Manage actions <ArrowRight size={14} /></Link></div>
    {tasks.length ? tasks.slice(0, 8).map((task) => <Link className="role-task-row" href="/app/follow-ups" key={task.id}><span className={`role-task-state ${task.status === "blocked" ? "blocked" : ""}`}><ClipboardCheck size={17} /></span><div><h3>{task.title}</h3><p>{task.description}</p></div><time>{task.due_at ? new Date(task.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) : "No due date"}</time><span className={`chip ${task.status === "blocked" ? "amber" : ""}`}>{task.status.replaceAll("_", " ")}</span></Link>) : <div className="empty-state"><CheckCircle2 size={24} /><h3>No outstanding actions</h3></div>}
  </section>;
}

function Feedback({ signals, title }: { signals: Signal[]; title: string }) {
  return <aside className="role-feedback"><div className="section-title-row"><div><span className="eyebrow">Approved contributions</span><h2>{title}</h2></div><MessageSquareText size={20} /></div>{signals.length ? signals.map((signal) => <article key={signal.id}><span className="eyebrow">{signal.category}</span><h3>{signal.summary}</h3><small>{signal.confidentiality === "SHARE" ? "Shared observation" : "Contributed observation"}</small></article>) : <div className="empty-state"><ShieldCheck size={23} /><h3>No approved feedback yet</h3></div>}<Link className="text-link" href="/app/intelligence">Review intelligence <ArrowRight size={14} /></Link></aside>;
}

export function HRDashboard({ viewer, missions, tasks, signals, people }: Props) {
  const assignments = missions.flatMap((mission) => mission.mission_assignments || []);
  const reached = new Set(assignments.filter((item) => item.status === "in_progress" || item.status === "completed").map((item) => item.user_id)).size;
  const completed = assignments.filter((item) => item.status === "completed").length;
  const outstanding = tasks.filter((task) => task.status !== "completed");
  const active = missions.find((mission) => mission.status === "active");
  const activeProgress = active ? progress(active) : null;
  return <div className="page hr-workspace"><header className="workspace-hero"><div><span className="eyebrow">People &amp; policy assurance</span><h1>Good morning, {viewer.name.trim().split(/\s+/)[0]}.</h1><p>Communications, employee questions and follow-through across {viewer.organisationName}.</p></div><Link className="button button-primary" href="/app/communications/new"><Plus size={16} />Communicate a policy</Link></header>
    <section className="hr-command-band"><div><span className="eyebrow">People workspace</span><h2>Communicate. Listen. Follow through.</h2></div><div className="hr-command-steps"><span><b>01</b>Publish</span><ArrowRight size={16} /><span><b>02</b>Discuss</span><ArrowRight size={16} /><span><b>03</b>Review</span><ArrowRight size={16} /><span><b>04</b>Act</span></div></section>
    <section className="role-kpis"><div><span>People reached</span><strong>{reached}</strong><small>Of {people} active members</small></div><div><span>Conversations complete</span><strong>{completed}</strong><small>Completed assignments</small></div><div><span>Live missions</span><strong>{missions.filter((item) => item.status === "active").length}</strong><small>Active missions</small></div><div className="attention"><span>Blocked actions</span><strong>{outstanding.filter((item) => item.status === "blocked").length}</strong><small>Need attention</small></div><div><span>Open follow-ups</span><strong>{outstanding.length}</strong><small>Assigned employee work</small></div></section>
    <div className="role-overview-grid"><section className="hr-current-communication"><div className="section-title-row"><span className="eyebrow">Current mission</span><span className="chip green">{active ? "Active" : "Not started"}</span></div><h2>{active?.title || "Your next people mission"}</h2><p>{active?.objective || "No active mission has been published."}</p>{active && activeProgress ? <><div className="hr-completion-line"><span>Conversations complete</span><strong>{activeProgress.complete} / {activeProgress.total}</strong></div><div className="role-progress-track" role="progressbar" aria-label="Communication completion" aria-valuenow={activeProgress.percent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${activeProgress.percent}%` }} /></div><Link href={`/app/missions/${active.id}`} className="button button-primary">Open mission <ArrowRight size={16} /></Link></> : <Link href="/app/missions" className="button button-primary"><Plus size={16} />Open missions</Link>}</section><Feedback signals={signals} title="Employee feedback" /></div>
    <Portfolio missions={missions} heading="Missions and communications" /><TaskRegister tasks={outstanding} heading="Employee follow-ups" />
  </div>;
}

export function TeamDashboard({ viewer, missions, tasks, signals, people, asOf }: Props & { asOf: number }) {
  const outstanding = tasks.filter((task) => task.status !== "completed");
  const blocked = outstanding.filter((task) => task.status === "blocked");
  const due = outstanding.filter((task) => task.due_at && new Date(task.due_at).getTime() < asOf);
  const queue = [...blocked, ...outstanding.filter((task) => task.status !== "blocked")];
  return <div className="page team-workspace"><header className="workspace-hero"><div><span className="eyebrow">Management workspace</span><h1>Work in focus.</h1><p>{viewer.name.trim().split(/\s+/)[0]}, here is the work, feedback and follow-through across {viewer.organisationName}.</p></div><Link className="button button-primary" href="/app/follow-ups"><Plus size={16} />Assign follow-up</Link></header>
    <section className="role-kpis"><div><span>Active members</span><strong>{people}</strong><small>Workspace membership</small></div><div><span>Active missions</span><strong>{missions.filter((item) => item.status === "active").length}</strong><small>Work under investigation</small></div><div><span>Open actions</span><strong>{outstanding.length}</strong><small>Assigned follow-ups</small></div><div className="attention"><span>Blocked</span><strong>{blocked.length}</strong><small>Need a decision</small></div><div><span>Past due</span><strong>{due.length}</strong><small>Awaiting completion</small></div></section>
    <div className="role-overview-grid"><TaskRegister tasks={queue} heading="What needs your attention" /><Feedback signals={signals} title="What people are reporting" /></div><Portfolio missions={missions} heading="Operational investigations" />
  </div>;
}
