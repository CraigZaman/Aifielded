"use server";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {requireViewer} from "@/lib/auth";
import {createClient} from "@/lib/supabase/server";
import {validateSourceUrl,referenceOnlySource} from "@/lib/public-source";
import {refreshCompanySource} from "@/lib/company-source-refresh";
import type {CompanyState} from "./actions";
export async function saveSource(_state:CompanyState,form:FormData):Promise<CompanyState>{
 const viewer=await requireViewer(),db=await createClient();
 const parsed=z.object({id:z.union([z.string().uuid(),z.literal("")]),label:z.string().trim().min(2).max(120),url:z.string().max(2000),cadence:z.enum(["manual","daily","weekly","reference"])}).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:"Complete the source name, HTTPS URL and refresh frequency."};
 const p=parsed.data;let url:URL;
 try{url=validateSourceUrl(p.url);}catch{return {error:"Use a public HTTPS URL without credentials or a custom port."};}
 const result=await db.rpc("save_company_source",{workspace:viewer.organisationId,source_id:p.id||null,source_label:p.label,source_url:url.href,refresh_cadence:referenceOnlySource(url)?"reference":p.cadence});
 if(result.error)return {error:"Source not saved. Check your access, duplicate URLs and the ten-source limit."};
 revalidatePath("/app/company");return {success:referenceOnlySource(url)?"Saved as a reference link. Social network scraping is not enabled.":"Source saved. New snapshots require review before use as company knowledge."};
}
export async function checkSource(_state:CompanyState,form:FormData):Promise<CompanyState>{
 await requireViewer();const id=z.string().uuid().safeParse(form.get("id"));if(!id.success)return {error:"Choose a source."};
 const db=await createClient(),claim=await db.rpc("claim_company_source",{target_source:id.data});
 if(claim.error)return {error:"Source cannot be checked. Check your access or wait two minutes between attempts."};
 const ok=await refreshCompanySource(claim.data);revalidatePath("/app/company");
 return ok?{success:"Source checked. Review new material below."}:{error:"The public page could not be read. The last approved version is unchanged."};
}
export async function reviewSource(_state:CompanyState,form:FormData):Promise<CompanyState>{
 await requireViewer();const parsed=z.object({id:z.string().uuid(),decision:z.enum(["approved","rejected"])}).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:"Choose a snapshot and decision."};
 const db=await createClient(),result=await db.rpc("review_company_source",{snapshot_id:parsed.data.id,decision:parsed.data.decision});
 if(result.error)return {error:"The review decision was not saved."};
 revalidatePath("/app/company");return {success:"Source review saved."};
}
