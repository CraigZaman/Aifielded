import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, Link2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { completeOnboarding, continueWithInvitation, signOut } from "@/app/(auth)/actions";
import { AuthCard } from "@/components/auth-card";
import { BUSINESS_ROLE_OPTIONS, DEPARTMENT_OPTIONS } from "@/lib/profile-options";
import { TrialPlanField } from "@/components/trial-plan-field";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ message?: string; path?: string; edit?: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");
  if (!data.user.email_confirmed_at) redirect("/check-email");
  const { data: membership, error: membershipError } = await supabase.from("organisation_memberships").select("id,status").eq("user_id", data.user.id).maybeSingle();
  if (membershipError) throw new Error("Workspace access could not be checked. Please try again.");
  if (membership?.status === "active") redirect("/app");
  if (membership) {
    return <AuthCard title="Workspace access suspended" description="Contact your workspace owner to restore your access." footer={<Link href="/">Back to Fielded</Link>}><form action={signOut}><button className="button button-primary button-full" type="submit">Sign out</button></form></AuthCard>;
  }
  const params = await searchParams;
  const storedPath = data.user.user_metadata?.onboarding_path;
  const path = params.path || storedPath;
  const proposed = data.user.user_metadata?.workspace_name || "";
  const { data: profile } = await supabase.from("profiles").select("full_name,business_role,department").eq("id", data.user.id).maybeSingle();

  if (!path) {
    return (
      <AuthCard title="What brings you to Fielded?" description="This choice sets up the right workspace experience." message={params.message} footer={<>Roles inside an existing organisation are controlled by its managers.</>}>
        <div className="role-paths">
          <Link href="/onboarding?path=manager">
            <span className="role-icon"><Building2 size={19} /></span>
            <span><strong>Set up an organisation</strong><small>Create and manage a new Fielded workspace.</small></span>
            <ArrowRight size={17} />
          </Link>
          <Link href="/onboarding?path=employee">
            <span className="role-icon"><UserRound size={19} /></span>
            <span><strong>Join as an employee</strong><small>Enter through a link shared by your manager or HR team.</small></span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (path === "employee") {
    return (
      <AuthCard title="Join your organisation" description="Paste the secure invitation link shared by your manager or HR team." message={params.message} footer={<Link className="back-link" href="/onboarding"><ArrowLeft size={13} /> Choose a different path</Link>}>
        <form className="stack-form" action={continueWithInvitation}>
          <label>Invitation link<input name="invitation" required autoFocus placeholder="https://app.fielded.ai/join/..." /></label>
          <div className="role-note"><Link2 size={16} /><span>Your organisation and access level are set by the invitation. Employees cannot grant themselves manager access.</span></div>
          <button className="button button-primary button-full" type="submit">Open invitation</button>
        </form>
      </AuthCard>
    );
  }

  if (proposed && data.user.user_metadata?.business_role && data.user.user_metadata?.department && !params.edit) {
    const meta = data.user.user_metadata;
    return <AuthCard title="Welcome to Fielded." description="Your company details are ready. Open your workspace to start inviting your team." message={params.message} footer={<Link href="/onboarding?path=manager&edit=1">Edit your company details</Link>}>
      <dl className="signup-review"><div><dt>Company</dt><dd>{proposed}</dd></div><div><dt>Your name</dt><dd>{profile?.full_name || meta.full_name}</dd></div><div><dt>Email</dt><dd>{data.user.email}</dd></div><div><dt>Access</dt><dd>{meta.signup_access ? "Your access code will be applied at setup." : "30-day trial. No automatic charges."}</dd></div></dl>
      <form action={completeOnboarding} className="stack-form">
        {Object.entries({ workspaceName: proposed, businessDescription: meta.company_description || "", website: meta.company_website || "", fullName: profile?.full_name || meta.full_name || "", businessRole: meta.business_role, department: meta.department, trialPlan: meta.trial_plan || "sme" }).map(([name, value]) => <input key={name} type="hidden" name={name} value={String(value)}/>)}
        <button className="button button-primary button-full">Open my workspace<ArrowRight size={16}/></button>
      </form>
    </AuthCard>;
  }

  return (
    <AuthCard title="Name your workspace" description="This becomes your organisation’s secure Fielded environment." message={params.message} footer={<Link className="back-link" href="/onboarding"><ArrowLeft size={13} /> Choose a different path</Link>}>
      <form className="stack-form" action={completeOnboarding}>
        <TrialPlanField value={data.user.user_metadata?.trial_plan} />
        <label>Workspace name<input name="workspaceName" defaultValue={proposed} required autoFocus /></label>
        <label>What does your company do? (optional)<textarea name="businessDescription" rows={2} maxLength={4000} defaultValue={data.user.user_metadata?.company_description||""}/></label>
        <label>Website (optional)<input name="website" type="url" defaultValue={data.user.user_metadata?.company_website||""}/></label>
        <label>Your name<input name="fullName" defaultValue={profile?.full_name || data.user.user_metadata?.full_name || ""} required /></label>
        <label>Your position<select name="businessRole" defaultValue={profile?.business_role || data.user.user_metadata?.business_role || ""} required><option value="" disabled>Select your position</option>{BUSINESS_ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label>Team or function<select name="department" defaultValue={profile?.department || data.user.user_metadata?.department || ""} required><option value="" disabled>Select your team</option>{DEPARTMENT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <div className="role-note"><Building2 size={16} /><span>You will be the workspace owner. You can invite managers, HR, employees and consultants after setup.</span></div>
        <button className="button button-primary button-full" type="submit">Create workspace</button>
      </form>
    </AuthCard>
  );
}
