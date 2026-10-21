import Link from "next/link";
import { notFound } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { acceptInvitation } from "@/app/app/actions";
import { switchInvitationAccount } from "@/app/(auth)/actions";
import { Brand } from "@/components/brand";
import { hasSupabaseEnv } from "@/lib/env";
import { BUSINESS_ROLE_OPTIONS, DEPARTMENT_OPTIONS } from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/server";

type Preview = {
  mission_title: string;
  mission_objective: string;
  organisation_name: string;
  access_role: "owner" | "manager" | "hr" | "participant" | "consultant";
  invited_email: string | null;
  expired: boolean;
};

const accessLabels: Record<Preview["access_role"], string> = {
  owner: "Owner",
  manager: "Manager",
  hr: "HR and People",
  participant: "Employee",
  consultant: "Consultant",
};

export default async function JoinPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ message?: string }> }) {
  if (!hasSupabaseEnv()) notFound();
  const { token } = await params;
  const { message } = await searchParams;
  const supabase = await createClient();
  const [{ data: previewData }, { data: auth }] = await Promise.all([
    supabase.rpc("invitation_preview", { raw_token: token }),
    supabase.auth.getUser(),
  ]);
  const preview = (Array.isArray(previewData) ? previewData[0] : previewData) as Preview | undefined;
  if (!preview || preview.expired) notFound();
  const wrongAccount = Boolean(auth.user && preview.invited_email && auth.user.email?.trim().toLowerCase() !== preview.invited_email.trim().toLowerCase());

  const { data: profile } = auth.user
    ? await supabase.from("profiles").select("full_name,business_role,department").eq("id", auth.user.id).maybeSingle()
    : { data: null };

  return (
    <main className="auth-shell">
      <div className="auth-brand"><Brand /></div>
      <section className="auth-card auth-card-wide">
        <div className="eyebrow"><span className="live-dot" />Invitation from {preview.organisation_name}</div>
        <div className="auth-heading" style={{ marginTop: 18 }}><h1>{preview.mission_title}</h1><p>{preview.mission_objective}</p></div>
        {message && <div className="form-message">{message}</div>}
        <div className="locked-identity" style={{ marginBottom: 18 }}>
          <LockKeyhole size={17} />
          <span><small>Invitation for</small><strong>{preview.invited_email || "Any work email"}</strong></span>
          <span><small>Workspace access</small><strong>{accessLabels[preview.access_role]}</strong></span>
        </div>
        <div className="aside-note" style={{ marginBottom: 22 }}>
          <h2><ShieldCheck size={15} /> How Fielded uses what you say</h2>
          <div className="privacy-options">
            <div><i /><span><strong>PRIVATE</strong>Only used to support your conversation.</span></div>
            <div><i /><span><strong>CONTRIBUTE</strong>May inform patterns without identifying you.</span></div>
            <div><i /><span><strong>SHARE</strong>May be attributed to you where useful.</span></div>
          </div>
        </div>
        {wrongAccount ? <div className="stack-form">
          <div className="form-message" role="alert">You are signed in as {auth.user?.email}. This invitation is for {preview.invited_email}.</div>
          <form action={switchInvitationAccount}><input type="hidden" name="token" value={token} /><button className="button button-primary button-full" type="submit">Switch account and continue invitation</button></form>
        </div> : auth.user ? (
          <form className="stack-form" action={acceptInvitation}>
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="accountId" value={auth.user.id} />
            <div className="locked-identity"><span><small>Joining as</small><strong>{auth.user.email}</strong></span></div>
            <label>Your name<input name="fullName" defaultValue={profile?.full_name || auth.user.user_metadata?.full_name || ""} required /></label>
            <label>Your position<select name="businessRole" defaultValue={profile?.business_role || ""} required><option value="" disabled>Select your position</option>{BUSINESS_ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label>Team or function<select name="department" defaultValue={profile?.department || ""} required><option value="" disabled>Select your team</option>{DEPARTMENT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <button className="button button-primary button-full" type="submit">Accept invitation</button>
          </form>
        ) : (
          <div className="stack-form">
            <Link className="button button-primary button-full" href={`/sign-up?next=${encodeURIComponent(`/join/${token}`)}`}>Create account and join</Link>
            <Link className="button button-quiet button-full" href={`/sign-in?next=${encodeURIComponent(`/join/${token}`)}`}>I already have an account</Link>
          </div>
        )}
        {auth.user && !wrongAccount && <form action={switchInvitationAccount} style={{ marginTop: 16 }}><input type="hidden" name="token" value={token} /><button className="button button-quiet button-full" type="submit">Use a different account</button></form>}
      </section>
    </main>
  );
}
