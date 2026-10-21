export const PLANS = {
  startup: { name: "Startup", seats: 5, cents: 2999, aiUnits: 8_000_000 },
  sme: { name: "SME", seats: 25, cents: 7999, aiUnits: 24_000_000 },
  enterprise: { name: "Enterprise", seats: 100, cents: 22999, aiUnits: 80_000_000 },
} as const;
export type PlanKey = keyof typeof PLANS;
export const TRIAL_AI_UNITS = 4_000_000;
export function daysRemaining(end: string, now = Date.now()) {
  return Math.max(0, Math.ceil((Date.parse(end) - now) / 86_400_000));
}
