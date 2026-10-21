import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";
import {readPublicSource} from "@/lib/public-source";
export async function refreshCompanySource(claim:{id:string;url:string;token:string}) {
 const db=createAdminClient();
 try {const result=await readPublicSource(claim.url);const saved=await db.rpc("finish_company_source",{target_source:claim.id,token:claim.token,extracted_content:result.content,resolved_url:result.url});if(saved.error||!saved.data)throw new Error("Source snapshot not saved");return true;}
 catch{await db.rpc("finish_company_source",{target_source:claim.id,token:claim.token,extracted_content:null,resolved_url:null});return false;}
}
export async function refreshScheduledCompanySources() {
 const db=createAdminClient();let processed=0;
 for(let i=0;i<3;i++){const result=await db.rpc("claim_scheduled_company_source");if(result.error)throw new Error("Scheduled sources could not be claimed");if(!result.data)break;await refreshCompanySource(result.data);processed++;}
 return processed;
}
