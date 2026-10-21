import {ArrowUpRight, Check, MessageCircle, ShieldCheck} from 'lucide-react';
import {SiteHeader} from '@/components/site-sections';

export const metadata = {
  title: 'Pricing | Fielded.ai',
  description: 'One workspace. Your people. Fielded plans from $29.99 per month, with a 30-day trial.',
  alternates: {canonical: 'https://fielded.ai/pricing'},
};

const plans = [
  {id: 'startup', name: 'Startup', price: '29.99', seats: 5, copy: 'A shared understanding, from the start.', features: ['One company workspace', 'Up to 5 people, including admins', 'Missions and policy communications', 'Company context and role-based access']},
  {id: 'sme', name: 'SME', price: '79.99', seats: 25, copy: 'Bring more perspectives into the picture.', features: ['One company workspace', 'Up to 25 people, including admins', 'Cross-team investigations and approvals', 'Shared intelligence and follow-up work']},
  {id: 'enterprise', name: 'Enterprise', price: '229.99', seats: 100, copy: 'Connect the knowledge across your company.', features: ['One company workspace', 'Up to 100 people, including admins', 'Department structure and scoped permissions', 'Company-wide missions and communications']},
];

export default function Pricing() {
  return <main id="top"><SiteHeader/>
    <section className="pricing-intro"><span className="eyebrow">Early-access pricing</span><h1>One workspace.<br/>Your whole perspective.</h1><p>Start with a question. Bring your people into the conversation.<br/>Choose the space your company needs.</p><div className="pricing-trial"><ShieldCheck size={18}/><span>30-day trial. No card required. No automatic charges.</span></div></section>
    <section className="pricing-plans" aria-label="Monthly workspace plans">{plans.map(plan => <article className={`pricing-plan ${plan.id === 'sme' ? 'featured-plan' : ''}`} key={plan.id}><div className="plan-label"><h2>{plan.name}</h2>{plan.id === 'sme' && <span>For growing teams</span>}</div><p className="plan-copy">{plan.copy}</p><p className="plan-price"><span>$</span>{plan.price}<small> / month</small></p><p className="plan-seats">Workspace + up to {plan.seats} people</p><a className={`button ${plan.id === 'sme' ? 'dark' : 'line'}`} href={`https://app.fielded.ai/sign-up?plan=${plan.id}`}>Start your trial<ArrowUpRight size={18}/></a><ul>{plan.features.map(feature => <li key={feature}><Check size={16}/>{feature}</li>)}<li><Check size={16}/>Included AI allowance, with no automatic overages</li></ul></article>)}</section>
    <div className="pricing-terms">All prices in USD, per workspace per month. No additional workspace fee. Applicable taxes are additional. Paid checkout is not yet available during private beta; no payment is taken when your trial ends.</div>
    <section className="pricing-scale"><div><span className="eyebrow">More than 100 people?</span><h2>Let’s find the right fit.</h2><p>A quote shaped around your organisation, usage and deployment requirements.</p></div><a className="button dark" href="mailto:tech@fielded.ai?subject=Fielded%20pricing%20for%20100%2B%20people">Contact sales<ArrowUpRight size={18}/></a></section>
    <section className="pricing-details"><div><MessageCircle size={24}/><h2>Questions before<br/>the first question?</h2><a className="text-cta" href="https://demo.fielded.ai">View the private demo<ArrowUpRight size={17}/></a></div><div className="pricing-answers"><article><h3>What happens after 30 days?</h3><p>The trial ends without a charge. Your workspace moves to read-only access until a subscription or an authorised tester code is active. Contact us while paid checkout is being set up.</p></article><article><h3>Is AI unlimited?</h3><p>No. Each workspace has a shared processing allowance for conversations, documents and analysis. Usage is visible in the workspace. Processing pauses at the limit; Fielded does not automatically charge for extra usage.</p></article><article><h3>Does every person count as a seat?</h3><p>Yes. Active employees, managers and admins count towards the workspace’s limit. The advertised price includes that entire allowance, not a base fee with per-person charges on top.</p></article><article><h3>What is available in the private beta?</h3><p>Company workspaces, discussions, missions, communications, intelligence and follow-up workflows. External integrations and email delivery depend on configuration. SSO, service-level agreements and bespoke enterprise features are not included promises.</p></article></div></section>
    <footer className="site-footer"><span>© {new Date().getFullYear()} Fielded.ai</span><div><a href="/">Fielded.ai</a><a href="mailto:tech@fielded.ai">Contact us</a><a href="https://app.fielded.ai/sign-in">Log in</a></div></footer>
  </main>;
}
