"use client";
import {useActionState} from "react";
import {Save} from "lucide-react";
import {savePersonalProfile,type PersonalProfileState} from "@/app/app/profile/actions";

export function PersonalProfileForm({accountId,details,allowDialogue}:{accountId:string;details:Record<string,string>;allowDialogue:boolean}) {
  const [state,action,pending] = useActionState(savePersonalProfile,{} as PersonalProfileState);
  const fields = [["bio","About me"],["responsibilities","My responsibilities"],["skills","Skills"],["goals","Goals"],["workplace","Workplace"],["linkedin","LinkedIn profile"],["social_links","Other links"]];
  return <form action={action} className="stack-form"><input type="hidden" name="accountId" value={accountId}/><div className="company-field-grid">{fields.map(([key,label]) => <label key={key}>{label}{key === "linkedin" ? <input name={key} type="url" defaultValue={details[key]||""} maxLength={3000}/> : <textarea name={key} defaultValue={details[key]||""} maxLength={3000} rows={3}/>}</label>)}</div><label className="company-checkbox"><input name="allowDialogue" type="checkbox" defaultChecked={allowDialogue}/>Allow Fielded to use this private context in my conversations</label><p className="muted">Visible to you. Company administrators do not receive this profile context.</p>{state.error && <p className="form-message" role="alert">{state.error}</p>}{state.success && <p className="form-message success" role="status">{state.success}</p>}<button className="button button-primary" disabled={pending}><Save size={16}/>{pending ? "Saving..." : "Save personal profile"}</button></form>;
}
