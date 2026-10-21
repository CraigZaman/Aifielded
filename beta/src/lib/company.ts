import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AudienceDepartment, AudienceMember } from "@/lib/audience";

export const COMPANY_AREAS = ["profile", "sources", "structure", "people", "access"] as const;
export type CompanyArea = typeof COMPANY_AREAS[number];
export type CompanyAccess = Record<CompanyArea, number>;
export const COMPANY_LABELS: Record<CompanyArea, string> = { profile: "Company profile and library", sources: "Sources and developments", structure: "Organisation structure", people: "People and invitations", access: "Access and approval rules" };

export const getCompanyAccess = cache(async (organisationId: string): Promise<CompanyAccess> => {
  const db = await createClient();
  const result = await db.rpc("my_company_access", { workspace: organisationId });
  if (result.error || !result.data) throw new Error("Company access could not be checked. Please try again.");
  return Object.fromEntries(COMPANY_AREAS.map(area => [area, Number(result.data[area]) || 0])) as CompanyAccess;
});

export type CompanyMember = AudienceMember & { membershipId: string; status: string; reportsTo: string | null; confirmed: boolean; businessRole: string | null };
export async function getCompanyDirectory(organisationId: string): Promise<{ members: CompanyMember[]; departments: AudienceDepartment[] }> {
  const db = await createClient();
  const result = await db.rpc("company_directory", { workspace: organisationId });
  if (result.error || !result.data) throw new Error("The company directory could not be loaded.");
  return result.data;
}

export async function getDialogueContext(organisationId: string, userId: string) {
  const db = await createClient();
  const [company, personal, documents] = await Promise.all([
    db.rpc("company_dialogue_context", { workspace: organisationId }),
    db.from("personal_context").select("details,use_for_dialogue").eq("user_id", userId).maybeSingle(),
    db.from("personal_reference_documents").select("title,source_name,content").eq("organisation_id",organisationId).eq("user_id",userId).eq("use_for_dialogue",true).order("created_at",{ascending:false}).limit(5),
  ]);
  if (company.error || personal.error || documents.error) throw new Error("The authorised conversation context could not be loaded.");
  return { company: company.data, personal: personal.data?.use_for_dialogue ? personal.data.details : null, personalReferences:documents.data?.map(d=>({...d,content:d.content.slice(0,3000)})) };
}
