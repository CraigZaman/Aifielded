// Values mirror beta/src/lib/profile-options.ts and the profiles constraints.
export const businessRoles = [
  ['individual_contributor', 'Individual contributor'],
  ['team_lead', 'Team lead'],
  ['people_manager', 'People manager'],
  ['department_lead', 'Department lead'],
  ['executive_founder', 'Executive or founder'],
  ['external_adviser', 'External adviser'],
] as const;

export const departments = [
  ['executive', 'Executive leadership'],
  ['operations', 'Operations'],
  ['engineering', 'Engineering'],
  ['product', 'Product'],
  ['sales', 'Sales'],
  ['marketing', 'Marketing'],
  ['finance', 'Finance'],
  ['people', 'People and HR'],
  ['legal_compliance', 'Legal and compliance'],
  ['customer', 'Customer success or service'],
  ['other', 'Other'],
] as const;
