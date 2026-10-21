import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { requireViewer, canManagePeople } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function CommunicationsPage() {
  const viewer = await requireViewer();
  if (!canManagePeople(viewer.role)) redirect("/app/conversations");
  const db = await createClient();
  const { data, error } = await db.from("policy_communications").select("mission_id,version,created_at,missions(title,status)").eq("organisation_id", viewer.organisationId).order("created_at", { ascending: false });
  if (error) throw new Error("Policy communications could not be loaded. Please try again.");
  return <div className="page"><header className="page-header"><div className="page-title"><h1>Policy communications</h1><p>Published policies, understanding checks and employee concerns.</p></div><Link className="button button-primary" href="/app/communications/new"><Plus size={16} />Communicate a policy</Link></header>
    <section className="row-list">{(data || []).map(p => { const mission = p.missions as unknown as { title: string; status: string }; return <Link className="row-item" href={`/app/communications/${p.mission_id}`} key={p.mission_id}><div><h2>{mission.title}</h2><p>{p.version}</p></div><span className="chip">{mission.status}</span><ArrowRight size={18} /></Link>; })}</section>
    {!data?.length && <div className="policy-section"><h2>No policies published yet</h2><Link className="text-link" href="/app/communications/new">Create your first policy communication <ArrowRight size={16} /></Link></div>}
    <Link className="text-link" href="/app/missions">Investigation missions <ArrowRight size={16} /></Link>
  </div>;
}
