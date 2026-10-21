"use client";

import { useActionState, useState } from "react";
import { Check, Save, ShieldCheck } from "lucide-react";
import { addCompanyDocument, reviewCompanyDocument, saveCompanyProfile, setCompanyAccess, setAllCompanyAccess, transferCompanyOwnership, type CompanyState } from "@/app/app/company/actions";

import { ContextFileInput } from "@/components/context-file-input";
import { CompanyProfileAssistant } from "@/components/company-profile-assistant";

const initial: CompanyState = {};
function Result({ state }: { state: CompanyState }) {
  return <>{state.error && <p className="form-message" role="alert">{state.error}</p>}{state.success && <p className="form-message success" role="status">{state.success}</p>}</>;
}

export function CompanyProfileForm({ details, revision, editable }: { details: Record<string, string>; revision: number; editable: boolean }) {
  const [state, action, pending] = useActionState(saveCompanyProfile, initial);
  const [values,setValues]=useState(details);
  const fields = [["company_name","Company name"],["logo_url","Company logo URL"],["description", "What the company does"], ["website", "Website"], ["industry", "Industry"], ["mission", "Company mission"], ["vision", "Vision"], ["products", "Products and services"], ["markets", "Customers and markets"], ["locations", "Locations"], ["processes", "Key processes"], ["terminology", "Company terminology"], ["linkedin", "LinkedIn page"], ["social_links", "Other social and reference links"]];
  return <form action={action} className="stack-form company-profile-form"><input type="hidden" name="revision" value={revision} />{editable&&<CompanyProfileAssistant onDraft={updates=>setValues(current=>({...current,...updates}))}/>}<div className="company-field-grid">{fields.map(([key, label]) => <label key={key} className={key === "description" ? "company-field-wide" : ""}>{label}{["website", "linkedin", "industry","company_name","logo_url"].includes(key) ? <input name={key} type={["industry","company_name"].includes(key) ? "text" : "url"} value={values[key] || ""} onChange={e=>setValues({...values,[key]:e.target.value})} maxLength={key==="company_name"?100:4000} required={key==="company_name"} readOnly={!editable} /> : <textarea name={key} value={values[key] || ""} onChange={e=>setValues({...values,[key]:e.target.value})} maxLength={4000} rows={key === "description" ? 4 : 3} readOnly={!editable} />}</label>)}</div><Result state={state} />{editable && <button className="button button-primary" disabled={pending}><Save size={16} />{pending ? "Saving..." : "Save company profile"}</button>}</form>;
}

type Grant = { user_id: string; area: string; level: number };
export function CompanyAccessForm({ members, grants, ownAccess }: { members: Array<{ id: string; name: string; role: string }>; grants: Grant[]; ownAccess: Record<string, number> }) {
  const [state, action, pending] = useActionState(setCompanyAccess, initial);
  const [person, setPerson] = useState(members[0]?.id || "");
  const [area, setArea] = useState(Object.keys(ownAccess).find(key => ownAccess[key] > 0) || "profile");
  const areas = [["profile", "Profile and library"], ["sources", "Sources and developments"], ["structure", "Organisation structure"], ["people", "People and invitations"], ["access", "Access and approval rules"]];
  return <div className="company-access"><div className="publishing-table-wrap"><table className="publishing-matrix"><thead><tr><th>Person</th>{areas.map(([key,label]) => <th key={key}>{label}</th>)}</tr></thead><tbody>{members.map(m => <tr key={m.id}><th>{m.name}</th>{areas.map(([key]) => <td key={key}>{["None", "View", "Manage"][grants.find(g => g.user_id === m.id && g.area === key)?.level || 0]}</td>)}</tr>)}</tbody></table></div>{ownAccess.access >= 2 && members.length > 0 && <form action={action} className="stack-form company-access-editor"><label>Person<select name="person" value={person} onChange={e => setPerson(e.target.value)}>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>Company area<select name="area" value={area} onChange={e => setArea(e.target.value)}>{areas.filter(([key]) => ownAccess[key] > 0).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Access<select name="level" key={`${person}-${area}-${grants.find(g => g.user_id === person && g.area === area)?.level || 0}`} defaultValue={grants.find(g => g.user_id === person && g.area === area)?.level || 0}><option value="0">None</option>{ownAccess[area] >= 1 && <option value="1">View</option>}{ownAccess[area] >= 2 && <option value="2">Manage</option>}</select></label><button className="button button-primary" disabled={pending}><ShieldCheck size={16} />{pending ? "Saving..." : "Update access"}</button><Result state={state} /></form>}</div>;
}

export function CompanyDocumentForm({id}:{id:string}) {
  const [state, action, pending] = useActionState(addCompanyDocument, initial);
  const [content, setContent] = useState(""), [source, setSource] = useState("");
  return <form action={action} className="stack-form"><input type="hidden" name="requestId" value={id} /><div className="company-field-grid"><label>Document title<input name="title" required minLength={2} maxLength={160} /></label><label>Version<input name="version" required defaultValue="1" maxLength={80} /></label><label>Category<select name="category"><option value="handbook">Employee handbook</option><option value="policy">Policy</option><option value="process">Operating process</option><option value="presentation">Presentation</option><option value="annual_report">Annual report</option><option value="product">Product information</option><option value="other">Other</option></select></label><label>Audience<select name="visibility" defaultValue="administrators"><option value="administrators">Company library administrators only</option><option value="company">Company members after approval</option></select></label></div><ContextFileInput purpose="company" disabled={pending} onExtract={(text,name)=>{setContent(text);setSource(name);}} /><label>Source or filename<input name="sourceName" value={source} onChange={e=>setSource(e.target.value)} maxLength={300} /></label><label>Reviewed document content<textarea name="content" value={content} onChange={e=>setContent(e.target.value)} required maxLength={50000} rows={8} /></label><p className="role-note">Only the reviewed text is retained. Check it against the original document before approving.</p><Result state={state} /><button className="button button-primary" disabled={pending || Boolean(state.success)}><Save size={16} />{pending ? "Saving..." : "Save draft"}</button></form>;
}

export function CompanyBulkAccess({members}:{members:Array<{id:string;name:string}>}) {
 const[state,action,pending]=useActionState(setAllCompanyAccess,{});
 return <details className="company-document"><summary>All-area access shortcuts</summary><form action={action} className="stack-form"><label>Person<select name="person" required><option value="">Choose a member</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>Company access<select name="level"><option value="1">View all</option><option value="2">Manage all</option><option value="0">Remove all Company access</option></select></label><Result state={state}/><button className="button button-primary" disabled={pending}>Apply to all company areas</button></form></details>;
}

export function CompanyDocumentReview({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState(reviewCompanyDocument, initial);
  return <form action={action} className="company-review"><input type="hidden" name="id" value={id} /><div className="page-actions">{status !== "approved" && <button className="button button-primary" name="decision" value="approved" disabled={pending}><Check size={16} />Approve</button>}{status !== "archived" && <button className="button button-quiet" name="decision" value="archived" disabled={pending}>Archive</button>}</div><Result state={state} /></form>;
}

export function OwnershipTransfer({members,companyName}:{members:Array<{id:string;name:string}>;companyName:string}) {
 const[state,action,pending]=useActionState(transferCompanyOwnership,{});
 return <details className="company-document"><summary>Transfer company ownership</summary><form action={action} className="stack-form"><p>The selected active member becomes the accountable owner. Your account remains an employee, and your Company administration access is removed.</p><label>New owner<select name="person" required><option value="">Select an active member</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>Type {companyName} to confirm<input name="confirmation" required autoComplete="off"/></label><Result state={state}/><button className="button button-primary" disabled={pending}>Transfer ownership</button></form></details>;
}
