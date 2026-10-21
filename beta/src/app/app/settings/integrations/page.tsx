import { IntegrationCard } from "@/components/integration-card";
import { canManageIntegrations, requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ error?: string; connected?: string }> }) {
  const viewer = await requireViewer(); if (!canManageIntegrations(viewer.role)) redirect("/app");
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("integration_connections").select("provider,status,metadata").eq("organisation_id", viewer.organisationId);
  const slack = data?.find((item) => item.provider === "slack"); const google = data?.find((item) => item.provider === "google");
  return <div className="page"><header className="page-header"><div className="page-title"><h1>Connected work systems</h1><p>Bring approved operational context into Fielded’s live organisational model.</p></div></header>{params.error && <div className="form-message">{params.error}</div>}{params.connected && <div className="empty-auth" style={{ marginBottom: 20 }}><p>{params.connected} connected successfully.</p></div>}<div className="intelligence-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}><IntegrationCard provider="slack" connected={slack?.status === "active"} detail={(slack?.metadata as { team_name?: string } | null)?.team_name} /><IntegrationCard provider="google" connected={google?.status === "active"} detail={(google?.metadata as { email?: string } | null)?.email} /></div><section className="panel mission-brief" style={{ marginTop: 24 }}><h3>Collection policy</h3><p>Connections do not grant Fielded permission to ingest everything. Workspace owners select channels and labels, and every imported record is tagged with source, time and access metadata before it can inform intelligence.</p><ul><li>Slack: approved channels only</li><li>Google: approved Gmail labels only</li><li>Imported content is treated as untrusted evidence</li></ul></section></div>;
}
