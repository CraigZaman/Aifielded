import { canManageIntegrations, requireViewer } from "@/lib/auth";
import { AIConnectionTest } from "@/components/ai-connection-test";
import Link from "next/link";
import { Save, ShieldCheck } from "lucide-react";
import { updateDisplayName } from "./actions";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const viewer = await requireViewer();
  const { message } = await searchParams;
  const supabase = await createClient();
  const { data: platformAdmin } = await supabase.rpc("is_platform_admin");
  return <div className="page">
    <header className="page-header"><div className="page-title"><h1>Workspace settings</h1><p>{viewer.organisationName}</p></div></header>
    {message && <div className="form-message" role="status">{message}</div>}
    <div className="content-grid">
      <section className="panel form-panel"><h2 style={{ marginTop: 0 }}>Workspace</h2><div className="stat-line"><span>Name</span><strong>{viewer.organisationName}</strong></div><div className="stat-line"><span>Your role</span><strong style={{ textTransform: "capitalize" }}>{viewer.role}</strong></div><div className="stat-line"><span>Account</span><strong>{viewer.email}</strong></div></section>
      <aside className="panel mission-brief"><h3>Privacy boundary</h3><p>Private conversation notes stay in your dialogue. Only approved non-private observations contribute to management intelligence.</p></aside>
    </div>
    <section className="form-panel" style={{ maxWidth: 600 }}>
      <h2>Your profile</h2>
      <form action={updateDisplayName} className="stack-form">
        <input type="hidden" name="accountId" value={viewer.id} />
        <label>Signed-in account<input type="email" value={viewer.email} readOnly /></label>
        <label>Display name<input name="fullName" defaultValue={viewer.name} required minLength={2} maxLength={80} autoComplete="name" /></label>
        <button className="button button-primary" type="submit"><Save size={16} />Save name</button>
      </form>
    </section>
    {canManageIntegrations(viewer.role) && <Link className="button button-quiet" href="/app/settings/integrations">Connected systems</Link>}
    {viewer.role === "owner" && <AIConnectionTest />}
    {platformAdmin === true && <Link className="button button-dark" style={{ marginTop: 20 }} href="/ops"><ShieldCheck size={16} />Beta administration</Link>}
  </div>;
}
