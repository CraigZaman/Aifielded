import crypto from "node:crypto";
import Link from "next/link";
import {requireViewer} from "@/lib/auth";
import {createClient} from "@/lib/supabase/server";
import {ConcernForm,ConcernResponse} from "@/components/concern-forms";
import {ConcernAttachment} from "@/components/concern-attachment";
export default async function ConcernsPage(){
 const viewer=await requireViewer(),db=await createClient();
 const[route,cases]=await Promise.all([db.from("concern_routes").select("primary_handlers,alternate_handlers,guidance").eq("organisation_id",viewer.organisationId).maybeSingle(),db.from("confidential_concerns").select("id,author_id,title,body,status,response,created_at").eq("organisation_id",viewer.organisationId).order("created_at",{ascending:false}).limit(100)]);
 if(route.error||cases.error)throw new Error("The confidential reporting channel could not be loaded.");
 const contacts=await db.rpc("concern_contacts",{workspace:viewer.organisationId});
 const ids=(cases.data||[]).map(c=>c.id);
 const [updates,files,names]=await Promise.all([
 ids.length?db.from("concern_updates").select("id,concern_id,status,message,created_at").in("concern_id",ids).order("created_at"):Promise.resolve({data:[],error:null}),
 ids.length?db.from("concern_files").select("id,concern_id,filename").in("concern_id",ids):Promise.resolve({data:[],error:null}),
 Promise.all(ids.map(async id=>({id,result:await db.rpc("concern_reporter_name",{case_id:id})}))),
 ]);
 if(contacts.error||updates.error||files.error||names.some(n=>n.result.error))throw new Error("Case records could not be loaded.");
 return <div className="page"><header className="page-header"><div className="page-title"><span className="eyebrow">Restricted reporting channel</span><h1>Raise a concern</h1></div><Link href="/app/profile" className="text-link">Back to My Profile</Link></header>
 <section className="company-section"><p>Reports are separate from missions, ordinary Fielded chat and management dashboards. Only you and the designated case handlers can view them in Fielded. Your account identity is not anonymous.</p>{contacts.data&&<dl><dt>Primary reporting team</dt><dd>{contacts.data.primary.join(", ")}</dd><dt>Independent alternative</dt><dd>{contacts.data.alternate.join(", ")||"Not configured"}</dd></dl>}{route.data?.guidance&&<blockquote style={{whiteSpace:"pre-wrap"}}>{route.data.guidance}</blockquote>}{route.data?<ConcernForm id={crypto.randomUUID()} alternate={route.data.alternate_handlers.length>0}/>:<p className="form-message">Your company has not configured a reporting team. No report can be submitted here yet. Use the designated route in your company policy.</p>}</section>
 <section className="company-section"><h2>Your reports and assigned cases</h2>{!cases.data?.length&&<p className="empty-state">No reports available to this account.</p>}{cases.data?.map(c=><details className="company-document" key={c.id}><summary><strong>{c.title}</strong><span className="chip">{c.status}</span></summary><small>Reference {c.id} / {new Date(c.created_at).toLocaleDateString("en-GB")} / {names.find(n=>n.id===c.id)?.result.data||"Reporting person"}</small><p style={{whiteSpace:"pre-wrap"}}>{c.body}</p>{updates.data?.filter(u=>u.concern_id===c.id).map(u=><blockquote key={u.id}><small>{u.status} / {new Date(u.created_at).toLocaleString("en-GB")}</small><p style={{whiteSpace:"pre-wrap"}}>{u.message}</p></blockquote>)}<ul>{files.data?.filter(f=>f.concern_id===c.id).map(f=><li key={f.id}><a href={`/api/concerns/files/${f.id}`} className="text-link">{f.filename}</a></li>)}</ul>{c.author_id===viewer.id&&c.status!=="closed"&&<ConcernAttachment caseId={c.id}/>} {c.author_id!==viewer.id&&c.status!=="closed"&&<ConcernResponse id={c.id}/>}</details>)}</section></div>;
}
