"use client";

import { useActionState,useState } from "react";
import { Send,LoaderCircle } from "lucide-react";
import { assignMissionAudience } from "@/app/app/actions";
import { AudiencePicker } from "@/components/audience-picker";
import { previewAudience,type Audience,type AudienceDepartment,type AudienceMember } from "@/lib/audience";

export function AssignmentAudienceForm({missionId,members,departments}:{missionId:string;members:AudienceMember[];departments:AudienceDepartment[]}) {
  const [state,action,pending]=useActionState(assignMissionAudience,{error:null});
  const [audience,setAudience]=useState<Audience>({mode:"individuals",departmentKeys:[],individualIds:[]});
  const count=previewAudience(members,departments,audience).length;
  return <form action={action} className="stack-form"><input type="hidden" name="missionId" value={missionId} />
    {state.error && <div className="form-message" role="alert">{state.error}</div>}
    <fieldset className="mission-launch-fields" disabled={pending}><AudiencePicker members={members} departments={departments} value={audience} onChange={setAudience} /></fieldset>
    <button className="button button-primary" disabled={pending || count<1 || count>200}>{pending ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />}Assign discussions</button>
  </form>;
}
