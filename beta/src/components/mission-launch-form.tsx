"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { createMission } from "@/app/app/actions";
import { AudiencePicker } from "@/components/audience-picker";
import { previewAudience, type Audience, type AudienceDepartment } from "@/lib/audience";

export type MissionMember = { id: string; name: string; department: string; role: string };

export function MissionLaunchForm({ requestId, members, departments = [], message, initialBrief, approval: configuredApproval = "none", directDepartment, allowInviteOnly = true, audienceScope = "organisation" }: { requestId: string; members: MissionMember[]; departments?: AudienceDepartment[]; message?: string; initialBrief?: { title: string; objective: string }; approval?: string; directDepartment?:string|null; allowInviteOnly?: boolean; audienceScope?: string }) {
  const [state, action, pending] = useActionState(createMission, { error: null });
  const [brief, setBrief] = useState({ title: initialBrief?.title || "", objective: initialBrief?.objective || "", context: "", desiredOutcome: "", departments: "" });
  const [audience,setAudience] = useState<Audience>({mode:"individuals",departmentKeys:[],individualIds:[]});
  const recipients = previewAudience(members,departments,audience);
  const approval=directDepartment&&recipients.length>0&&recipients.every(m=>m.department===directDepartment)?"none":configuredApproval;

  function update(field: keyof typeof brief, value: string) {
    setBrief(current => ({ ...current, [field]: value }));
  }

  return <form className="panel form-panel stack-form" action={action}>
    <input type="hidden" name="requestId" value={requestId} />
    {(state.error || message) && <div className="form-message" role="alert">{state.error || message}</div>}
    {approval !== "none" && <div className="form-message">{approval === "owner" ? "Owner approval required before assignment." : "Department-head review, then owner approval, before assignment."}</div>}
    <fieldset disabled={pending} className="mission-launch-fields">
      <section className="form-section">
        <h2>The question</h2>
        <div className="form-grid">
          <label className="wide">Mission title<input name="title" required minLength={4} maxLength={120} value={brief.title} onChange={event => update("title", event.target.value)} placeholder="Reducing operational friction" /></label>
          <label className="wide">What do you want Fielded to understand?<textarea name="objective" required minLength={20} maxLength={2000} value={brief.objective} onChange={event => update("objective", event.target.value)} placeholder="Where are handoffs and unclear ownership creating delays?" /></label>
          <label className="wide">Context<textarea name="context" maxLength={4000} value={brief.context} onChange={event => update("context", event.target.value)} placeholder="Recent changes, relevant policy and practical constraints" /></label>
          <label className="wide">Desired outcome<textarea name="desiredOutcome" required minLength={8} maxLength={1000} value={brief.desiredOutcome} onChange={event => update("desiredOutcome", event.target.value)} placeholder="Prioritised process changes with evidence and accountable owners" /></label>
          <label className="wide">Departments<input name="departments" maxLength={500} value={brief.departments} onChange={event => update("departments", event.target.value)} placeholder="Operations, Finance, Customer Success" /></label>
        </div>
      </section>
      <section className="form-section">
        <h2>Assign discussions</h2>
        <AudiencePicker members={members} departments={departments} value={audience} onChange={setAudience} scope={audienceScope} />
      </section>
    </fieldset>
    <button className="button button-primary" type="submit" disabled={pending || recipients.length > 200 || (audience.mode !== "individuals" || !allowInviteOnly) && !recipients.length}>{pending ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}{pending ? "Submitting mission..." : approval === "none" ? "Launch mission" : "Submit for approval"}</button>
  </form>;
}
