"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { appUrl, hasSupabaseEnv } from "@/lib/env";
import { BUSINESS_ROLE_VALUES, DEPARTMENT_VALUES } from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";
import { openSignupCode, sealSignupCode } from "@/lib/signup-intent";

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const workProfileSchema = z.object({
  fullName: z.string().min(2).max(80),
  businessRole: z.enum(BUSINESS_ROLE_VALUES),
  department: z.enum(DEPARTMENT_VALUES),
});

const managerSignupSchema = credentials.merge(workProfileSchema).extend({
  workspaceName: z.string().min(2).max(100),
  businessDescription:z.string().max(4000).default(""),
  website:z.union([z.url({protocol:/^https?$/}),z.literal("")]).default(""),
});

const employeeSignupSchema = workProfileSchema.extend({
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(8),
  invitation: z.string().min(1),
});

function fail(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}message=${encodeURIComponent(message)}`);
}

async function applyInitialTrialPlan(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, plan: string) {
  const { data: membership, error } = await supabase.from("organisation_memberships").select("organisation_id").eq("user_id", userId).eq("role", "owner").eq("status", "active").maybeSingle();
  if (error || !membership) redirect("/billing?message=Please+check+your+workspace+plan.");
  const result = await supabase.rpc("choose_trial_plan", { workspace: membership.organisation_id, chosen_plan: plan });
  if (result.error) redirect("/billing?message=Your+workspace+is+ready.+Please+choose+your+trial+plan.");
  const { data: auth } = await supabase.auth.getUser();
  const pending = auth.user?.user_metadata?.signup_access;
  if (pending && auth.user?.email_confirmed_at && auth.user.email) {
    const digest = openSignupCode(pending, auth.user.email, process.env.SUPABASE_SECRET_KEY || "");
    if (!digest) redirect("/billing?message=Your+workspace+is+ready.+Please+enter+your+access+code+again.");
    const redeemed = await supabase.rpc("redeem_tester_code", { workspace: membership.organisation_id, code_digest: digest });
    if (redeemed.error) redirect("/billing?message=Your+workspace+trial+is+ready,+but+the+access+code+could+not+be+applied.+Check+it+below.");
    await supabase.auth.updateUser({ data: { signup_access: null } });
  }
}

function invitationToken(value: string) {
  const candidate = value.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate, appUrl());
    const match = url.pathname.match(/^\/join\/([^/]+)\/?$/);
    if (match) return decodeURIComponent(match[1]);
  } catch {
    return null;
  }

  return /^[A-Za-z0-9_-]{20,256}$/.test(candidate) ? candidate : null;
}

export async function signIn(formData: FormData) {
  if (!hasSupabaseEnv()) redirect("/setup");
  const next = safeRedirect(String(formData.get("next") || "/app"));
  const returnPath = `/sign-in?next=${encodeURIComponent(next)}`;
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) fail(returnPath, "Enter a valid email and a password of at least 8 characters.");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) fail(returnPath, error.message);
  if (!data.user?.email_confirmed_at) {
    await supabase.auth.signOut({ scope: "local" });
    redirect("/check-email");
  }
  redirect(next);
}

export async function signUpGuided(_state: { error: string }, formData: FormData): Promise<{ error: string }> {
  if (!hasSupabaseEnv()) redirect("/setup");
  const path = formData.get("path") === "employee" ? "employee" : "manager";
  const trialPlan = z.enum(["startup", "sme", "enterprise"]).catch("sme").parse(formData.get("trialPlan"));
  const raw = {
    email: formData.get("email") ?? "",
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    businessRole: formData.get("businessRole"),
    department: formData.get("department"),
    workspaceName: formData.get("workspaceName"),
    businessDescription:formData.get("businessDescription")||"",
    website:formData.get("website")||"",
    invitation: formData.get("invitation"),
  };
  const token = path === "employee" ? invitationToken(String(formData.get("invitation") || "")) : null;
  if (path === "employee" && !token) return { error: "Enter the Fielded invitation link sent by your organisation." };
  const parsed = path === "employee" ? employeeSignupSchema.safeParse(raw) : managerSignupSchema.safeParse(raw);
  if (!parsed.success) return { error: "Check the earlier steps and complete every required field. Passwords must be at least 8 characters." };
  if (formData.get("terms") !== "accepted") return { error: "Please accept the beta terms and privacy notice to continue." };
  const accessCode = String(formData.get("accessCode") || "").trim();
  if (accessCode && !/^[A-Za-z0-9_-]{32,64}$/.test(accessCode)) return { error: "Enter the complete trial or tester code, or choose the standard 30-day trial." };

  const supabase = await createClient();
  let invitation: { expired?: boolean; invited_email?: string | null } | null = null;
  if (token) {
    const { data: preview } = await supabase.rpc("invitation_preview", { raw_token: token });
    invitation = Array.isArray(preview) ? preview[0] : null;
    if (!invitation || invitation.expired) return { error: "That invitation is invalid or has expired. Ask your manager for a new link." };
  }

  const email = path === "employee" ? invitation?.invited_email || parsed.data.email : parsed.data.email;
  if (!email) return { error: "Enter your work email address." };
  if (accessCode && !process.env.SUPABASE_SECRET_KEY) return { error: "Access-code signup is temporarily unavailable. Please try again shortly." };
  const next = token ? `/join/${token}` : "/onboarding?path=manager";
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        full_name: parsed.data.fullName,
        business_role: parsed.data.businessRole,
        department: parsed.data.department,
        onboarding_path: path,
        trial_plan: path === "manager" ? trialPlan : undefined,
        signup_access: path === "manager" && accessCode ? sealSignupCode(accessCode, email, process.env.SUPABASE_SECRET_KEY!) : undefined,
        workspace_name: path === "manager" && "workspaceName" in parsed.data ? parsed.data.workspaceName : undefined,
        company_description:"businessDescription" in parsed.data?parsed.data.businessDescription:undefined,
        company_website:"website" in parsed.data?parsed.data.website:undefined,
        invitation_token: token || undefined,
      },
    },
  });
  if (error) {
    const message = error.message.toLowerCase().includes("rate limit")
      ? "Email verification is temporarily at capacity. Please try again shortly or sign in if your account already exists."
      : error.code === "email_address_not_authorized" || error.message.toLowerCase().includes("sending confirmation email")
        ? "We could not send your confirmation email. Please try again shortly or contact tech@fielded.ai. Your workspace has not been opened."
        : "We couldn't create your account. Please check your details, or sign in if you already registered.";
    return { error: message };
  }
  if (data.session) {
    // Preserve the current signup mode until email delivery is configured.
    // Supabase will return no session once mandatory confirmation is enabled.
    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut({ scope: "local" });
      redirect(`/check-email?next=${encodeURIComponent(next)}`);
    }
    if (path === "manager" && "workspaceName" in parsed.data) {
      const workspace = await supabase.rpc("create_company_workspace", { workspace_name: parsed.data.workspaceName, business_description: parsed.data.businessDescription, company_website: parsed.data.website });
      if (workspace.error && workspace.error.code !== "23505") fail("/onboarding?path=manager", "Your account is ready. Please finish creating your workspace.");
      await applyInitialTrialPlan(supabase, data.user.id, trialPlan);
      redirect("/app/company");
    }
    if (token) {
      const accepted = await supabase.rpc("accept_invitation", { raw_token: token });
      if (accepted.error) fail(next, "Your account is ready. Please review and accept your invitation.");
      const result = accepted.data as { assignment_id?: string } | null;
      redirect(result?.assignment_id ? `/app/conversations/${result.assignment_id}` : "/app");
    }
    redirect(next);
  }
  redirect(`/check-email?next=${encodeURIComponent(next)}`);
}

export async function completeOnboarding(formData: FormData) {
  const workspaceName = z.string().min(2).max(100).safeParse(formData.get("workspaceName"));
  const profile = workProfileSchema.safeParse(Object.fromEntries(formData));
  const context=z.object({description:z.string().max(4000),website:z.union([z.url({protocol:/^https?$/}),z.literal("")])}).safeParse({description:formData.get("businessDescription")||"",website:formData.get("website")||""});
  if(!context.success)fail("/onboarding?path=manager","Use a valid website address and a short company description.");
  if (!workspaceName.success || !profile.success) fail("/onboarding?path=manager", "Complete your workspace and work profile.");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/sign-in");
  if (!auth.user.email_confirmed_at) redirect("/check-email");
  const { error: profileError } = await supabase.from("profiles").update({
    full_name: profile.data.fullName,
    business_role: profile.data.businessRole,
    department: profile.data.department,
  }).eq("id", auth.user.id);
  if (profileError) fail("/onboarding?path=manager", profileError.message);
  const { error } = await supabase.rpc("create_company_workspace", { workspace_name: workspaceName.data,business_description:context.data.description,company_website:context.data.website });
  if (error && error.code !== "23505") fail("/onboarding", error.message);
  const trialPlan = z.enum(["startup", "sme", "enterprise"]).catch("sme").parse(formData.get("trialPlan"));
  await applyInitialTrialPlan(supabase, auth.user.id, trialPlan);
  redirect("/app/company");
}

export async function resendConfirmation(_state: { message: string }, formData: FormData) {
  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) return { message: "Enter the email address you used to register." };
  const next = safeRedirect(String(formData.get("next") || "/onboarding"));
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email: email.data, options: { emailRedirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}` } });
  if (error) return { message: error.status === 429 ? "Please wait a minute before requesting another confirmation." : "We couldn't send a confirmation right now. Please try again later or contact tech@fielded.ai." };
  return { message: "If this email is awaiting confirmation, a new link has been sent. Check your inbox and spam folder." };
}

export async function continueWithInvitation(formData: FormData) {
  const token = invitationToken(String(formData.get("invitation") || ""));
  if (!token) fail("/onboarding?path=employee", "Enter the complete Fielded invitation link sent by your organisation.");

  const supabase = await createClient();
  const { data: preview } = await supabase.rpc("invitation_preview", { raw_token: token });
  const invitation = Array.isArray(preview) ? preview[0] : null;
  if (!invitation || invitation.expired) fail("/onboarding?path=employee", "That invitation is invalid or has expired. Ask your manager for a new link.");
  redirect(`/join/${token}`);
}

export async function startInvitationSignUp(formData: FormData) {
  const token = invitationToken(String(formData.get("invitation") || ""));
  if (!token) fail("/sign-up?path=employee", "Enter the complete Fielded invitation link sent by your organisation.");

  const supabase = await createClient();
  const { data: preview } = await supabase.rpc("invitation_preview", { raw_token: token });
  const invitation = Array.isArray(preview) ? preview[0] : null;
  if (!invitation || invitation.expired) fail("/sign-up?path=employee", "That invitation is invalid or has expired. Ask your manager for a new link.");
  redirect(`/sign-up?next=${encodeURIComponent(`/join/${token}`)}`);
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function switchInvitationAccount(formData: FormData) {
  const token = z.string().regex(/^[A-Za-z0-9_-]{20,256}$/).parse(formData.get("token"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) fail(`/join/${token}`, "Could not sign out. Please try again.");
  redirect(`/join/${token}`);
}
