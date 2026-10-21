"use client";

import { useActionState,useState } from "react";
import { Save,LoaderCircle } from "lucide-react";
import { saveDepartment,placeMember } from "@/app/app/people/structure-actions";
import type { AudienceDepartment,AudienceMember } from "@/lib/audience";

export function StructureEditor({members,departments}:{members:Array<AudienceMember & {reportsTo:string|null}>;departments:AudienceDepartment[]}) {
  const [departmentState,departmentAction,departmentPending]=useActionState(saveDepartment,{error:null});
  const [memberState,memberAction,memberPending]=useActionState(placeMember,{error:null});
  const [editing,setEditing]=useState({id:"",name:"",head:""});
  const [person,setPerson]=useState({id:"",department:"",manager:""});
  return <div className="structure-editors">
    <form action={departmentAction} className="panel form-panel stack-form"><h3>Departments and heads</h3>
      {departmentState.error && <p className="form-message" role="alert">{departmentState.error}</p>}
      <fieldset className="mission-launch-fields" disabled={departmentPending}>
        <label>Department<select name="departmentId" value={editing.id} onChange={e=>{const d=departments.find(d=>d.id===e.target.value);setEditing({id:d?.id || "",name:d?.name || "",head:d?.headUserId || ""});}}><option value="">Create a department</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
        <label>Department name<input name="departmentName" value={editing.name} required minLength={2} maxLength={100} onChange={e=>setEditing({...editing,name:e.target.value})} /></label>
        <label>Department head<select name="headId" value={editing.head} onChange={e=>setEditing({...editing,head:e.target.value})}><option value="">Not appointed</option>{members.filter(m=>m.role!=="consultant").map(m=><option value={m.id} key={m.id}>{m.name}</option>)}</select></label>
        <button className="button button-primary" disabled={departmentPending}>{departmentPending ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />}Save department</button>
      </fieldset>
    </form>
    <form action={memberAction} className="panel form-panel stack-form"><h3>Department and reporting line</h3>
      {memberState.error && <p className="form-message" role="alert">{memberState.error}</p>}
      <fieldset className="mission-launch-fields" disabled={memberPending}>
        <label>Team member<select name="memberId" required value={person.id} onChange={e=>{const m=members.find(m=>m.id===e.target.value);setPerson({id:m?.id || "",department:departments.find(d=>d.key===m?.department)?.id || "",manager:m?.reportsTo || ""});}}><option value="">Select a person</option>{members.map(m=><option value={m.id} key={m.id}>{m.name}</option>)}</select></label>
        <label>Department<select name="departmentId" value={person.department} onChange={e=>setPerson({...person,department:e.target.value})}><option value="">Not assigned</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
        <label>Reports to<select name="managerId" value={person.manager} onChange={e=>setPerson({...person,manager:e.target.value})}><option value="">Not specified</option>{members.filter(m=>m.id!==person.id && m.role!=="consultant").map(m=><option value={m.id} key={m.id}>{m.name}</option>)}</select></label>
        <button className="button button-primary" disabled={memberPending || !person.id}>{memberPending ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />}Confirm placement</button>
      </fieldset>
    </form>
  </div>;
}
