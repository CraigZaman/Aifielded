"use client";

import { useActionState, useState } from "react";
import { Check, LoaderCircle, Save, X } from "lucide-react";
import { reviewPublication, saveMissionVisibility, savePublishingPermission } from "@/app/app/publishing/actions";
import type { AudienceDepartment, AudienceMember } from "@/lib/audience";

export type PermissionRow = { user_id: string; kind: string; allowed: boolean; audience_scope: string; approval: string; visibility: string; revision: number };
const approvals: Record<string, string> = { none: "No approval required", owner: "Owner approval", head_then_owner: "Department head, then owner" };
const visibility: Record<string, string> = { owners: "Workspace owners", department: "Department management and appointed head", management: "Workspace management" };

function PermissionFields({ person, kind, current, role }: { person: string; kind: string; current?: PermissionRow; role: string }) {
  const [state, action, pending] = useActionState(savePublishingPermission, { error: null });
  const roleEnabled = kind === "mission" ? ["manager", "hr", "consultant"].includes(role) : ["manager", "hr"].includes(role);
  const [allowed, setAllowed] = useState(current?.allowed ?? roleEnabled);
  return <form action={action} className="stack-form">
    <input type="hidden" name="person" value={person} /><input type="hidden" name="kind" value={kind} /><input type="hidden" name="allowed" value={String(allowed)} />
    <fieldset disabled={pending} className="mission-launch-fields form-grid">
      <label className="policy-choice wide"><input type="checkbox" checked={allowed} onChange={e => setAllowed(e.target.checked)} /><span>May create this type of publication</span></label>
      <label>Recipient scope<select name="scope" defaultValue={current?.audience_scope || (roleEnabled ? "organisation" : "department")}><option value="department">Their assigned department</option><option value="organisation">Whole organisation</option></select></label>
      <label>Approval sequence<select name="approval" defaultValue={current?.approval || (roleEnabled ? "none" : "owner")}>{Object.entries(approvals).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="wide">New mission intelligence visible to<select name="visibility" defaultValue={current?.visibility || (roleEnabled ? "management" : "owners")}>{Object.entries(visibility).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </fieldset>
    {state.error && <div className="form-message" role="alert">{state.error}</div>}{state.success && <div className="form-message success" role="status">{state.success}</div>}
    <button className="button button-primary" disabled={pending || !person}>{pending ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />}Save permissions</button>
  </form>;
}

export function PublishingPermissions({ members, rules, canEdit = true }: { members: AudienceMember[]; rules: PermissionRow[]; canEdit?: boolean }) {
  const editable = members.filter(m => m.role !== "owner");
  const [person, setPerson] = useState(editable[0]?.id || "");
  const [kind, setKind] = useState("mission");
  const current = rules.find(r => r.user_id === person && r.kind === kind);
  return <section className="publishing-section">
    <div className="panel-head"><h2>Publishing permission matrix</h2><span className="chip">Controlled access</span></div>
    {canEdit && <div className="publishing-editor stack-form">
      <div className="form-grid"><label>Person<select value={person} onChange={e => setPerson(e.target.value)}><option value="">Select a person</option>{editable.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>Publication type<select value={kind} onChange={e => setKind(e.target.value)}><option value="mission">Investigation mission</option><option value="policy">Policy communication</option></select></label></div>
      <PermissionFields key={`${person}:${kind}:${current?.revision || 0}`} person={person} kind={kind} current={current} role={editable.find(m => m.id === person)?.role || "participant"} />
    </div>}
    {rules.length > 0 && <div className="publishing-table-wrap"><table className="publishing-table"><thead><tr><th>Person</th><th>Type</th><th>Create</th><th>Recipients</th><th>Approval</th><th>Intelligence</th></tr></thead><tbody>{rules.map(r => <tr key={`${r.user_id}:${r.kind}`}><td>{members.find(m => m.id === r.user_id)?.name || "Inactive member"}</td><td>{r.kind}</td><td>{r.allowed ? "Allowed" : "Disabled"}</td><td>{r.audience_scope === "department" ? "Own department" : "Organisation"}</td><td>{approvals[r.approval]}</td><td>{visibility[r.visibility]}</td></tr>)}</tbody></table></div>}
  </section>;
}

export function PublicationDecision({ id, step, canApprove }: { id: string; step: string; canApprove: boolean }) {
  const [state, action, pending] = useActionState(reviewPublication, { error: null });
  return <form action={action} className="stack-form publishing-editor">
    <input type="hidden" name="id" value={id} />
    <label>Review note<textarea name="note" maxLength={1000} rows={3} disabled={pending} /></label>
    {state.error && <div role="alert" className="form-message">{state.error}</div>}{state.success && <div role="status" className="form-message success">{state.success}</div>}
    <div className="page-actions">{canApprove && <button name="decision" value="approve" className="button button-primary" disabled={pending}>{pending ? <LoaderCircle size={16} className="spin" /> : <Check size={16} />}{step === "pending_head" ? "Approve head review" : "Approve and assign"}</button>}<button name="decision" value="reject" className="button button-quiet" disabled={pending}><X size={16} />Decline request</button></div>
  </form>;
}

export function MissionVisibilityControl({ mission, departments, scope = "management", department = "" }: { mission: string; departments: AudienceDepartment[]; scope?: string; department?: string }) {
  const [state, action, pending] = useActionState(saveMissionVisibility, { error: null });
  const [selected, setSelected] = useState(scope);
  return <form action={action} className="stack-form publishing-editor">
    <h3>Intelligence visibility</h3><input type="hidden" name="mission" value={mission} />
    <label>Who can see this mission&apos;s intelligence?<select name="scope" value={selected} onChange={e => setSelected(e.target.value)} disabled={pending}>{Object.entries(visibility).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    {selected === "department" ? <label>Department<select name="department" defaultValue={department} required disabled={pending}><option value="">Choose department</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label> : <input type="hidden" name="department" value="" />}
    {state.error && <div role="alert" className="form-message">{state.error}</div>}{state.success && <div role="status" className="form-message success">{state.success}</div>}
    <button className="button button-quiet" disabled={pending}>{pending ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />}Save visibility</button>
  </form>;
}
