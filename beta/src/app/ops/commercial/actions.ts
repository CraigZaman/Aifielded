"use server";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/platform-admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function createCommercialCode(_state: {error:string;token:string;kind:string}, form: FormData) {
  await requirePlatformAdmin();
  const parsed = z.object({kind:z.enum(["tester","demo"]),label:z.string().trim().min(2).max(100),plan:z.enum(["startup","sme","enterprise"]),expiryDays:z.coerce.number().int().min(1).max(365),accessDays:z.coerce.number().int().min(1).max(365),maxUses:z.coerce.number().int().min(1).max(100)}).safeParse(Object.fromEntries(form));
  if (!parsed.success) return {error:"Check the label, expiry, duration and usage limit.",token:"",kind:""};
  const p=parsed.data, token=randomBytes(32).toString("base64url");
  const db=await createClient();
  const result=await db.rpc("create_commercial_code", {code_id:randomUUID(),code_kind:p.kind,code_label:p.label,code_digest:createHash("sha256").update(token).digest("hex"),chosen_plan:p.plan,days:p.accessDays,uses_limit:p.maxUses,expiry:new Date(Date.now()+p.expiryDays*86400000).toISOString()});
  if(result.error) return {error:"Access could not be created. Nothing has been shared. Please retry.",token:"",kind:""};
  revalidatePath("/ops/commercial");
  return {error:"",token,kind:p.kind};
}

export async function revokeCommercialCode(form: FormData) {
  await requirePlatformAdmin();
  const id=z.string().uuid().parse(form.get("id"));
  if(form.get("confirm")!=="on")throw new Error("Confirm revocation first.");
  const db=await createClient();
  const result=await db.rpc("revoke_commercial_code",{code_id:id});
  if(result.error)throw new Error("Access could not be revoked. Please retry.");
  revalidatePath("/ops/commercial");
}
