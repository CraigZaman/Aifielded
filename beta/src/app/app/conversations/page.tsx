import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ConversationsPage() {
  const viewer = await requireViewer();
  const supabase = await createClient();
  const { data, error } = await supabase.from("mission_assignments").select("id,status,created_at,missions(title,objective)").eq("user_id", viewer.id).eq("organisation_id", viewer.organisationId).order("created_at", { ascending: false });
  if (error) throw new Error("Your assignments could not be loaded. Please refresh and try again.");
  return <div className="page"><header className="page-header"><div className="page-title"><h1>Conversations</h1><p>Your direct dialogue with Fielded.</p></div></header><section className="panel">{data?.length ? <div className="row-list">{data.map((item) => { const mission = item.missions as unknown as { title: string; objective: string } | null; return <Link className="row-item" href={`/app/conversations/${item.id}`} key={item.id}><div><h3>{mission?.title}</h3><p>{mission?.objective}</p><div className="row-meta"><span className={`chip ${item.status === "completed" ? "" : "green"}`}>{item.status}</span></div></div><ArrowRight size={17} /></Link>; })}</div> : <div className="empty-state"><MessageSquareText size={27} /><h3>No conversations assigned</h3><p>When your organisation invites you into a mission, it will appear here.</p></div>}</section></div>;
}
