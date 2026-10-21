import Link from "next/link";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { Brand } from "@/components/brand";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/lib/platform-admin";
import { createTestAccount, manageBetaAccount } from "@/app/ops/actions";

export const dynamic = "force-dynamic";

export default async function OperationsPage({ searchParams }: { searchParams: Promise<{ page?: string; message?: string }> }) {
  const actor = await requirePlatformAdmin();
  const query = await searchParams;
  const page = Math.max(1, Math.min(10000, Number.parseInt(query.page || "1",10) || 1));
  const admin = createAdminClient();
  const [accounts, workspaces, protectedAccounts, events] = await Promise.all([
    admin.auth.admin.listUsers({ page, perPage: 50 }),
    admin.from("organisations").select("id,name").order("name"),
    admin.from("platform_admins").select("user_id"),
    admin.from("platform_admin_events").select("id,action,status,created_at,target_user_id").order("created_at",{ ascending: false }).limit(10),
  ]);
  if (accounts.error || workspaces.error || protectedAccounts.error || events.error) throw new Error("The beta administration data could not be loaded.");
  const userIds = accounts.data.users.map(user => user.id);
  const memberships = userIds.length ? await admin.from("organisation_memberships").select("user_id,organisation_id,role,status").in("user_id",userIds) : { data: [], error: null };
  if (memberships.error) throw new Error("Account memberships could not be loaded.");
  const names = new Map(workspaces.data?.map(workspace => [workspace.id,workspace.name]));
  const adminIds = new Set(protectedAccounts.data?.map(account => account.user_id));
  return <main className="page" style={{ maxWidth: 1440, margin: "0 auto" }}>
    <header className="page-header"><div className="page-title"><Brand href="/app" /><h1>Beta administration</h1><p>{actor.email}</p></div><Link className="text-link" href="/ops/commercial">Demo & tester access<ArrowRight size={16}/></Link><Link className="text-link" href="/app"><ArrowLeft size={16} />Workspace</Link></header>
    {query.message && <div className="form-message" role="status">{query.message}</div>}
    <div className="content-grid">
      <section className="panel"><div className="panel-head"><h2>Registered accounts</h2><span className="chip">Page {page}</span></div>
        <div className="row-list">{accounts.data.users.map(user => {
          const removed = Boolean((user as typeof user & { deleted_at?: string }).deleted_at);
          const protectedAccount = adminIds.has(user.id);
          const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "Account";
          return <article className="row-item" key={user.id} style={{ display: "block", overflowWrap: "anywhere" }}>
            <h3>{removed ? "Removed login" : user.email || "No email"}</h3><p>{fullName}</p>
            <div className="row-meta"><span className="chip">{protectedAccount ? "Protected admin" : removed ? "Removed" : user.app_metadata?.beta_test === true ? "Test account" : "Beta participant"}</span><span className="chip">Joined {new Date(user.created_at).toLocaleDateString("en-GB",{timeZone:"UTC"})}</span></div>
            <p><small>Account ID: {user.id}</small></p>
            <div className="row-meta">{memberships.data?.filter(member => member.user_id === user.id).map(member => <span className="chip" key={member.organisation_id}>{names.get(member.organisation_id) || "Workspace"} · {member.role} · {member.status}</span>)}</div>
            {!protectedAccount && !removed && user.email && <details style={{ marginTop: 14 }}><summary>Manage account</summary>
              <form action={manageBetaAccount} className="stack-form" style={{ marginTop: 14 }}>
                <input type="hidden" name="userId" value={user.id} /><input type="hidden" name="operation" value="reset_password" />
                <label>Confirm account email<input name="confirmEmail" type="email" required autoComplete="off" /></label>
                <label>New password<input name="password" type="password" minLength={12} maxLength={128} required autoComplete="new-password" /></label>
                <label className="checkbox-row"><input name="consent" type="checkbox" required /><span>I have permission to reset this account.</span></label>
                <button className="button button-quiet" type="submit"><KeyRound size={15} />Reset password</button>
              </form>
              <form action={manageBetaAccount} className="stack-form" style={{ marginTop: 24 }}>
                <input type="hidden" name="userId" value={user.id} /><input type="hidden" name="operation" value="remove_login" />
                <label>Type the email to remove this login<input name="confirmEmail" type="email" required autoComplete="off" /></label>
                <label className="checkbox-row"><input name="consent" type="checkbox" required /><span>I confirm permanent login removal. Workspace access is suspended; existing work records are retained. The email can be used for a new account.</span></label>
                <button className="button button-quiet" type="submit"><Trash2 size={15} />Remove login</button>
              </form>
            </details>}
          </article>;
        })}</div>
        <div className="panel-body page-actions">{page > 1 && <Link className="button button-quiet" href={`/ops?page=${page-1}`}><ArrowLeft size={14} />Previous</Link>}{accounts.data.users.length === 50 && <Link className="button button-quiet" href={`/ops?page=${page+1}`}>Next <ArrowRight size={14} /></Link>}</div>
      </section>
      <aside><section className="panel form-panel"><h2>Create test account</h2><form action={createTestAccount} className="stack-form">
        <label>Test email<input name="email" type="email" required placeholder="priya-test@fielded.test" pattern="[^@]+@fielded\.test" /></label>
        <label>Name<input name="name" required minLength={2} maxLength={80} /></label>
        <label>Password<input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" /></label>
        <label>Workspace<select name="workspaceId" required defaultValue=""><option value="" disabled>Select workspace</option>{workspaces.data?.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}</select></label>
        <label>Role<select name="role" defaultValue="participant"><option value="participant">Employee</option><option value="hr">HR and People</option><option value="manager">Manager</option><option value="owner">Owner / CEO</option><option value="consultant">Consultant</option></select></label>
        <button className="button button-primary" type="submit"><UserPlus size={16} />Create test account</button>
      </form></section>
      <div className="aside-note" style={{ marginTop: 20 }}><h2><ShieldCheck size={15} />Test credentials</h2><p>Test accounts use reserved @fielded.test addresses and do not receive emails. Passwords are never displayed or stored in the admin log.</p></div>
      <section style={{ marginTop: 24 }}><h2 style={{ fontSize: 16 }}>Recent admin actions</h2>{events.data?.map(event => <div key={event.id} style={{ marginBottom: 12 }}><strong>{event.action.replaceAll("_"," ")}</strong><p>{event.status} · {new Date(event.created_at).toLocaleString("en-GB",{timeZone:"UTC"})} UTC</p></div>)}</section>
      </aside>
    </div>
  </main>;
}
