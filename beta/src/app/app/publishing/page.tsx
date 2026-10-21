import Link from "next/link";
import { ArrowRight, ClipboardCheck, Plus } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPublishingRule, approvalLabels, visibilityLabels } from "@/lib/publishing";
import { getCompanyAccess } from "@/lib/company";

const statuses: Record<string, string> = { pending_head: "Awaiting department head", pending_owner: "Awaiting owner", published: "Published", rejected: "Declined" };

export default async function PublishingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const viewer = await requireViewer();
  const query = await searchParams;
  const page = Math.min(10000, Math.max(1, Number.parseInt(query.page || "1", 10) || 1));
  const pageSize = 30;
  const db = await createClient();
  const [mission, policy, requests] = await Promise.all([
    getPublishingRule(viewer.organisationId, "mission"), getPublishingRule(viewer.organisationId, "policy"),
    db.from("publication_requests").select("id,author_id,head_id,kind,title:payload->>title,status,created_at", { count: "exact" }).eq("organisation_id", viewer.organisationId).order("status").order("created_at", { ascending: false }).order("id").range((page - 1) * pageSize, page * pageSize - 1),
  ]);
  if (requests.error) throw new Error("Publishing requests could not be loaded.");
  const companyAccess = await getCompanyAccess(viewer.organisationId);
  const rows = requests.data || [];
  return <div className="page">
    <header className="page-header"><div className="page-title"><span className="eyebrow">Authority and accountability</span><h1>Approvals</h1><p>{requests.count || 0} accessible requests. Pending reviews appear first.</p></div><div className="page-actions">{mission.allowed && <Link className="button button-primary" href="/app/missions/new"><Plus size={16} />Create mission</Link>}{policy.allowed && <Link className="button button-quiet" href="/app/communications/new"><Plus size={16} />Communicate a policy</Link>}</div></header>
    <section className="publishing-section"><div className="panel-head"><h2>Your publishing access</h2></div><div className="publishing-access-grid">{([['Mission', mission], ['Policy', policy]] as const).map(([label, rule]) => <div key={label}><h3>{label}</h3><strong>{rule.allowed ? "Enabled" : "Not enabled"}</strong>{rule.allowed && <p>{rule.audience_scope === "department" ? "Own department" : "Organisation"}<br />{approvalLabels[rule.approval || "none"]}<br />Intelligence: {visibilityLabels[rule.visibility || "management"]}</p>}</div>)}</div></section>
    <section className="publishing-section"><div className="panel-head"><h2>Requests and decisions</h2><ClipboardCheck size={18} /></div>{rows.length ? <div className="row-list">{rows.map(r => <div className="row-item" key={r.id}><div><span className={`chip ${r.status.startsWith("pending") ? "amber" : ""}`}>{statuses[r.status] || r.status}</span><h3>{String(r.title || "Publication request")}</h3><p>{r.kind === "policy" ? "Policy communication" : "Investigation mission"} / {new Date(r.created_at).toLocaleDateString("en-GB")}{r.author_id === viewer.id ? " / Your request" : ""}</p></div><Link href={`/app/publishing/${r.id}`} className="text-link">Review <ArrowRight size={16} /></Link></div>)}</div> : <div className="empty-state"><ClipboardCheck size={26} /><p>No publication requests on this page.</p></div>}<div className="page-actions">{page > 1 && <Link className="text-link" href={`/app/publishing?page=${page - 1}`}>Previous page</Link>}{page * pageSize < (requests.count || 0) && <Link className="text-link" href={`/app/publishing?page=${page + 1}`}>Next page <ArrowRight size={16} /></Link>}</div></section>
    {companyAccess.access > 0 && <Link className="text-link" href="/app/company?tab=access">Company access and publishing rules</Link>}
  </div>;
}
