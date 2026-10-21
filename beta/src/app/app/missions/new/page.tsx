import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { MissionLaunchForm } from "@/components/mission-launch-form";
import { requireViewer } from "@/lib/auth";
import { getPublishingDirectory, getPublishingRule } from "@/lib/publishing";

export default async function NewMissionPage({ searchParams }: { searchParams: Promise<{ message?: string; title?: string; objective?: string }> }) {
  const viewer = await requireViewer();
  const rule = await getPublishingRule(viewer.organisationId, "mission");
  if (!rule.allowed) redirect("/app/publishing");
  const { message, title, objective } = await searchParams;
  const {members,departments}=await getPublishingDirectory(viewer.organisationId, "mission");

  return <div className="page">
    <header className="page-header"><div className="page-title"><h1>Create a mission</h1><p>Give Fielded a clear question for your organisation.</p></div></header>
    <div className="two-column-form">
      <MissionLaunchForm requestId={crypto.randomUUID()} members={members} departments={departments} message={message} approval={rule.approval} directDepartment={rule.direct_department} audienceScope={rule.audience_scope} allowInviteOnly={viewer.role === "owner"} initialBrief={{ title: title?.slice(0,120) || "", objective: objective?.slice(0,2000) || "" }} />
      <aside className="panel sticky-panel mission-brief"><h3>Strong mission questions</h3><div className="example-prompts"><div>Where are we losing time between sales and delivery?</div><div>Why are preventable customer escalations increasing?</div><div>Which manual processes should we redesign before adding more headcount?</div><div>What does leadership misunderstand about frontline work?</div></div></aside>
    </div>
  </div>;
}
