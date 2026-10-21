"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireViewer } from "@/lib/auth";
import { getCompanyAccess, COMPANY_AREAS } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";

export type CompanyState = { error?: string; success?: string };
export async function setAllCompanyAccess(_state:CompanyState,form:FormData):Promise<CompanyState> {
 const viewer=await requireViewer(),db=await createClient();
 const parsed=z.object({person:z.string().uuid(),level:z.coerce.number().int().min(0).max(2)}).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:"Choose a person and access level."};
 const result=await db.rpc("set_company_access_all",{workspace:viewer.organisationId,person:parsed.data.person,access_level:parsed.data.level});
 if(result.error)return {error:"No access was changed. This action must be within your authority for every company area."};
 revalidatePath("/app","layout");return {success:"Company access updated across all five areas. Working role and private information are unchanged."};
}
const profileKeys = ["company_name", "logo_url", "description", "website", "industry", "mission", "vision", "products", "markets", "locations", "processes", "terminology", "linkedin", "social_links"] as const;

export async function saveCompanyProfile(_state: CompanyState, form: FormData): Promise<CompanyState> {
  const viewer = await requireViewer();
  if ((await getCompanyAccess(viewer.organisationId)).profile < 2) return { error: "Company editing is not enabled for this account." };
  const details = Object.fromEntries(profileKeys.map(key => [key, String(form.get(key) || "").trim()]));
  if (Object.values(details).some(value => value.length > 4000)) return { error: "Keep each field under 4,000 characters." };
  for (const key of ["website", "linkedin", "logo_url"]) {
    if (details[key] && !z.url({ protocol: /^https?$/ }).safeParse(details[key]).success) return { error: "Use an HTTP or HTTPS address for website links." };
  }
  const revision = z.coerce.number().int().nonnegative().safeParse(form.get("revision"));
  if (!revision.success) return { error: "Reload the profile before saving." };
  const db = await createClient();
  const result = await db.rpc("save_company_profile", { workspace: viewer.organisationId, expected_revision: revision.data, profile_details: details });
  if (result.error) return { error: "The profile was not saved. Another person may have updated it; reload and review before retrying." };
  revalidatePath("/app","layout");
  return { success: "Company profile saved." };
}

export async function setCompanyAccess(_state: CompanyState, form: FormData): Promise<CompanyState> {
  const viewer = await requireViewer();
  const parsed = z.object({ person: z.string().uuid(), area: z.enum(COMPANY_AREAS), level: z.coerce.number().int().min(0).max(2) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Choose a person, company area and access level." };
  const grants = await getCompanyAccess(viewer.organisationId);
  if (grants.access < 2 || grants[parsed.data.area] < parsed.data.level) return { error: "You cannot grant access beyond your own authority." };
  const db = await createClient();
  const result = await db.rpc("set_company_access", { workspace: viewer.organisationId, person: parsed.data.person, section_name: parsed.data.area, access_level: parsed.data.level });
  if (result.error) return { error: "Access was not changed. Choose another active non-owner member and a level within your authority." };
  revalidatePath("/app", "layout");
  return { success: "Company access updated. Working roles and intelligence access are unchanged." };
}

export async function addCompanyDocument(_state: CompanyState, form: FormData): Promise<CompanyState> {
  const viewer = await requireViewer();
  if ((await getCompanyAccess(viewer.organisationId)).profile < 2) return { error: "Company library editing is not enabled." };
  const parsed = z.object({ requestId: z.string().uuid(), title: z.string().trim().min(2).max(160), version: z.string().trim().min(1).max(80), category: z.enum(["handbook", "policy", "process", "presentation", "annual_report", "product", "other"]), content: z.string().trim().min(1).max(50000), visibility: z.enum(["company", "administrators"]), sourceName: z.string().max(300) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Complete the title, version and document content (up to 50,000 characters)." };
  const p = parsed.data, db = await createClient();
  const result = await db.rpc("add_company_document", { workspace: viewer.organisationId, request_id: p.requestId, document_title: p.title, document_version: p.version, document_category: p.category, document_content: p.content, document_visibility: p.visibility, source_filename: p.sourceName || null });
  if (result.error) return { error: "The document was not saved. Your content is still here." };
  revalidatePath("/app/company");
  return { success: "Draft saved. Review it before making it available as company knowledge." };
}

export async function reviewCompanyDocument(_state: CompanyState, form: FormData): Promise<CompanyState> {
  const viewer = await requireViewer();
  if ((await getCompanyAccess(viewer.organisationId)).profile < 2) return { error: "Document review is not enabled." };
  const parsed = z.object({ id: z.string().uuid(), decision: z.enum(["approved", "archived"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Choose a document and review decision." };
  const db = await createClient();
  const result = await db.rpc("review_company_document", { document_id: parsed.data.id, decision: parsed.data.decision });
  if (result.error) return { error: "The document status was not changed." };
  revalidatePath("/app/company");
  return { success: parsed.data.decision === "approved" ? "Document approved for its selected audience." : "Document archived and excluded from new AI context." };
}

export async function transferCompanyOwnership(_state: CompanyState, form: FormData): Promise<CompanyState> {
 const viewer=await requireViewer();
 const person=z.string().uuid().safeParse(form.get("person"));
 if(viewer.role!=="owner"||!person.success||form.get("confirmation")!==viewer.organisationName)return {error:"Only the owner can transfer ownership. Type the exact company name to confirm."};
 const db=await createClient(),result=await db.rpc("transfer_workspace_ownership",{workspace:viewer.organisationId,new_owner:person.data});
 if(result.error)return {error:"Ownership was not transferred. The successor must be another active member who has accepted their invitation."};
 revalidatePath("/app","layout");redirect("/app/my-day");
}
