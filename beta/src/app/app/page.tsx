import { ManagerDashboard, ParticipantDashboard } from "@/components/dashboard";
import { HRDashboard, TeamDashboard } from "@/components/role-dashboards";
import { canManage, requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { WorkActions } from "@/components/work-actions";

export default async function DashboardPage() {
  const viewer = await requireViewer();
  const supabase = await createClient();

  if (canManage(viewer.role)) {
    const [missions, observations, findings, people, sources, signals, leadingFindings, followUps] = await Promise.all([
      supabase
        .from("missions")
        .select("id,title,objective,status,created_at,mission_assignments(id,status,user_id)")
        .eq("organisation_id", viewer.organisationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("management_observations")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", viewer.organisationId)
        .eq("participant_approved", true)
        .neq("confidentiality", "PRIVATE"),
      supabase
        .from("findings")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", viewer.organisationId),
      supabase
        .from("organisation_memberships")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", viewer.organisationId)
        .eq("status", "active"),
      supabase
        .from("source_records")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", viewer.organisationId)
        .neq("confidentiality", "PRIVATE"),
      supabase
        .from("management_observations")
        .select("id,category,summary,confidentiality,created_at")
        .eq("organisation_id", viewer.organisationId)
        .eq("participant_approved", true)
        .neq("confidentiality", "PRIVATE")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("findings")
        .select("id,title,summary,confidence,recommended_action")
        .eq("organisation_id", viewer.organisationId)
        .order("confidence", { ascending: false })
        .limit(2),
      supabase.from("follow_up_tasks")
        .select("id,title,description,status,due_at")
        .eq("organisation_id", viewer.organisationId)
        .order("created_at", { ascending: false }),
    ]);

    const failed = [missions, observations, findings, people, sources, signals, leadingFindings, followUps].find((result) => result.error);
    if (failed?.error) throw new Error("Your workspace could not be loaded. Please refresh and try again.");
    if (viewer.role === "hr") return <><WorkActions/><HRDashboard viewer={viewer} missions={missions.data || []} tasks={followUps.data || []} signals={signals.data || []} people={people.count || 0} /></>;
    // Request-time snapshot in this authenticated server route, never a client render clock.
    // eslint-disable-next-line react-hooks/purity
    const asOf = Date.now();
    if (viewer.role === "manager") return <><WorkActions/><TeamDashboard viewer={viewer} missions={missions.data || []} tasks={followUps.data || []} signals={signals.data || []} people={people.count || 0} asOf={asOf} /></>;

    const proposals = viewer.role === "owner" ? await supabase.from("investigation_proposals").select("id",{count:"exact",head:true}).eq("organisation_id",viewer.organisationId).eq("status","pending") : { count:0,error:null };
    if (proposals.error) throw new Error("Investigation notifications could not be loaded.");
    return <><WorkActions/>
      {viewer.role === "owner" && Boolean(proposals.count) && <div className="page" style={{paddingBottom:0}}><div className="panel panel-body" role="status"><Link className="text-link" href="/app/investigations">{proposals.count} investigation proposals need your approval. Review and assign the next discussions.</Link></div></div>}
      <ManagerDashboard
        viewer={viewer}
        missions={missions.data || []}
        observations={observations.count || 0}
        findings={findings.count || 0}
        people={people.count || 0}
        sourceCount={sources.count || 0}
        signals={signals.data || []}
        leadingFindings={leadingFindings.data || []}
        tasks={followUps.data || []}
      />
    </>;
  }

  const [assignments, tasks] = await Promise.all([
    supabase
      .from("mission_assignments")
      .select("id,status,missions(title,objective)")
      .eq("user_id", viewer.id)
      .eq("organisation_id", viewer.organisationId)
      .order("created_at", { ascending: false }),
    supabase
      .from("follow_up_tasks")
      .select("id,title,description,status,due_at")
      .eq("assignee_id", viewer.id)
      .eq("organisation_id", viewer.organisationId)
      .order("created_at", { ascending: false }),
  ]);

  if (assignments.error || tasks.error) throw new Error("Your workspace could not be loaded. Please refresh and try again.");
  return <><WorkActions personal/><ParticipantDashboard viewer={viewer} assignments={(assignments.data || []) as never} tasks={tasks.data || []} /></>;
}
