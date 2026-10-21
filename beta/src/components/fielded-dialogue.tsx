"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import Link from "next/link";
import {MessageCircle,Send,X,RotateCcw,LockKeyhole} from "lucide-react";
import {ContextFileInput} from "@/components/context-file-input";
type Turn={id:string;question:string;answer:string|null;status:string;purpose:string;seen:boolean};
type Schedule={zone:string;start:number;end:number;weekdays:boolean};
type Inbox={turns:Turn[];unread:number;proactive:boolean;schedule?:Schedule};

export function FieldedDialogue({userId}:{userId:string}) {
 const dialog=useRef<HTMLDialogElement>(null),open=useRef(false),sending=useRef(false),requestId=useRef<string|null>(null);
 const [inbox,setInbox]=useState<Inbox>({turns:[],unread:0,proactive:false}),[draft,setDraft]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 const load=useCallback(async()=>{
  try {const response=await fetch("/api/dialogue",{cache:"no-store"});if(!response.ok)throw new Error("Your dialogue could not be loaded.");const data:Inbox=await response.json();setInbox(data);
   if(open.current){const ids=data.turns.filter(t=>!t.seen&&t.status==="completed").map(t=>t.id);if(ids.length){const read=await fetch("/api/dialogue",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"read",ids})});if(read.ok)setInbox(current=>({...current,unread:Math.max(0,current.unread-ids.length)}));}}
  }catch(e){if(open.current)setError(e instanceof Error?e.message:"Connection interrupted.");}
 },[setError,setInbox]);
 useEffect(()=>{const initial=setTimeout(()=>void load(),0);const interval=setInterval(()=>{if(document.visibilityState==="visible")void load();},60000);return()=>{clearTimeout(initial);clearInterval(interval);};},[load,userId]);
 async function send(turn?:Turn){
  if(sending.current)return;const content=turn?.question||draft.trim();if(!content||content.length>8000)return;
  sending.current=true;setBusy(true);setError("");const id=turn?.id||requestId.current||crypto.randomUUID();if(!turn)requestId.current=id;
  try{const response=await fetch("/api/dialogue",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"send",id,content})});const result=await response.json();if(result.saved||response.ok){if(!turn){setDraft("");requestId.current=null;}setNotice("");}if(!response.ok)throw new Error(result.error||"Response failed.");}
  catch(e){setError(e instanceof Error?e.message:"Connection interrupted. Retry the same message to check its status.");}
  finally{sending.current=false;setBusy(false);await load();}
 }
 async function preference(value:boolean){const response=await fetch("/api/dialogue",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"preferences",proactive:value})});if(!response.ok)setError("Your preference could not be saved.");else await load();}
 async function defer(id:string,decision:"later"|"unknown") {
  try{const response=await fetch("/api/dialogue",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"defer",id,decision})});if(!response.ok)throw new Error();setNotice(decision==="later"?"Work-context prompts paused for seven days.":"Fielded will not repeat this context prompt.");await load();}catch{setError("The prompt preference could not be saved.");}
 }
 return <><button className="fielded-chat-launcher" aria-label={`Open Fielded chat${inbox.unread?`, ${inbox.unread} unread`:""}`} title="Fielded chat" onClick={()=>{dialog.current?.showModal();open.current=true;setError("");void load();}}><span className="fielded-chat-caption">Fielded</span><MessageCircle size={24}/>{inbox.unread>0&&<span className="chat-unread">{inbox.unread>99?"99+":inbox.unread}</span>}</button>
 <dialog className="fielded-chat-dialog" ref={dialog} onClose={()=>{open.current=false;}}><header><div><strong>Fielded</strong><small><LockKeyhole size={12}/>Private discussion</small></div><button type="button" title="Close dialogue" aria-label="Close dialogue" onClick={()=>dialog.current?.close()}><X size={20}/></button></header>
 <div className="open-dialogue-history" aria-live="polite" aria-busy={busy}>{!inbox.turns.length&&<p>Hello. Want to have a quick chat about your work?</p>}{inbox.turns.map(t=><article key={t.id}>{t.question&&<div className="open-message mine"><small>You</small><p>{t.question}</p></div>}{t.answer&&<div className="open-message"><small>{t.purpose}</small><p>{t.answer}</p>{!t.question&&<div className="page-actions"><button type="button" className="text-link" onClick={()=>void defer(t.id,"later")}>Not now</button><button type="button" className="text-link" onClick={()=>void defer(t.id,"unknown")}>I do not know</button></div>}</div>}{t.status!=="completed"&&<button type="button" className="text-link" disabled={busy} onClick={()=>send(t)}><RotateCcw size={14}/>{t.status==="failed"?"Retry reply":"Check pending reply"}</button>}</article>)}</div>
 <div className="open-dialogue-compose"><details><summary>Check-in preferences</summary><label className="policy-choice"><input type="checkbox" checked={inbox.proactive} onChange={e=>void preference(e.target.checked)}/><span>Allow optional work-context check-ins</span></label><DialogueSchedule key={JSON.stringify(inbox.schedule)} schedule={inbox.schedule} proactive={inbox.proactive} onSaved={load}/></details>{notice&&<p className="form-message">{notice}</p>}{error&&<p className="form-message" role="alert">{error}</p>}
 <form onSubmit={e=>{e.preventDefault();void send();}}><label className="sr-only" htmlFor="open-dialogue-draft">Your message</label><textarea id="open-dialogue-draft" value={draft} maxLength={8000} rows={3} placeholder="What is on your mind?" disabled={busy} onChange={e=>{setDraft(e.target.value);requestId.current=null;}}/><div className="open-dialogue-toolbar"><ContextFileInput purpose="dialogue" disabled={busy} onExtract={(text,name)=>{if(text.length>8000){setError("This file exceeds the message limit. Use a shorter excerpt or file.");return;}setDraft(text);requestId.current=null;setNotice(`Review the extracted text from ${name} before sending. The original file is not retained.`);}}/><button type="submit" className="button button-primary" title="Send message" aria-label="Send message" disabled={busy||!draft.trim()}><Send size={18}/></button></div></form><footer><Link href="/app/suggestions">Suggest a mission</Link><Link href="/app/profile">My Profile</Link><Link href="/app/conversations">My discussions</Link></footer></div></dialog></>;
}

function DialogueSchedule({schedule,proactive,onSaved}:{schedule?:Schedule;proactive:boolean;onSaved:()=>Promise<void>}) {
 const[error,setError]=useState(""),[busy,setBusy]=useState(false);
 return <form className="stack-form" onSubmit={async e=>{e.preventDefault();const form=new FormData(e.currentTarget);setBusy(true);setError("");try{const response=await fetch("/api/dialogue",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"schedule",proactive,zone:form.get("zone"),start:Number(form.get("start")),end:Number(form.get("end")),weekdays:form.get("weekdays")==="on"})});if(!response.ok)throw new Error();await onSaved();}catch{setError("Choose a valid timezone and an end hour after the start hour.");}finally{setBusy(false);}}}>
 <label>Timezone<input name="zone" defaultValue={schedule?.zone||"UTC"} placeholder="Europe/London" required maxLength={100}/></label><div className="company-field-grid"><label>From hour<input name="start" type="number" min={0} max={23} defaultValue={schedule?.start??9} required/></label><label>Until hour<input name="end" type="number" min={1} max={24} defaultValue={schedule?.end??17} required/></label></div><label className="company-checkbox"><input name="weekdays" type="checkbox" defaultChecked={schedule?.weekdays??true}/>Weekdays only</label>{error&&<p role="alert">{error}</p>}<button className="button button-quiet" disabled={busy}>Save quiet hours</button></form>;
}
