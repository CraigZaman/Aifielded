"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
export type PersonalProfileState = {error?:string;success?:string};

export async function addPersonalDocument(_state:PersonalProfileState,form:FormData):Promise<PersonalProfileState> {
 const viewer=await requireViewer(),db=await createClient();
 const parsed=z.object({id:z.string().uuid(),title:z.string().trim().min(2).max(160),source:z.string().max(300),content:z.string().trim().min(1).max(50000)}).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:"Add a title and review the reference text before saving."};
 const p=parsed.data,result=await db.rpc("add_personal_document",{workspace:viewer.organisationId,request_id:p.id,document_title:p.title,source:p.source,document_content:p.content,allow_dialogue:form.get("allowDialogue")==="on"});
 if(result.error)return {error:"The reference could not be saved. You can keep up to twenty documents."};
 revalidatePath("/app/profile");return {success:"Private reference saved."};
}

export async function managePersonalDocument(_state:PersonalProfileState,form:FormData):Promise<PersonalProfileState> {
 const viewer=await requireViewer(),db=await createClient(),id=String(form.get("id")||""),decision=form.get("decision");
 if(!z.string().uuid().safeParse(id).success||!["delete","allow","exclude"].includes(String(decision)))return {error:"Choose a valid reference action."};
 const result=decision==="delete"?await db.from("personal_reference_documents").delete().eq("id",id).eq("user_id",viewer.id).eq("organisation_id",viewer.organisationId).select("id"):
 await db.from("personal_reference_documents").update({use_for_dialogue:decision==="allow"}).eq("id",id).eq("user_id",viewer.id).eq("organisation_id",viewer.organisationId).select("id");
 if(result.error||!result.data?.length)return {error:"This reference could not be updated."};
 revalidatePath("/app/profile");return {success:decision==="delete"?"Reference deleted.":"Conversation preference updated. Existing messages are unchanged."};
}

export async function savePersonalProfile(_state:PersonalProfileState, form:FormData):Promise<PersonalProfileState> {
  const viewer = await requireViewer();
  if (form.get("accountId") !== viewer.id) return {error:"Your account changed. Reload before saving."};
  const details = Object.fromEntries(["bio","linkedin","social_links","skills","goals","responsibilities","workplace"].map(key => [key,String(form.get(key)||"").trim()]));
  if (Object.values(details).some(v => v.length > 3000)) return {error:"Keep each field under 3,000 characters."};
  if (details.linkedin && !z.url({protocol:/^https?$/}).safeParse(details.linkedin).success) return {error:"Use an HTTP or HTTPS LinkedIn address."};
  const db = await createClient();
  const result = await db.rpc("save_personal_context",{profile_details:details,allow_dialogue:form.get("allowDialogue")==="on"});
  if (result.error) return {error:"Your profile could not be saved. Your entries are still here."};
  revalidatePath("/app/profile");
  return {success:"Personal context saved. Your role and access have not changed."};
}
