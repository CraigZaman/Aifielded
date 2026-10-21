import { z } from "zod";

export const audienceSchema = z.object({
  mode: z.enum(["individuals","organisation","departments","department_heads"]).default("individuals"),
  departmentKeys: z.array(z.string().min(1).max(80)).max(50).default([]),
});
export type Audience = z.infer<typeof audienceSchema> & { individualIds: string[] };
export type AudienceMember = { id: string; name: string; role: string; department: string };
export type AudienceDepartment = { id: string; key: string; name: string; headUserId: string | null };

// Preview only. The database resolves membership again inside the launch transaction.
export function previewAudience(members: AudienceMember[], departments: AudienceDepartment[], audience: Audience) {
  if (audience.mode === "individuals") return members.filter(m => audience.individualIds.includes(m.id));
  const employees = members.filter(m => m.role.toLowerCase() !== "consultant");
  if (audience.mode === "organisation") return employees;
  const chosen = departments.filter(d => !audience.departmentKeys.length || audience.departmentKeys.includes(d.key));
  if (audience.mode === "department_heads") return employees.filter(m => chosen.some(d => d.headUserId === m.id && d.key === m.department));
  return audience.departmentKeys.length ? employees.filter(m => audience.departmentKeys.includes(m.department)) : [];
}
