import Link from "next/link";
import { redirect } from "next/navigation";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth-card";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Confirm your email | Fielded.ai", robots: { index: false, follow: false }, referrer: "no-referrer" as const };

async function confirmEmail(form: FormData) {
  "use server";
  const tokenHash = String(form.get("token_hash") || "");
  if (!/^[a-zA-Z0-9_-]{20,256}$/.test(tokenHash)) redirect("/auth/confirm?error=1");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  if (error || !data.user?.email_confirmed_at) redirect("/auth/confirm?error=1");
  const invitation = data.user.user_metadata?.invitation_token;
  redirect(typeof invitation === "string" && /^[A-Za-z0-9_-]{20,256}$/.test(invitation) ? `/join/${invitation}` : "/onboarding");
}

export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ token_hash?: string; error?: string }> }) {
  const params = await searchParams;
  const valid = typeof params.token_hash === "string" && /^[a-zA-Z0-9_-]{20,256}$/.test(params.token_hash);
  return <AuthCard title={valid ? "Make it official" : "This link couldn't be confirmed"} description={valid ? "Confirm your email address to continue to Fielded." : "The link may have expired or already been used. If you already confirmed, sign in."} footer={<Link href="/sign-in">Back to sign in</Link>}>
    {valid ? <form action={confirmEmail} className="stack-form"><input type="hidden" name="token_hash" value={params.token_hash}/><p className="signup-note">Only continue if you requested this Fielded account.</p><button className="button button-primary button-full"><MailCheck size={18}/>Confirm email & continue</button></form> : <Link className="button button-primary button-full" href="/check-email">Request a new confirmation</Link>}
  </AuthCard>;
}
