import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AudienceDepartment, AudienceMember } from "@/lib/audience";

export async function getWorkspaceDirectory(organisationId: string) {
  const db = await createClient();
  const [membership,department,placement] = await Promise.all([
    db.from("organisation_memberships").select("user_id,role").eq("organisation_id",organisationId).eq("status","active").order("created_at"),
    db.from("workspace_departments").select("id,key,name,head_user_id").eq("organisation_id",organisationId).order("name"),
    db.from("workspace_people").select("user_id,department_id,reports_to,confirmed_by").eq("organisation_id",organisationId),
  ]);
  if (membership.error || department.error || placement.error) throw new Error("The organisation directory could not be loaded.");
  const ids=(membership.data || []).map(m=>m.user_id);
  const profiles=ids.length ? await db.from("profiles").select("id,full_name,business_role").in("id",ids) : {data:[],error:null};
  if (profiles.error) throw new Error("Workspace profiles could not be loaded.");
  const departments: AudienceDepartment[]=(department.data || []).map(d=>({id:d.id,key:d.key,name:d.name,headUserId:d.head_user_id}));
  const members: Array<AudienceMember & { reportsTo: string | null; confirmed: boolean; businessRole: string | null }>=(membership.data || []).map(m=>{
    const profile=profiles.data?.find(p=>p.id===m.user_id),position=placement.data?.find(p=>p.user_id===m.user_id);
    return {id:m.user_id,name:profile?.full_name || "Workspace member",role:m.role,department:departments.find(d=>d.id===position?.department_id)?.key || "",reportsTo:position?.reports_to || null,confirmed:Boolean(position?.confirmed_by),businessRole:profile?.business_role || null};
  }).sort((a,b)=>a.name.localeCompare(b.name));
  return {members,departments};
}
