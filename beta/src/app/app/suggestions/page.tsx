import crypto from "node:crypto";
import Link from "next/link";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuggestionForm,SuggestionReview,SuggestionClarification } from "@/components/suggestion-forms";

const labels:Record<string,string>={pending_head:"With department head",pending_owner:"With workspace owner",awaiting_clarification:"Clarification requested",accepted:"Accepted for investigation",declined:"Declined",underway:"Investigation underway",completed:"Conclusion shared",discontinued:"Discontinued"};
export default async function SuggestionsPage() {
 const viewer=await requireViewer(),db=await createClient();
 const {data:rows,error}=await db.from("mission_suggestions").select("*").eq("organisation_id",viewer.organisationId).order("created_at",{ascending:false}).limit(100);
 if(error)throw new Error("Mission suggestions could not be loaded.");
 const reviews=await Promise.all((rows||[]).filter(r=>r.author_id!==viewer.id).map(async r=>({id:r.id,allowed:(await db.rpc("can_review_suggestion",{suggestion_id:r.id})).data===true})));
 const missions=reviews.some(r=>r.allowed)?await db.from("missions").select("id,title").eq("organisation_id",viewer.organisationId).eq("status","active").limit(100):{data:[],error:null};
 if(missions.error)throw new Error("Available missions could not be loaded.");
 const history=rows?.length?await db.from("suggestion_messages").select("id,suggestion_id,actor_id,kind,message,created_at").in("suggestion_id",rows.map(r=>r.id)).order("created_at",{ascending:true}).limit(1000):{data:[],error:null};
 if(history.error)throw new Error("Suggestion history could not be loaded.");
 return <div className="page"><header className="page-header"><div className="page-title"><span className="eyebrow">Employee voice</span><h1>Mission suggestions</h1></div><Link className="text-link" href="/app/my-day">Back to My Day</Link></header>
 <section className="company-section"><details><summary>Suggest a question to explore</summary><SuggestionForm id={crypto.randomUUID()}/></details></section>
 <section className="company-section"><h2>Your suggestions and review queue</h2>{!rows?.length&&<p className="empty-state">No suggestions yet.</p>}{rows?.map(r=><article key={r.id} className="company-document">
 <div className="section-title-row"><h3>{r.question}</h3><span className="chip">{labels[r.status]}</span></div><p style={{whiteSpace:"pre-wrap"}}>{r.contribution}</p><small>{r.author_id===viewer.id?"Your suggestion":"Submitted for your review"} / {r.requested_scope==="organisation"?"Across the company":"Department"}</small>
 {history.data?.filter(m=>m.suggestion_id===r.id).map(m=><blockquote key={m.id}><small>{m.actor_id===viewer.id?"You":m.kind==="employee_reply"?"Employee clarification":"Review response"} / {new Date(m.created_at).toLocaleString("en-GB")}</small><p style={{whiteSpace:"pre-wrap"}}>{m.message}</p></blockquote>)}
 {r.author_id===viewer.id&&r.status==="awaiting_clarification"&&<SuggestionClarification id={r.id}/>}
 {reviews.some(a=>a.id===r.id&&a.allowed)&&!["declined","completed","discontinued"].includes(r.status)&&<><hr/>{r.status==="accepted"&&<Link className="text-link" href={`/app/missions/new?title=${encodeURIComponent(r.question.slice(0,120))}&objective=${encodeURIComponent(r.question+"\n\nEmployee-proposed context, not yet corroborated: "+r.contribution.slice(0,1000))}`}>Create mission from this question</Link>}<SuggestionReview id={r.id} status={r.status} missions={missions.data||[]}/></>}</article>)}</section></div>;
}
