"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireViewer } from "@/lib/auth";
import { getCompanyAccess } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";

const optionalId=z.union([z.string().uuid(),z.literal("")]).transform(value=>value || null);
export async function importStructure(_state:{error?:string;success?:string},form:FormData):Promise<{error?:string;success?:string}> {
 const viewer=await requireViewer(),db=await createClient();
 let rows:unknown;try{rows=JSON.parse(String(form.get("rows")));}catch{return {error:"Review the draft before importing."};}
 const parsed=z.object({id:z.string().uuid(),source:z.string().max(300),rows:z.array(z.object({person:z.string().uuid(),department:z.string().trim().min(2).max(100),manager:optionalId})).min(1).max(30)}).safeParse({id:form.get("id"),source:form.get("source"),rows});
 if(!parsed.success)return {error:"Match selected people to existing members and confirm their departments."};
 const p=parsed.data,result=await db.rpc("import_company_structure",{workspace:viewer.organisationId,request_id:p.id,source:p.source,reviewed_rows:p.rows});
 if(result.error)return {error:"No placements changed. Check duplicate members, active membership, reporting loops and your editing authority."};
 revalidatePath("/app","layout");return {success:"Reviewed placements imported. No accounts, invitations or access grants were created."};
}
export async function saveDepartment(_state:{error:string|null},form:FormData):Promise<{error:string|null}> {
  const viewer=await requireViewer();
  if((await getCompanyAccess(viewer.organisationId)).structure<2) return {error:"Company structure editing is not enabled for this account."};
  const parsed=z.object({id:optionalId,name:z.string().trim().min(2).max(100),head:optionalId}).safeParse({id:form.get("departmentId"),name:form.get("departmentName"),head:form.get("headId")});
  if(!parsed.success) return {error:"Enter a department name and choose an active head, or leave that position unappointed."};
  const db=await createClient(),p=parsed.data;
  const result=await db.rpc("save_workspace_department",{workspace:viewer.organisationId,target_department:p.id,department_name:p.name,head_id:p.head});
  if(result.error) return {error:result.error.code==="23505" ? "A department with that name already exists." : "The department could not be saved. Check that the head has active employee access."};
  revalidatePath("/app","layout");
  redirect("/app/company?tab=structure");
}
export async function placeMember(_state:{error:string|null},form:FormData):Promise<{error:string|null}> {
  const viewer=await requireViewer();
  if((await getCompanyAccess(viewer.organisationId)).structure<2) return {error:"Company structure editing is not enabled for this account."};
  const parsed=z.object({member:z.string().uuid(),department:optionalId,manager:optionalId}).safeParse({member:form.get("memberId"),department:form.get("departmentId"),manager:form.get("managerId")});
  if(!parsed.success) return {error:"Choose the member, their department and an optional reporting manager."};
  const db=await createClient(),p=parsed.data;
  const result=await db.rpc("place_workspace_member",{workspace:viewer.organisationId,member_id:p.member,department:p.department,manager_id:p.manager});
  if(result.error) return {error:"The placement could not be saved. Use active members in this workspace and a reporting line that does not form a loop."};
  revalidatePath("/app","layout");
  redirect("/app/company?tab=structure");
}
