import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, Ticket, UserRound } from "lucide-react";
import { AuthCard } from "@/components/auth-card";
import { startInvitationSignUp } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";
import { SignupWizard } from "@/components/signup-wizard";
import { PLANS } from "@/lib/plans";

type InvitationPreview = {
  organisation_name: string;
  access_role: "owner" | "manager" | "hr" | "participant" | "consultant";
  invited_email: string | null;
  expired: boolean;
};

const accessLabels: Record<InvitationPreview["access_role"], string> = {
  owner: "Owner",
  manager: "Manager",
  hr: "HR and People",
  participant: "Employee",
  consultant: "Consultant",
};

function tokenFromNext(next?: string) {
  const match = next?.match(/^\/join\/([^/]+)\/?$/);
  return match ? match[1] : "";
}

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ message?: string; path?: string; next?: string; plan?: string; access?: string }> }) {
  const params = await searchParams;
  const plan = params.plan && Object.hasOwn(PLANS, params.plan) ? params.plan : "sme";
  const inviteToken = tokenFromNext(params.next);
  const path = inviteToken ? "employee" : params.path;
  let invitation: InvitationPreview | null = null;

  if (inviteToken) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("invitation_preview", { raw_token: inviteToken });
    invitation = (Array.isArray(data) ? data[0] : data) as InvitationPreview | null;
  }

  if (!path) {
    return (
      <AuthCard title="How will you use Fielded?" description="Choose the path that matches how you are joining." message={params.message} footer={<>Already have an account? <Link href="/sign-in">Sign in</Link></>}>
        <div className="role-paths">
          <Link href={`/sign-up?path=manager&plan=${plan}`}>
            <span className="role-icon"><Building2 size={19} /></span>
            <span><strong>Start a workspace</strong><small>A 30-day trial for your company. No automatic charges.</small></span>
            <ArrowRight size={17} />
          </Link>
          <Link href={`/sign-up?path=manager&plan=${plan}&access=code`}>
            <span className="role-icon"><Ticket size={19}/></span>
            <span><strong>I have an access code</strong><small>Create a workspace with your Fielded trial or tester code.</small></span>
            <ArrowRight size={17}/>
          </Link>
          <Link href="/sign-up?path=employee">
            <span className="role-icon"><UserRound size={19} /></span>
            <span><strong>Join a team</strong><small>Use an invitation from your organisation to enter with assigned access.</small></span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (path === "employee" && !inviteToken) {
    return (
      <AuthCard title="Open your invitation" description="Paste the secure link sent by your manager or HR team." message={params.message} footer={<Link className="back-link" href="/sign-up"><ArrowLeft size={13} /> Change how you are joining</Link>}>
        <form className="stack-form" action={startInvitationSignUp}>
          <label>Invitation link<input name="invitation" required autoFocus placeholder="https://app.fielded.ai/join/..." /></label>
          <button className="button button-primary button-full" type="submit">Continue</button>
        </form>
      </AuthCard>
    );
  }

  const employee = path === "employee";
  const validInvitation = invitation && !invitation.expired;
  return (
    <AuthCard
      title={employee ? `Join ${invitation?.organisation_name || "your organisation"}` : "Create your workspace"}
      description={employee ? "A few details to join with your assigned team access." : "A few short steps. A workspace built around your company."}
      message={!employee || validInvitation ? params.message : "This invitation is invalid or has expired. Ask your manager for a new link."}
      footer={employee && inviteToken ? <Link href={`/sign-in?next=${encodeURIComponent(`/join/${inviteToken}`)}`}>Already registered? Sign in and accept this invitation</Link> : <Link className="back-link" href="/sign-up"><ArrowLeft size={13} /> Change how you are joining</Link>}
    >
      {(!employee || validInvitation) && <SignupWizard employee={employee} invitation={`/join/${inviteToken}`} invitedEmail={invitation?.invited_email} accessLabel={invitation ? accessLabels[invitation.access_role] : undefined} plan={plan} useCode={params.access === "code"}/>}
    </AuthCard>
  );
}
