"use client";

import { useActionState,useState } from "react";
import { Check,LoaderCircle,X } from "lucide-react";
import { decideInvestigation } from "@/app/app/investigations/actions";
import { AudiencePicker } from "@/components/audience-picker";
import { previewAudience,type Audience,type AudienceMember,type AudienceDepartment } from "@/lib/audience";

export function InvestigationDecision({proposalId,question,suggestedDepartments,members,departments}:{proposalId:string;question:string;suggestedDepartments:string[];members:AudienceMember[];departments:AudienceDepartment[]}) {
  const [state,action,pending]=useActionState(decideInvestigation,{error:null});
  const [audience,setAudience]=useState<Audience>({mode:"departments",departmentKeys:suggestedDepartments,individualIds:[]});
  const count=previewAudience(members,departments,audience).length;
  return <form action={action} className="stack-form investigation-decision">
    <input type="hidden" name="proposalId" value={proposalId} />
    {state.error && <div className="form-message" role="alert">{state.error}</div>}
    <fieldset disabled={pending} className="mission-launch-fields stack-form">
      <label>Question employees will receive<textarea name="question" defaultValue={question} maxLength={2000} rows={4} /></label>
      <AudiencePicker members={members} departments={departments} value={audience} onChange={setAudience} />
      <p className="muted">Only this reviewed question and the original mission title are sent. Supporting evidence and other employees&apos; contributions are not included.</p>
      <div className="page-actions"><button className="button button-primary" name="decision" value="approve" disabled={pending || !count || count>200}>{pending ? <LoaderCircle size={16} className="spin" /> : <Check size={16} />}Approve and send discussions</button><button className="button button-quiet" name="decision" value="reject" formNoValidate disabled={pending}><X size={16} />Decline</button></div>
    </fieldset>
  </form>;
}
