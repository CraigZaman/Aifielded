import Link from "next/link";
import { Brand } from "@/components/brand";
import { requirePlatformAdmin } from "@/lib/platform-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { CommercialCodeForm } from "@/components/commercial-code-form";
import { revokeCommercialCode } from "./actions";

export default async function CommercialAdmin() {
  await requirePlatformAdmin();
  const db=createAdminClient();
  const codes=await db.from("commercial_codes").select("id,kind,label,plan,expires_at,revoked_at,uses,max_uses,created_at").order("created_at",{ascending:false}).limit(100);
  const events=await db.from("commercial_audit").select("id,action,created_at").order("created_at",{ascending:false}).limit(20);
  if(codes.error||events.error)throw new Error("Commercial access management is unavailable. Please retry.");
  return <main className="commercial-page"><header><Brand/><Link href="/ops">User administration</Link></header><span className="eyebrow">Fielded administration</span><h1>Demo & tester access</h1><p>Private demo sessions and complimentary workspace access. These codes do not create paid subscriptions or remove AI limits.</p><section><h2>Create access</h2><CommercialCodeForm/></section><section><h2>Issued access</h2>{!codes.data.length && <p>No codes have been issued.</p>}<div className="commercial-table-wrap"><table><thead><tr><th>Label</th><th>Type</th><th>Uses</th><th>Expires</th><th>Access</th></tr></thead><tbody>{codes.data.map(code=><tr key={code.id}><td>{code.label}</td><td>{code.kind === "demo" ? "Demo" : `${code.plan} tester`}</td><td>{code.uses}/{code.max_uses}</td><td>{new Date(code.expires_at).toLocaleDateString("en-GB")}</td><td>{code.revoked_at ? "Revoked" : <form action={revokeCommercialCode}><input type="hidden" name="id" value={code.id}/><label><input type="checkbox" name="confirm" required/>Confirm</label><button className="btn btn-secondary">Revoke</button></form>}</td></tr>)}</tbody></table></div><p className="muted">Revoking a demo code also closes sessions issued from it on their next request. Revoking a tester code removes complimentary access, but does not cancel a still-valid trial or paid subscription.</p></section><section><h2>Recent activity</h2>{events.data.map(event=><p key={event.id}>{new Date(event.created_at).toLocaleString("en-GB")} · {event.action}</p>)}</section></main>;
}
