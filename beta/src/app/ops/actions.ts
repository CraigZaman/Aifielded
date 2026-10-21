"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/lib/platform-admin";

const passwordSchema = z.string().min(12).max(128);
function done(message: string): never { redirect(`/ops?message=${encodeURIComponent(message)}`); }

export async function createTestAccount(form: FormData) {
  const actor = await requirePlatformAdmin();
  const parsed = z.object({
    email: z.string().trim().toLowerCase().email().refine(value => value.endsWith("@fielded.test")),
    name: z.string().trim().min(2).max(80),
    password: passwordSchema,
    workspaceId: z.string().uuid(),
    role: z.enum(["owner","manager","hr","participant","consultant"]),
  }).safeParse(Object.fromEntries(form));
  if (!parsed.success) done("Use a @fielded.test email, a 12-character password, and choose a workspace and role.");
  const admin = createAdminClient();
  const { data: workspace, error: workspaceError } = await admin.from("organisations").select("id").eq("id",parsed.data.workspaceId).maybeSingle();
  if (workspaceError || !workspace) done("Workspace not found. No account was created.");
  const { data: event, error: auditError } = await admin.from("platform_admin_events").insert({ actor_id: actor.id, action: "create_test_account" }).select("id").single();
  if (auditError || !event) done("Audit logging is unavailable. No account was created.");
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email, password: parsed.data.password, email_confirm: true,
    app_metadata: { beta_test: true, created_by_admin: actor.id },
    user_metadata: { full_name: parsed.data.name, business_role: "other", department: "other" },
  });
  if (error || !data.user) {
    await admin.from("platform_admin_events").update({ status: "failed", finished_at: new Date().toISOString() }).eq("id",event.id);
    done("The test account could not be created. Check whether that email already exists and that the password meets the requirements.");
  }
  const membership = await admin.from("organisation_memberships").insert({ organisation_id: parsed.data.workspaceId, user_id: data.user.id, role: parsed.data.role });
  if (membership.error) {
    const cleanup = await admin.auth.admin.deleteUser(data.user.id);
    await admin.from("platform_admin_events").update({ target_user_id: data.user.id, status: "failed", finished_at: new Date().toISOString() }).eq("id",event.id);
    done(cleanup.error ? "The account was created but workspace assignment failed. Find it in the user list to remove its login before retrying." : "Workspace assignment failed. The new account was removed; please retry.");
  }
  const saved = await admin.from("platform_admin_events").update({ target_user_id: data.user.id, status: "succeeded", finished_at: new Date().toISOString() }).eq("id",event.id);
  revalidatePath("/ops");
  done(saved.error ? "Test account created; the audit completion record could not be saved." : `Test account created: ${parsed.data.email}. Sign in with the password you chose. No email was sent.`);
}

export async function manageBetaAccount(form: FormData) {
  const actor = await requirePlatformAdmin();
  const parsed = z.object({
    userId: z.string().uuid(),
    confirmEmail: z.string().trim().toLowerCase().email(),
    operation: z.enum(["reset_password","remove_login"]),
    consent: z.literal("on"),
  }).safeParse(Object.fromEntries(form));
  if (!parsed.success) done("Confirm the account email and permission before continuing.");
  const admin = createAdminClient();
  const protectedUser = await admin.from("platform_admins").select("user_id").eq("user_id",parsed.data.userId).maybeSingle();
  if (protectedUser.error || protectedUser.data || parsed.data.userId === actor.id) done("Administrator accounts are protected from this action.");
  const { data, error } = await admin.auth.admin.getUserById(parsed.data.userId);
  if (error || !data.user?.email || data.user.email.toLowerCase() !== parsed.data.confirmEmail) done("The account email does not match. Nothing was changed.");
  const password = parsed.data.operation === "reset_password" ? passwordSchema.safeParse(form.get("password")) : null;
  if (password && !password.success) done("Choose a new password of at least 12 characters.");
  const { data: event, error: auditError } = await admin.from("platform_admin_events").insert({ actor_id: actor.id, target_user_id: parsed.data.userId, action: parsed.data.operation }).select("id").single();
  if (auditError || !event) done("Audit logging is unavailable. Nothing was changed.");
  if (parsed.data.operation === "remove_login") {
    // Suspend first: if the Auth request fails, workspace access still remains closed.
    const suspension = await admin.from("organisation_memberships").update({ status: "suspended" }).eq("user_id",parsed.data.userId);
    if (suspension.error) {
      await admin.from("platform_admin_events").update({ status: "failed", finished_at: new Date().toISOString() }).eq("id",event.id);
      done("Workspace access could not be suspended. The login was not removed.");
    }
  }
  const result = parsed.data.operation === "remove_login"
    ? await admin.auth.admin.deleteUser(parsed.data.userId, true)
    : await admin.auth.admin.updateUserById(parsed.data.userId, { password: password!.data });
  const recorded = await admin.from("platform_admin_events").update({ status: result.error ? "failed" : "succeeded", finished_at: new Date().toISOString() }).eq("id",event.id);
  revalidatePath("/ops");
  if (result.error) done(parsed.data.operation === "remove_login" ? "Workspace memberships are suspended, but login removal failed. Retry the removal before reusing the email." : "Password reset failed. No replacement password was confirmed.");
  if (recorded.error) done("Account change succeeded, but its audit completion record could not be saved. Do not repeat the action.");
  done(parsed.data.operation === "remove_login" ? "Login removed. The email can be reused for a new account. Existing workspace records are retained and are not transferred to the new account." : "Password reset. Use the new password to sign in; existing passwords cannot be viewed.");
}
