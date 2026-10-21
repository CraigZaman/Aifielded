import crypto from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { getPublishingDirectory, getPublishingRule } from "@/lib/publishing";
import { PolicyLaunchForm } from "@/components/policy-launch-form";

export default async function NewCommunicationPage() {
  const viewer = await requireViewer();
  const rule = await getPublishingRule(viewer.organisationId, "policy");
  if (!rule.allowed) redirect("/app/publishing");
  const directory=await getPublishingDirectory(viewer.organisationId, "policy");
  return <div className="page"><header className="page-header"><div className="page-title"><Link href="/app/communications" className="text-link"><ArrowLeft size={16} />Communications</Link><h1>Communicate a policy</h1><p>Briefing, employee dialogue and checked understanding.</p></div></header>
    <PolicyLaunchForm requestId={crypto.randomUUID()} members={directory.members} departments={directory.departments} approval={rule.approval} directDepartment={rule.direct_department} audienceScope={rule.audience_scope} />
  </div>;
}
