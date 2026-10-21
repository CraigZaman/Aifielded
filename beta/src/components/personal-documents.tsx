"use client";
import {useActionState,useState} from "react";
import {Save,Trash2} from "lucide-react";
import {ContextFileInput} from "@/components/context-file-input";
import {addPersonalDocument,managePersonalDocument} from "@/app/app/profile/actions";

export function PersonalDocumentForm({id}:{id:string}) {
 const[state,action,pending]=useActionState(addPersonalDocument,{}),[content,setContent]=useState(""),[source,setSource]=useState("");
 return <form action={action} className="stack-form"><input type="hidden" name="id" value={id}/><label>Title<input name="title" required minLength={2} maxLength={160}/></label><ContextFileInput purpose="dialogue" disabled={pending} onExtract={(text,name)=>{setContent(text);setSource(name);}}/><label>Source<input name="source" value={source} onChange={e=>setSource(e.target.value)} maxLength={300}/></label><label>Reference text<textarea name="content" value={content} onChange={e=>setContent(e.target.value)} required maxLength={50000} rows={7}/></label><label className="company-checkbox"><input name="allowDialogue" type="checkbox"/>Allow Fielded to use this document in my private conversations</label><p className="role-note">Private to your account. Only reviewed text is stored, not the original file. Personal contracts are optional and are never published to your company library.</p>{state.error&&<p role="alert" className="form-message">{state.error}</p>}{state.success&&<p role="status" className="form-message success">{state.success}</p>}<button className="button button-primary" disabled={pending||Boolean(state.success)}><Save size={16}/>Save private reference</button></form>;
}

export function PersonalDocumentActions({id,allowed}:{id:string;allowed:boolean}) {
 const[state,action,pending]=useActionState(managePersonalDocument,{}),[confirm,setConfirm]=useState(false);
 return <form action={action} className="stack-form"><input type="hidden" name="id" value={id}/><div className="page-actions"><button className="button button-quiet" name="decision" value={allowed?"exclude":"allow"} disabled={pending}>{allowed?"Exclude from future dialogue":"Allow in my dialogue"}</button>{confirm?<button className="button button-quiet" name="decision" value="delete" disabled={pending}><Trash2 size={16}/>Confirm deletion</button>:<button type="button" className="button button-quiet" title="Delete reference" aria-label="Delete reference" onClick={()=>setConfirm(true)}><Trash2 size={16}/></button>}</div>{state.error&&<p role="alert">{state.error}</p>}{state.success&&<p role="status">{state.success}</p>}</form>;
}
