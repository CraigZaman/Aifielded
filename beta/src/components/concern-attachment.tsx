"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Paperclip} from "lucide-react";
export function ConcernAttachment({caseId}:{caseId:string}) {
 const[busy,setBusy]=useState(false),[message,setMessage]=useState("");const router=useRouter();
 return <form className="stack-form" onSubmit={async e=>{e.preventDefault();const form=e.currentTarget,body=new FormData(form);body.set("caseId",caseId);setBusy(true);setMessage("");try{const response=await fetch("/api/concerns/files",{method:"POST",body});const result=await response.json();if(!response.ok)throw new Error(result.error);setMessage("Attachment added to this restricted case.");form.reset();router.refresh();}catch(e){setMessage(e instanceof Error?e.message:"Attachment could not be uploaded.");}finally{setBusy(false);}}}><label>Supporting attachment<input name="file" type="file" accept="application/pdf,text/plain,image/png,image/jpeg" required disabled={busy}/></label><p className="role-note">Visible to you and the handlers assigned to this case. Files may contain identifying metadata and are not processed by Fielded AI. Only open files you trust.</p>{message&&<p role="status">{message}</p>}<button className="button button-quiet" disabled={busy}><Paperclip size={16}/>{busy?"Uploading...":"Attach to this case"}</button></form>;
}
