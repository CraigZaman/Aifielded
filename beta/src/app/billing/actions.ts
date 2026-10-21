"use server";
import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function changeTrialPlan(form: FormData) {
  const viewer = await requireViewer();
  if (viewer.role !== "owner") throw new Error("Workspace owner access required.");
  const plan = z.enum(["startup", "sme", "enterprise"]).parse(form.get("plan"));
  const db = await createClient();
  const result = await db.rpc("choose_trial_plan", { workspace: viewer.organisationId, chosen_plan: plan });
  revalidatePath("/app", "layout");
  redirect(`/billing?message=${encodeURIComponent(result.error ? "This plan could not be selected. Check your active team size and trial status." : "Trial plan updated. Your trial end date and AI allowance have not changed.")}`);
}

export async function redeemTesterCode(form: FormData) {
  const viewer = await requireViewer();
  if (viewer.role !== "owner") throw new Error("Workspace owner access required.");
  const code = z.string().trim().regex(/^[A-Za-z0-9_-]{32,64}$/).safeParse(form.get("code"));
  if (!code.success) redirect("/billing?message=Enter+the+complete+tester+code.");
  const db = await createClient();
  const result = await db.rpc("redeem_tester_code", { workspace: viewer.organisationId, code_digest: createHash("sha256").update(code.data).digest("hex") });
  revalidatePath("/app", "layout");
  redirect(`/billing?message=${encodeURIComponent(result.error ? "The code could not be applied. It may be expired, revoked, fully used, or too small for your team." : "Tester access applied. No payment is required during the complimentary period.")}`);
}
