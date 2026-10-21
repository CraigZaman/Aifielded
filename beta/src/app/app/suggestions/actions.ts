"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
export type SuggestionState = { error?: string; success?: string };

export async function submitSuggestion(_state: SuggestionState, form: FormData): Promise<SuggestionState> {
 const viewer = await requireViewer();
 const parsed = z.object({ id:z.string().uuid(), question:z.string().trim().min(10).max(500), contribution:z.string().trim().min(10).max(5000), scope:z.enum(["department","organisation"]) }).safeParse(Object.fromEntries(form));
 if(!parsed.success) return {error:"Add a question and the context you would like to contribute."};
 const p=parsed.data,db=await createClient();
 const result=await db.rpc("submit_mission_suggestion",{workspace:viewer.organisationId,request_id:p.id,proposed_question:p.question,initial_contribution:p.contribution,question_scope:p.scope});
 if(result.error)return {error:"Your suggestion was not sent. Check your connection and the limit of five suggestions per day."};
 revalidatePath("/app", "layout");
 return {success:"Suggestion sent for review. Your response will appear here."};
}

export async function reviewSuggestion(_state: SuggestionState, form: FormData): Promise<SuggestionState> {
 await requireViewer();
 const parsed=z.object({id:z.string().uuid(),decision:z.enum(["approve","decline","link","complete","clarify","escalate","discontinue"]),reply:z.string().trim().min(5).max(1200),mission:z.union([z.string().uuid(),z.literal("")]).optional()}).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:"Provide a short response for the employee and select the next step."};
 const p=parsed.data,db=await createClient();
 const result=await db.rpc("review_mission_suggestion",{suggestion_id:p.id,decision:p.decision,reply:p.reply,linked_mission:p.mission||null});
 if(result.error)return {error:"The decision was not applied. Check the current stage and your review authority."};
 revalidatePath("/app", "layout");
 return {success:result.data==="pending_owner"?"Sent to the workspace owner for organisation-wide review.":"Decision saved. The employee can see your response."};
}

export async function clarifySuggestion(_state:SuggestionState,form:FormData):Promise<SuggestionState> {
 await requireViewer();
 const parsed=z.object({id:z.string().uuid(),reply:z.string().trim().min(5).max(1200)}).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:"Add a short clarification."};
 const db=await createClient(),result=await db.rpc("clarify_mission_suggestion",{suggestion_id:parsed.data.id,reply:parsed.data.reply});
 if(result.error)return {error:"Your clarification could not be sent. Check whether a response is still requested."};
 revalidatePath("/app","layout");return {success:"Clarification sent to the reviewer."};
}
