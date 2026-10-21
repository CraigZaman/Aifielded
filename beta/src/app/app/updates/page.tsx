import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function UpdatesPage() {
  const viewer = await requireViewer(), db = await createClient();
  const assignments = await db.from("mission_assignments").select("id,mission_id,status,missions(title)").eq("organisation_id",viewer.organisationId).eq("user_id",viewer.id).order("created_at", {ascending:false});
  if (assignments.error) throw new Error("Your updates could not be loaded.");
  const ids = (assignments.data || []).map(a => a.mission_id);
  const policies = ids.length ? await db.from("policy_communications").select("mission_id,version,briefing").in("mission_id",ids) : {data:[],error:null};
  if (policies.error) throw new Error("Your communications could not be loaded.");
  const rows = (assignments.data || []).filter(a => policies.data?.some(p => p.mission_id === a.mission_id));
  return <div className="page"><header className="page-header"><div className="page-title"><h1>Updates</h1><p>Communications for you</p></div></header><section className="panel">{rows.length ? <div className="row-list">{rows.map(a => <Link className="row-item" href={`/app/communications/respond/${a.id}`} key={a.id}><div><h3>{(a.missions as unknown as {title:string})?.title}</h3><p>{policies.data?.find(p => p.mission_id === a.mission_id)?.briefing}</p><span className="chip">{a.status}</span></div><ArrowRight size={18} /></Link>)}</div> : <div className="empty-state"><Megaphone size={28} /><p>No communications assigned.</p></div>}</section></div>;
}
