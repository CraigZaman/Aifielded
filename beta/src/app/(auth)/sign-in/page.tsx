import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { signIn } from "@/app/(auth)/actions";
import { safeRedirect } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ message?: string; next?: string }> }) {
  const params = await searchParams;
  const next = safeRedirect(params.next);
  const token = next.match(/^\/join\/([A-Za-z0-9_-]{20,256})$/)?.[1];
  let invitedEmail: string | undefined;
  if (token) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("invitation_preview", { raw_token: token });
    const preview = Array.isArray(data) ? data[0] : data;
    if (preview && !preview.expired) invitedEmail = preview.invited_email || undefined;
  }
  return (
    <AuthCard title="Welcome back" description="Sign in to your Fielded workspace." message={params.message} footer={<>New to Fielded? <Link href={token ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}>Create an account</Link></>}>
      <form className="stack-form" action={signIn}>
        <input type="hidden" name="next" value={next} />
        <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@company.com" defaultValue={invitedEmail} readOnly={Boolean(invitedEmail)} /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
        <button className="button button-primary button-full" type="submit">Sign in</button>
      </form>
    </AuthCard>
  );
}
