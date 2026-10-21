export const BUSINESS_ROLE_VALUES = [
  "individual_contributor",
  "team_lead",
  "people_manager",
  "department_lead",
  "executive_founder",
  "external_adviser",
] as const;

export const BUSINESS_ROLE_OPTIONS = [
  { value: "individual_contributor", label: "Individual contributor" },
  { value: "team_lead", label: "Team lead" },
  { value: "people_manager", label: "People manager" },
  { value: "department_lead", label: "Department lead" },
  { value: "executive_founder", label: "Executive or founder" },
  { value: "external_adviser", label: "External adviser" },
] as const;

export const DEPARTMENT_VALUES = [
  "executive",
  "operations",
  "engineering",
  "product",
  "sales",
  "marketing",
  "finance",
  "people",
  "legal_compliance",
  "customer",
  "other",
] as const;

export const DEPARTMENT_OPTIONS = [
  { value: "executive", label: "Executive leadership" },
  { value: "operations", label: "Operations" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "people", label: "People and HR" },
  { value: "legal_compliance", label: "Legal and compliance" },
  { value: "customer", label: "Customer success or service" },
  { value: "other", label: "Other" },
] as const;

export function optionLabel(options: ReadonlyArray<{ value: string; label: string }>, value?: string | null) {
  return options.find((option) => option.value === value)?.label || value?.replaceAll("_", " ") || "Not provided";
}
