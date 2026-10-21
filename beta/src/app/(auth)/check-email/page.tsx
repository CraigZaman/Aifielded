import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth-card";
import { ResendConfirmation } from "@/components/resend-confirmation";
import { safeRedirect } from "@/lib/safe-redirect";

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <AuthCard title="Confirm your email" description="Check the inbox of the email address you used to register." footer={<Link href="/sign-in">Back to sign in</Link>}>
      <div className="confirmation-state"><MailCheck size={32}/><h2>One click to make it yours.</h2><p>Open the confirmation email and select the link to continue. You won&apos;t be able to enter Fielded until your email is confirmed.</p><p>Check your spam folder too. Already confirmed on another device? Simply sign in here.</p></div>
      <ResendConfirmation next={safeRedirect(params.next || "/onboarding")}/>
    </AuthCard>
  );
}
