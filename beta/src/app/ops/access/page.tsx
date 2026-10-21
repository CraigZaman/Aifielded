import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { AuthCard } from "@/components/auth-card";
import { createClient } from "@/lib/supabase/server";
import { switchAdminAccount } from "@/app/ops/access/actions";

export const dynamic = "force-dynamic";

export default async function AdminAccessPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/sign-in?next=%2Fops");
  const { data, error } = await supabase.rpc("is_platform_admin");
  if (!error && data === true) redirect("/ops");
  return <AuthCard title="Beta administration" description={error ? "Administrator access could not be verified." : "This account does not have administrator access."}
    footer={<Link href="/app"><ArrowLeft size={14} /> Back to workspace</Link>}>
    <div className="stack-form">
      <p style={{ overflowWrap: "anywhere" }}>Signed in as <strong>{auth.user.email}</strong></p>
      <p>{error ? "Please retry shortly. Your account permissions have not been changed." : "Sign in with your designated administrator account. Workspace ownership does not grant access to other users' accounts."}</p>
      <form action={switchAdminAccount}><button className="button button-primary button-full" type="submit"><LogOut size={16} />Switch account</button></form>
      <Link className="button button-quiet button-full" href="/ops"><ShieldCheck size={16} />Check access again</Link>
      <Link className="text-link" href="/ops/bootstrap">First-time platform admin setup</Link>
    </div>
  </AuthCard>;
}
