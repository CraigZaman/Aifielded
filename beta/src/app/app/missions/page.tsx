import Link from "next/link";
import { ArrowRight, Compass, Plus } from "lucide-react";
import { canManage, requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function MissionsPage() {
  const viewer = await requireViewer();
  const supabase = await createClient();
  const query = supabase.from("missions").select("id,title,objective,status,created_at,mission_assignments(count)").order("created_at", { ascending: false });
  const { data } = canManage(viewer.role) ? await query.eq("organisation_id", viewer.organisationId) : await query;
  return <div className="page"><header className="page-header"><div className="page-title"><h1>Missions</h1><p>Focused investigations into how your organisation works.</p></div>{canManage(viewer.role) && <div className="page-actions"><Link className="button button-primary" href="/app/missions/new"><Plus size={16} />Create mission</Link></div>}</header><section className="panel">{data?.length ? <div className="row-list">{data.map((mission) => <Link className="row-item" href={`/app/missions/${mission.id}`} key={mission.id}><div><h3>{mission.title}</h3><p>{mission.objective}</p><div className="row-meta"><span className="chip green">{mission.status}</span><span className="chip">{mission.mission_assignments?.[0]?.count || 0} participants</span></div></div><ArrowRight size={17} /></Link>)}</div> : <div className="empty-state"><Compass size={28} /><h3>No missions yet</h3><p>Create a focused question, invite participants and let Fielded follow the evidence.</p></div>}</section></div>;
}
