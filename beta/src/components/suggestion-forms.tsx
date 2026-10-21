"use client";
import { useActionState } from "react";
import { ArrowUpRight, Check, X } from "lucide-react";
import { reviewSuggestion, submitSuggestion, clarifySuggestion, type SuggestionState } from "@/app/app/suggestions/actions";

function Result({state}:{state:SuggestionState}) {return <>{state.error&&<p className="form-message" role="alert">{state.error}</p>}{state.success&&<p className="form-message success" role="status">{state.success}</p>}</>;}
export function SuggestionForm({id}:{id:string}) {
 const [state,action,pending]=useActionState(submitSuggestion,{});
 return <form className="stack-form" action={action}><input type="hidden" name="id" value={id}/><label>What should we explore?<textarea name="question" required minLength={10} maxLength={500} rows={3}/></label><label>What have you noticed?<textarea name="contribution" required minLength={10} maxLength={5000} rows={5}/></label><label>Who might this involve?<select name="scope"><option value="department">My department</option><option value="organisation">Across the company</option></select></label><p className="role-note">Your question and contribution go to your department head, or the workspace owner if no head is appointed. This is not a confidential concern channel.</p><Result state={state}/><button className="button button-primary" disabled={pending||Boolean(state.success)}><ArrowUpRight size={16}/>{pending?"Sending...":"Send suggestion upwards"}</button></form>;
}
export function SuggestionReview({id,status,missions}:{id:string;status:string;missions:Array<{id:string;title:string}>}) {
 const [state,action,pending]=useActionState(reviewSuggestion,{});
 const waiting=status.startsWith("pending");
 if(status==="awaiting_clarification")return <p className="role-note">Waiting for the employee to clarify their suggestion.</p>;
 return <form className="stack-form" action={action}><input type="hidden" name="id" value={id}/><label>Response to the employee<textarea name="reply" required minLength={5} maxLength={1200} rows={3}/></label>{status==="accepted"&&<label>Approved mission<select name="mission"><option value="">Choose a published mission</option>{missions.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select></label>}<Result state={state}/><div className="page-actions">{waiting?<><button name="decision" value="approve" disabled={pending} className="button button-primary"><Check size={16}/>Approve next step</button><button name="decision" value="clarify" disabled={pending} className="button button-quiet">Request clarification</button>{status==="pending_head"&&<button name="decision" value="escalate" disabled={pending} className="button button-quiet">Escalate to owner</button>}<button name="decision" value="decline" disabled={pending} className="button button-quiet"><X size={16}/>Decline</button></>:<><button name="decision" value={status==="accepted"?"link":"complete"} disabled={pending} className="button button-primary"><Check size={16}/>{status==="accepted"?"Link mission and notify":"Share conclusion and close"}</button><button name="decision" value="discontinue" disabled={pending} className="button button-quiet">Discontinue with response</button></>}</div></form>;
}

export function SuggestionClarification({id}:{id:string}) {
 const[state,action,pending]=useActionState(clarifySuggestion,{});
 return <form action={action} className="stack-form"><input type="hidden" name="id" value={id}/><label>Your clarification<textarea name="reply" required minLength={5} maxLength={1200} rows={3}/></label><Result state={state}/><button className="button button-primary" disabled={pending}>Send clarification</button></form>;
}
