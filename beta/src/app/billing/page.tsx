import Link from "next/link";
import { Brand } from "@/components/brand";
import { requireViewer } from "@/lib/auth";
import { getWorkspaceAccess } from "@/lib/entitlements";
import { PLANS, daysRemaining } from "@/lib/plans";
import { changeTrialPlan, redeemTesterCode } from "./actions";

export default async function Billing({ searchParams }: { searchParams: Promise<{message?: string}> }) {
  const viewer = await requireViewer();
  const access = await getWorkspaceAccess(viewer.organisationId);
  const params = await searchParams;
  const plan = PLANS[access.plan];
  return <main className="commercial-page"><header><Brand/><Link href="/app">Back to dashboard</Link></header><span className="eyebrow">{viewer.organisationName}</span><h1>Workspace plan</h1><p>{access.state === "trial" ? `${daysRemaining(access.ends_at)} days left in your 30-day trial.` : access.state === "tester" ? `Complimentary tester access until ${new Date(access.ends_at).toLocaleDateString("en-GB")}.` : access.state === "expired" ? "Your trial has ended. Your existing workspace remains available to read." : "Your workspace subscription is active."} No automatic charges.</p>{params.message && <div className="notice" role="status">{params.message}</div>}
    <div className="commercial-summary"><div><span>Current plan</span><strong>{plan.name}</strong><p>${(plan.cents / 100).toFixed(2)} USD / month after trial</p></div><div><span>Active people</span><strong>{access.used_seats} / {access.seats}</strong><p>Admins and managers are included in the count.</p></div><div><span>AI allowance reserved</span><strong>{Math.min(100, Math.ceil(access.ai_used / access.ai_limit * 100))}%</strong><progress max={access.ai_limit} value={access.ai_used}/><p>{access.state === "trial" ? "One shared allowance for the entire trial." : "Shared allowance resets monthly, at midnight UTC on the first."}</p></div></div>
    <section><h2>Included processing</h2><p>Conversations, document extraction and analysis share your allowance. Each request reserves its input and maximum output before processing; failed attempts may remain reserved. Processing pauses at the limit. There are no automatic overage charges.</p></section>
    {viewer.role === "owner" ? <><section><h2>Choose your trial size</h2><div className="commercial-plan-options">{Object.entries(PLANS).map(([key,item]) => <form action={changeTrialPlan} key={key}><input type="hidden" name="plan" value={key}/><h3>{item.name}</h3><p>${(item.cents/100).toFixed(2)} USD / month</p><p>Up to {item.seats} people</p><button className="btn btn-secondary" disabled={access.state !== "trial" || access.used_seats > item.seats || access.plan === key}>{access.plan === key ? "Current plan" : "Choose for trial"}</button></form>)}</div><p className="muted">Paid checkout is not connected yet. You will not be charged when your trial ends. For more than 100 people, <a href="mailto:tech@fielded.ai">contact Fielded</a>.</p></section><section><h2>Tester access</h2><form action={redeemTesterCode} className="commercial-code-form"><label>Tester code<input name="code" type="password" autoComplete="off" minLength={32} maxLength={64} required/></label><button className="btn btn-primary">Apply code</button></form><p className="muted">Codes extend access without payment. Seat and AI limits still apply. Fielded can revoke complimentary access.</p></section></> : <section><h2>Need to change something?</h2><p>Your workspace owner manages plans and tester codes.</p></section>}
  </main>;
}
