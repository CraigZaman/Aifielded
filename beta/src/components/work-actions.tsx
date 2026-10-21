import Link from "next/link";
import { UserPlus,ArrowUpRight,ClipboardCheck } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPublishingRule } from "@/lib/publishing";
export async function WorkActions({personal=false}:{personal?:boolean}){
 const viewer=await requireViewer(),db=await createClient();
 const team=await db.rpc("can_invite_team",{workspace:viewer.organisationId});
 if(team.error)throw new Error("Team invitation access could not be checked.");
 const rule=personal?await getPublishingRule(viewer.organisationId,"mission"):null;
 return <nav className="work-actions" aria-label="Work actions"><Link href="/app/suggestions"><ArrowUpRight size={16}/>{personal?"Suggest a mission":"Employee suggestions"}</Link>{team.data&&<Link href="/app/people"><UserPlus size={16}/>My team</Link>}{personal&&rule?.allowed&&<Link href="/app/publishing"><ClipboardCheck size={16}/>Publishing and approvals</Link>}</nav>;
}
