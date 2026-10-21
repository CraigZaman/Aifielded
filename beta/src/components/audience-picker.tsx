"use client";

import { useState } from "react";
import { previewAudience, type Audience, type AudienceDepartment, type AudienceMember } from "@/lib/audience";

export function AudiencePicker({ members, departments, value, onChange, scope = "organisation" }: { members: AudienceMember[]; departments: AudienceDepartment[]; value: Audience; onChange: (value: Audience) => void; scope?: string }) {
  const [search,setSearch]=useState("");
  const recipients=previewAudience(members,departments,value);
  const visible=members.filter(m=>`${m.name} ${m.department}`.toLowerCase().includes(search.toLowerCase()));
  const allVisible=visible.length>0 && visible.every(m=>value.individualIds.includes(m.id));
  const visibleUnion=[...new Set([...value.individualIds,...visible.map(m=>m.id)])];
  return <div className="stack-form audience-picker">
    <input type="hidden" name="audienceMode" value={value.mode} />
    {value.departmentKeys.map(key=><input key={key} type="hidden" name="audienceDepartment" value={key} />)}
    {value.individualIds.map(id=><input key={id} type="hidden" name="participantId" value={id} />)}
    <label>Send to<select value={value.mode} onChange={e=>onChange({...value,mode:e.target.value as Audience["mode"],departmentKeys:e.target.value === "department_heads" ? [] : value.departmentKeys})}>
      <option value="individuals">Individuals</option>{scope === "organisation" && <option value="organisation">Whole organisation</option>}<option value="departments">Selected departments</option><option value="department_heads">Department heads</option>
    </select></label>
    {value.mode === "organisation" && <p className="muted">All active employees and leadership. External consultants are excluded; select them individually when needed.</p>}
    {value.mode === "department_heads" && <p className="muted">{scope === "department" ? "The appointed head of your assigned department." : "All active department heads appointed in People and access."}</p>}
    {value.mode === "departments" && <>
      <div className="mission-member-list">{departments.map(d=><label className="mission-member-option" key={d.id}><input type="checkbox" checked={value.departmentKeys.includes(d.key)} onChange={e=>onChange({...value,departmentKeys:e.target.checked ? [...value.departmentKeys,d.key] : value.departmentKeys.filter(k=>k!==d.key)})} /><span><strong>{d.name}</strong><small>{members.filter(m=>m.department===d.key && m.role!=="consultant").length} active employees</small></span></label>)}</div>
      {!departments.length && <p className="muted">No departments have been added to People and access.</p>}
    </>}
    {value.mode === "individuals" && <>
      <input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search people or departments" aria-label="Search recipients" />
      <label className="mission-member-option"><input type="checkbox" checked={allVisible} disabled={!visible.length || !allVisible && visibleUnion.length>200} onChange={()=>onChange({...value,individualIds:allVisible ? value.individualIds.filter(id=>!visible.some(m=>m.id===id)) : visibleUnion})} /><span>Select visible people</span></label>
      <div className="mission-member-list">{visible.map(m=><label className="mission-member-option" key={m.id}><input type="checkbox" checked={value.individualIds.includes(m.id)} disabled={!value.individualIds.includes(m.id) && value.individualIds.length>=200} onChange={e=>onChange({...value,individualIds:e.target.checked ? [...value.individualIds,m.id] : value.individualIds.filter(id=>id!==m.id)})} /><span><strong>{m.name}</strong><small>{departments.find(d=>d.key===m.department)?.name || "Department not assigned"}</small></span></label>)}</div>
      {!visible.length && <p className="muted">No matching people.</p>}
    </>}
    <span className="chip" role="status">{recipients.length} {recipients.length===1 ? "recipient" : "recipients"}</span>
    {recipients.length>200 && <p className="form-message" role="alert">This group exceeds the current 200-recipient limit. Choose smaller department groups.</p>}
  </div>;
}
