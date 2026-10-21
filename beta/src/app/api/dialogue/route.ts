import { NextResponse } from "next/server";
import { z } from "zod";
import { getViewer } from "@/lib/auth";
import { getDialogueContext } from "@/lib/company";
import { runDialogue } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceAccess } from "@/lib/entitlements";
export const maxDuration=60;

export async function GET() {
 const viewer=await getViewer();
 if(!viewer)return NextResponse.json({error:"Sign in required."},{status:401});
 const db=await createClient();
 const access=await getWorkspaceAccess(viewer.organisationId);
 if(access.active){
  const checked=await db.rpc("check_open_dialogue",{workspace:viewer.organisationId});
  if(checked.error)return NextResponse.json({error:"Your dialogue could not be checked."},{status:503});
 }
 const thread=await db.from("open_dialogue_threads").select("id,proactive,timezone,work_start,work_end,weekdays_only").eq("organisation_id",viewer.organisationId).eq("user_id",viewer.id).maybeSingle();
 if(thread.error)return NextResponse.json({error:"Your dialogue could not be loaded."},{status:503});
 if(!thread.data)return NextResponse.json({turns:[],unread:0,proactive:false});
 const [turns,unread]=await Promise.all([
  db.from("open_dialogue_turns").select("id,question,answer,status,purpose,seen,created_at").eq("thread_id",thread.data.id).order("created_at",{ascending:false}).limit(50),
  db.from("open_dialogue_turns").select("id",{count:"exact",head:true}).eq("thread_id",thread.data.id).eq("seen",false).eq("status","completed"),
 ]);
 if(turns.error||unread.error)return NextResponse.json({error:"Your messages could not be loaded."},{status:503});
 return NextResponse.json({turns:(turns.data||[]).reverse(),unread:unread.count||0,proactive:thread.data.proactive,schedule:{zone:thread.data.timezone,start:thread.data.work_start,end:thread.data.work_end,weekdays:thread.data.weekdays_only}},{headers:{"Cache-Control":"private, no-store"}});
}

const schema=z.discriminatedUnion("action",[
 z.object({action:z.literal("send"),id:z.string().uuid(),content:z.string().trim().min(1).max(8000)}),
 z.object({action:z.literal("read"),ids:z.array(z.string().uuid()).max(100)}),
 z.object({action:z.literal("preferences"),proactive:z.boolean()}),
 z.object({action:z.literal("schedule"),proactive:z.boolean(),zone:z.string().min(1).max(100),start:z.number().int().min(0).max(23),end:z.number().int().min(1).max(24),weekdays:z.boolean()}),
 z.object({action:z.literal("defer"),id:z.string().uuid(),decision:z.enum(["later","unknown"])}),
]);
export async function POST(request:Request) {
 const viewer=await getViewer();
 if(!viewer)return NextResponse.json({error:"Sign in required."},{status:401});
 const parsed=schema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Invalid dialogue request."},{status:400});
 const p=parsed.data,db=await createClient();
 if(p.action!=="send") {
  const result=p.action==="read"?await db.rpc("mark_open_dialogue_read",{workspace:viewer.organisationId,turn_ids:p.ids}):p.action==="defer"?await db.rpc("defer_dialogue_prompt",{workspace:viewer.organisationId,turn_id:p.id,decision:p.decision}):p.action==="schedule"?await db.rpc("configure_dialogue_prompts",{workspace:viewer.organisationId,allow_prompts:p.proactive,zone:p.zone,start_hour:p.start,end_hour:p.end,weekdays:p.weekdays}):await db.rpc("open_dialogue_preferences",{workspace:viewer.organisationId,allow_prompts:p.proactive});
  return result.error?NextResponse.json({error:"Your preference was not saved."},{status:503}):NextResponse.json({ok:true});
 }
 const claim=await db.rpc("begin_open_dialogue",{workspace:viewer.organisationId,request_id:p.id,contribution:p.content});
 if(claim.error)return NextResponse.json({error:"A reply may still be processing, or the discussion limit has been reached. Wait a moment before retrying."},{status:409});
 if(claim.data.completed)return NextResponse.json({ok:true});
 try {
  const background=await getDialogueContext(viewer.organisationId,viewer.id);
  const answer=await runDialogue({mission:"Private ongoing work discussion",objective:"Help this person with their work and questions about approved company references. Cite document titles and versions when using them. Ask a clarification only when useful. This is not a mission and cannot publish findings, notify colleagues, change a profile or assign work. Never claim to have performed those actions. Suggest the existing mission suggestion or profile screen for changes requiring explicit submission.",transcript:JSON.stringify(claim.data.history),latest:p.content,background});
  const finished=await createAdminClient().rpc("finish_open_dialogue",{request_id:p.id,claim_token:claim.data.token,reply:answer});
  if(finished.error||finished.data!==true)throw new Error("Reply not saved");
  return NextResponse.json({ok:true});
 } catch {
  await createAdminClient().rpc("finish_open_dialogue",{request_id:p.id,claim_token:claim.data.token,reply:null});
  return NextResponse.json({error:"Your message is saved. Fielded could not finish its reply; you can retry the saved message.",saved:true},{status:503});
 }
}
