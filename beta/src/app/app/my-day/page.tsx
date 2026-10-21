import { ParticipantDashboard } from "@/components/dashboard";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WorkActions } from "@/components/work-actions";

export default async function MyDayPage() {
  const viewer = await requireViewer(), db = await createClient();
  const [assignments,tasks] = await Promise.all([
    db.from("mission_assignments").select("id,status,missions(title,objective)").eq("user_id",viewer.id).eq("organisation_id",viewer.organisationId).order("created_at", {ascending:false}),
    db.from("follow_up_tasks").select("id,title,description,status,due_at").eq("assignee_id",viewer.id).eq("organisation_id",viewer.organisationId).order("created_at", {ascending:false}),
  ]);
  if (assignments.error || tasks.error) throw new Error("Your personal work could not be loaded.");
  return <><WorkActions personal/><ParticipantDashboard viewer={viewer} assignments={(assignments.data || []) as never} tasks={tasks.data || []} /></>;
}
