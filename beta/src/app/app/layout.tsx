import { AppShell } from "@/components/app-shell";
import { requireViewer } from "@/lib/auth";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCompanyAccess } from "@/lib/company";
import { getWorkspaceAccess } from "@/lib/entitlements";
import { daysRemaining } from "@/lib/plans";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  const access = await getWorkspaceAccess(viewer.organisationId);
  const company = await getCompanyAccess(viewer.organisationId);
  const db = await createClient();
  let query = db.from("publication_requests").select("id", { count: "exact", head: true }).eq("organisation_id", viewer.organisationId).neq("author_id", viewer.id);
  query = viewer.role === "owner" ? query.eq("status", "pending_owner") : query.eq("status", "pending_head").eq("head_id", viewer.id);
  const pending = await query;
  if (pending.error) throw new Error("Your approval notifications could not be loaded.");
  return <AppShell viewer={viewer} companyAccess={Object.values(company).some(level => level > 0)}><div className={`workspace-trial-banner ${access.active ? "" : "expired"}`} role="status"><span>{access.state === "trial" ? `30-day trial · ${daysRemaining(access.ends_at)} days left` : access.state === "tester" ? "Complimentary tester workspace" : access.state === "expired" ? "Trial ended · workspace is read-only" : "Workspace subscription active"}</span><Link href="/billing">Workspace plan</Link></div>{Boolean(pending.count) && <div className="approval-inbox" role="status"><Link href="/app/publishing">{pending.count} publication {pending.count === 1 ? "request needs" : "requests need"} your review.</Link></div>}{children}</AppShell>;
}
