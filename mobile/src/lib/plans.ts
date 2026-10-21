export const plans = [
  {
    id: 'startup', name: 'Startup', monthlyPrice: '£29.99', seats: 5,
    description: 'A shared understanding, from the start.',
    features: ['One company workspace', 'Missions and policy communications', 'Company context and role-based access', 'Included AI allowance, with no automatic overages'],
  },
  {
    id: 'sme', name: 'SME', monthlyPrice: '£79.99', seats: 25,
    description: 'Bring more perspectives into the picture.',
    features: ['One company workspace', 'Cross-team investigations and approvals', 'Shared intelligence and follow-up work', 'Included AI allowance, with no automatic overages'],
  },
  {
    id: 'enterprise', name: 'Enterprise', monthlyPrice: '£229.99', seats: 100,
    description: 'Connect the knowledge across your company.',
    features: ['One company workspace', 'Department structure and scoped permissions', 'Company-wide missions and communications', 'Included AI allowance, with no automatic overages'],
  },
] as const;

export type PlanId = typeof plans[number]['id'];
export const isPlanId = (value: unknown): value is PlanId => plans.some(plan => plan.id === value);
