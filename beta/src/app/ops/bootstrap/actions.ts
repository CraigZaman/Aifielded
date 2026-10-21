"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  secret: z.string().min(16).max(256),
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(2).max(80),
  password: z.string().min(12).max(128),
});

function failure(message: string): never {
  redirect(`/ops/bootstrap?error=${encodeURIComponent(message)}`);
}

export async function bootstrapPlatformAdmin(form: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) failure("Use a valid email, a 12-character password, and the bootstrap secret.");
  const configured = process.env.PLATFORM_ADMIN_BOOTSTRAP_SECRET?.trim();
  if (!configured) failure("Platform admin bootstrap is disabled. Set PLATFORM_ADMIN_BOOTSTRAP_SECRET first.");
  const expected = createHash("sha256").update(configured).digest("hex");
  const received = createHash("sha256").update(parsed.data.secret).digest("hex");
  if (received !== expected) failure("The bootstrap secret is not valid.");

  const admin = createAdminClient();
  const existing = await admin.from("platform_admins").select("user_id", { count: "exact", head: true });
  if (existing.error) failure("Platform admin state could not be checked.");
  if ((existing.count || 0) > 0) failure("Platform admin bootstrap has already been completed.");

  const created = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.name, business_role: "other", department: "other" },
    app_metadata: { created_by_bootstrap: true },
  });
  if (created.error || !created.data.user) {
    failure(created.error?.message?.toLowerCase().includes("already") ? "That email already exists. Sign in with it, or use a different admin email." : "The administrator account could not be created.");
  }

  const inserted = await admin.from("platform_admins").insert({ user_id: created.data.user.id });
  if (inserted.error) {
    await admin.auth.admin.deleteUser(created.data.user.id);
    failure("The administrator record could not be created. No account was kept.");
  }
  redirect(`/sign-in?next=%2Fops&message=${encodeURIComponent("Super admin created. Sign in with the credentials you chose.")}`);
}
