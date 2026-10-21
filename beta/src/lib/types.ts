export type WorkspaceRole = "owner" | "manager" | "hr" | "participant" | "consultant";
export type Confidentiality = "PRIVATE" | "CONTRIBUTE" | "SHARE";

export type Viewer = {
  id: string;
  email: string;
  name: string;
  organisationId: string;
  organisationName: string;
  role: WorkspaceRole;
};
