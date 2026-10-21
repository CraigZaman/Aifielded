import { ClipboardCheck, Send } from "lucide-react";
import { createFollowUp, sendClarification, updateFollowUp } from "@/app/app/actions";
import { canManage, requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Comment = { id: string; content: string; author_id: string; created_at: string };

export default async function FollowUpsPage({ searchParams }: { searchParams: Promise<{ message?: string; title?: string; description?: string; missionId?: string; assigneeId?: string }> }) {
  const viewer = await requireViewer();
  const { message, title, description, missionId, assigneeId } = await searchParams;
  const supabase = await createClient();
  let taskQuery = supabase.from("follow_up_tasks").select("*,follow_up_clarifications(id,content,created_at,author_id)").eq("organisation_id", viewer.organisationId);
  if (!canManage(viewer.role)) taskQuery = taskQuery.eq("assignee_id", viewer.id);
  const [tasks, people, missions] = await Promise.all([
    taskQuery.order("created_at", { ascending: false }),
    supabase.from("organisation_memberships").select("user_id,role").eq("organisation_id", viewer.organisationId).eq("status", "active"),
    supabase.from("missions").select("id,title").eq("organisation_id", viewer.organisationId).eq("status", "active"),
  ]);
  if (tasks.error || people.error || missions.error) throw new Error("Follow-up work could not be loaded. Please try again.");
  const profileIds = Array.from(new Set([
    ...(people.data?.map((membership) => membership.user_id) || []),
    ...(tasks.data?.flatMap((task) => [task.assignee_id, task.assigned_by, ...(task.follow_up_clarifications || []).map((item: Comment) => item.author_id)]) || []),
  ]));
  const profiles = profileIds.length ? await supabase.from("profiles").select("id,full_name").in("id", profileIds) : { data: [], error: null };
  if (profiles.error) throw new Error("Team names could not be loaded.");
  const names = new Map(profiles.data?.map((profile) => [profile.id, profile.full_name]) || []);
  const statuses = ["assigned", "acknowledged", "in_progress", "blocked", "completed"];
  return <div className="page">
    <header className="page-header"><div className="page-title"><h1>Follow-up work</h1><p>{canManage(viewer.role) ? "Team actions and policy acknowledgements" : "Your assigned tasks and policy acknowledgements"}</p></div></header>
    {message && <div className="form-message" role="status">{message}</div>}
    <div className="content-grid">
      <section className="panel">
        {tasks.data?.length ? <div className="row-list">{tasks.data.map((task) => <article className="row-item" style={{ display: "block", scrollMarginTop: 90 }} id={`task-${task.id}`} key={task.id}>
          <h3>{task.title}</h3><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{task.description}</p>
          <div className="row-meta">
            <span className={`chip ${task.status === "completed" ? "green" : task.status === "blocked" ? "amber" : ""}`}>{task.status.replaceAll("_", " ")}</span>
            <span className="chip">For {names.get(task.assignee_id) || "Workspace member"}</span>
            <span className="chip">From {names.get(task.assigned_by) || "Workspace manager"}</span>
            {task.due_at && <span className="chip">Due {new Date(task.due_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</span>}
            {task.completed_at && <span className="chip green">Completed {new Date(task.completed_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</span>}
          </div>
          {task.assignee_id === viewer.id && <form className="page-actions" style={{ marginTop: 14 }} action={updateFollowUp}>
            <input type="hidden" name="taskId" value={task.id} />
            <select className="field-input" aria-label={`Status for ${task.title}`} name="status" defaultValue={task.status === "assigned" ? "acknowledged" : task.status}>
              {statuses.map((status) => <option key={status} value={status} disabled={status === "assigned"}>{status.replaceAll("_", " ")}</option>)}
            </select><button className="button button-dark" type="submit">Update status</button>
          </form>}
          <div style={{ marginTop: 13 }}>
            {[...(task.follow_up_clarifications || [])].sort((a: Comment, b: Comment) => a.created_at.localeCompare(b.created_at)).map((item: Comment) => <div key={item.id} style={{ padding: "8px 10px", background: "#f3f6f4", marginBottom: 6 }}>
              <small>{names.get(item.author_id) || "Workspace member"} · {new Date(item.created_at).toLocaleString("en-GB", { timeZone: "UTC" })} UTC</small>
              <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.content}</p>
            </div>)}
            <form className="ask-form" action={sendClarification}>
              <input type="hidden" name="taskId" value={task.id} />
              <input name="content" minLength={2} maxLength={1200} required aria-label={`Reply on ${task.title}`} placeholder="Reply or explain a blocker..." />
              <button className="icon-button primary" title="Send reply" type="submit"><Send size={15} /></button>
            </form>
          </div>
        </article>)}</div> : <div className="empty-state"><ClipboardCheck size={27} /><h3>No follow-up work</h3></div>}
      </section>
      {canManage(viewer.role) && <aside className="panel form-panel">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Assign follow-up</h2>
        <form className="stack-form" action={createFollowUp}>
          <label>Team member<select name="assigneeId" required defaultValue={people.data?.some(member => member.user_id === assigneeId) ? assigneeId : ""}><option value="" disabled>Select a person</option>{people.data?.map((member) => <option value={member.user_id} key={member.user_id}>{names.get(member.user_id) || "Member"} · {member.role}</option>)}</select></label>
          <label>Title<input name="title" minLength={4} maxLength={160} required defaultValue={title?.slice(0,160)} /></label>
          <label>What needs to happen<textarea name="description" minLength={6} maxLength={1500} required defaultValue={description?.slice(0,1500)} /></label>
          <label>Mission<select name="missionId" defaultValue={missions.data?.some((mission) => mission.id === missionId) ? missionId : ""}><option value="">No linked mission</option>{missions.data?.map((mission) => <option key={mission.id} value={mission.id}>{mission.title}</option>)}</select></label>
          <label>Due date<input type="date" name="dueDate" /></label>
          <button className="button button-primary" type="submit">Assign follow-up</button>
        </form>
      </aside>}
    </div>
  </div>;
}
