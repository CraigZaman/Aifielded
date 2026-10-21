import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PolicyCheck } from "@/components/policy-check";

export default async function PolicyResponsePage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const viewer = await requireViewer();
  const { assignmentId } = await params;
  const db = await createClient();
  const assignment = await db.from("mission_assignments").select("id,mission_id,status,missions(title,status)").eq("id", assignmentId).eq("user_id", viewer.id).eq("organisation_id", viewer.organisationId).maybeSingle();
  if (assignment.error) throw new Error("The assignment could not be loaded.");
  if (!assignment.data) notFound();
  const policy = await db.from("policy_communications").select("version,policy_text,briefing,questions,source_name").eq("mission_id", assignment.data.mission_id).maybeSingle();
  const result = await db.rpc("policy_check_result", { target_assignment: assignmentId });
  if (policy.error || result.error) throw new Error("The policy check could not be loaded.");
  if (!policy.data) notFound();
  const mission = assignment.data.missions as unknown as { title: string; status: string };
  const open = ["invited", "in_progress"].includes(assignment.data.status) && mission.status === "active";
  return <div className="page"><header className="page-header"><div className="page-title"><Link className="text-link" href="/app"><ArrowLeft size={16} />Back to dashboard</Link><h1>{mission.title}</h1><p>Policy version: {policy.data.version}</p></div>{open && <Link className="button button-quiet" href={`/app/conversations/${assignmentId}`}>Discuss with Fielded</Link>}</header>
    <section className="policy-section"><h2>Policy briefing</h2><p className="policy-copy">{policy.data.briefing}</p><details><summary>Read the published policy</summary><p className="policy-copy">{policy.data.policy_text}</p></details></section>
    {open || result.data ? <PolicyCheck assignmentId={assignmentId} questions={policy.data.questions} initialResult={result.data} /> : <p>Responses to this communication are closed.</p>}
  </div>;
}
