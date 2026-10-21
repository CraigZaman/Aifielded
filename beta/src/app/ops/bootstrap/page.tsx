import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { bootstrapPlatformAdmin } from "./actions";

export const dynamic = "force-dynamic";

export default async function PlatformAdminBootstrap({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return <main className="auth-page"><div className="auth-card"><Brand href="/" /><div className="auth-heading"><span className="eyebrow"><ShieldCheck size={14} /> One-time setup</span><h1>Create the Fielded super admin</h1><p>This route works only before the first platform administrator exists and only when the server bootstrap secret is configured.</p></div>
    {query.error && <div className="form-message error" role="alert">{query.error}</div>}
    <form action={bootstrapPlatformAdmin} className="stack-form">
      <label>Bootstrap secret<input name="secret" type="password" required minLength={16} autoComplete="off" /></label>
      <label>Admin name<input name="name" required minLength={2} maxLength={80} autoComplete="name" /></label>
      <label>Admin email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Admin password<input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" /></label>
      <button className="button button-primary button-full" type="submit">Create super admin</button>
    </form>
    <p className="auth-footer"><Link href="/sign-in">Back to sign in</Link></p>
  </div></main>;
}
