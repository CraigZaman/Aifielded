import {notFound,redirect} from "next/navigation";
import Link from "next/link";
import {requireViewer} from "@/lib/auth";
import {getCompanyAccess} from "@/lib/company";
import {createClient} from "@/lib/supabase/server";
import {CompanyPeople} from "@/components/company-people";
export default async function TeamPage({searchParams}:{searchParams:Promise<{invite?:string;message?:string}>}){
 const viewer=await requireViewer(),query=await searchParams,access=await getCompanyAccess(viewer.organisationId);
 if(access.people>0){const params=new URLSearchParams({tab:"people"});if(query.invite)params.set("invite",query.invite);if(query.message)params.set("message",query.message);redirect(`/app/company?${params}`);}
 const db=await createClient(),allowed=await db.rpc("can_invite_team",{workspace:viewer.organisationId});
 if(allowed.error)throw new Error("Team access could not be checked.");if(!allowed.data)notFound();
 return <div className="page"><header className="page-header"><div className="page-title"><h1>My team</h1></div><Link href="/app" className="text-link">Back to Dashboard</Link></header><CompanyPeople {...query}/></div>;
}
