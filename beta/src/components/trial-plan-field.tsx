import { PLANS, type PlanKey } from "@/lib/plans";

export function TrialPlanField({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  const selected = value && Object.hasOwn(PLANS, value) ? value : "sme";
  return <label>Workspace plan<select name="trialPlan" {...(onChange ? { value: selected, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.target.value) } : { defaultValue: selected })} required>
    {(Object.keys(PLANS) as PlanKey[]).map(key => <option key={key} value={key}>{PLANS[key].name}: up to {PLANS[key].seats} people, ${(PLANS[key].cents / 100).toFixed(2)} USD/month after trial</option>)}
  </select><small>30 days free. No card or automatic charges. Paid checkout is not yet available.</small></label>;
}
