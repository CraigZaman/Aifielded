"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
export type ConcernState={error?:string;success?:string};
export async function sendConcern(_state:ConcernState,form:FormData):Promise<ConcernState>{
 const viewer=await requireViewer(),db=await createClient();
 const parsed=z.object({id:z.string().uuid(),route:z.enum(["primary","alternate"]),title:z.string().trim().min(5).max(200),body:z.string().trim().min(10).max(10000),acknowledged:z.literal("on")}).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:"Complete the report and confirm that this is confidential, not anonymous."};
 const p=parsed.data,result=await db.rpc("submit_confidential_concern",{workspace:viewer.organisationId,request_id:p.id,route:p.route,concern_title:p.title,concern_body:p.body,identity_acknowledged:true});
 if(result.error)return {error:"Your report was not submitted. An independent active handler must be available for the selected route."};
 revalidatePath("/app/concerns");return {success:"Report submitted to the designated handlers. Your receipt and their response appear below."};
}
export async function respondConcern(_state:ConcernState,form:FormData):Promise<ConcernState>{
 await requireViewer();const db=await createClient();
 const parsed=z.object({id:z.string().uuid(),status:z.enum(["acknowledged","reviewing","closed"]),reply:z.string().trim().min(5).max(5000)}).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:"Choose the case status and add a response."};
 const p=parsed.data,result=await db.rpc("respond_to_concern",{case_id:p.id,next_status:p.status,reply:p.reply});
 if(result.error)return {error:"The case was not updated. Check that it is still open and that you remain an authorised handler."};
 revalidatePath("/app/concerns");return {success:"Response saved for the reporting person."};
}
export async function configureConcerns(_state:ConcernState,form:FormData):Promise<ConcernState>{
 const viewer=await requireViewer(),db=await createClient();
 const parsed=z.object({primary:z.array(z.string().uuid()).min(1).max(5),alternate:z.array(z.string().uuid()).max(5),guidance:z.string().max(3000)}).safeParse({primary:form.getAll("primary"),alternate:form.getAll("alternate"),guidance:form.get("guidance")});
 if(!parsed.success)return {error:"Choose one to five primary handlers and up to five separate alternate handlers."};
 const p=parsed.data,result=await db.rpc("set_concern_routes",{workspace:viewer.organisationId,primary_people:p.primary,alternate_people:p.alternate,instructions:p.guidance});
 if(result.error)return {error:"Reporting routes were not changed. Use active, separate handlers and an account with access administration."};
 revalidatePath("/app","layout");return {success:"Routes updated for future reports. Existing case recipients are unchanged."};
}
