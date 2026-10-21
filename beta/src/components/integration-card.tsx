"use client";

import { useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";

export function IntegrationCard({ provider, connected, detail }: { provider: "slack" | "google"; connected: boolean; detail?: string }) {
  const [status, setStatus] = useState("");
  const [sources, setSources] = useState<Array<{ id: string; name: string; selected: boolean }> | null>(null);
  const [loadingSources, setLoadingSources] = useState(false);
  const label = provider === "slack" ? "Slack" : "Google Workspace";
  async function sync() {
    setStatus("Syncing...");
    const response = await fetch("/api/integrations/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider }) });
    const data = await response.json(); setStatus(response.ok ? data.message : data.error || "Sync failed");
  }
  async function manageSources() {
    setLoadingSources(true);
    const response = await fetch(`/api/integrations/sources?provider=${provider}`);
    const data = await response.json();
    if (response.ok) setSources(data.sources); else setStatus(data.error || "Sources could not be loaded.");
    setLoadingSources(false);
  }
  async function saveSources() {
    if (!sources) return;
    setStatus("Saving...");
    const response = await fetch("/api/integrations/sources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, sourceIds: sources.filter((source) => source.selected).map((source) => source.id) }) });
    const data = await response.json(); setStatus(response.ok ? data.message : data.error || "Selection could not be saved.");
  }
  return <article className="panel form-panel"><div className="page-header" style={{ marginBottom: 18, alignItems: "center" }}><div className="page-title"><h1 style={{ fontSize: 18 }}>{label}</h1><p>{provider === "slack" ? "Selected channels and operational conversations." : "Selected Gmail labels and work context."}</p></div>{connected && <CheckCircle2 size={20} color="var(--green)" />}</div>{connected ? <><div className="stat-line"><span>Status</span><strong>Connected</strong></div>{detail && <div className="stat-line"><span>Account</span><strong>{detail}</strong></div>}<p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.5 }}>Source selection is intentionally explicit. Fielded does not ingest an entire workspace or inbox by default.</p>{sources && <div className="source-list">{sources.map((source) => <label key={source.id}><input type="checkbox" checked={source.selected} onChange={() => setSources((current) => current?.map((item) => item.id === source.id ? { ...item, selected: !item.selected } : item) || null)} /><span>{source.name}</span></label>)}</div>}<div className="page-actions" style={{ marginTop: 14 }}><button className="button button-quiet" onClick={sources ? saveSources : manageSources} disabled={loadingSources}>{sources ? "Save sources" : loadingSources ? "Loading..." : "Choose sources"}</button><button className="button button-quiet" onClick={sync}><RefreshCw size={15} />Sync now</button></div>{status && <p style={{ fontSize: 12 }}>{status}</p>}</> : <a className="button button-primary" href={`/api/integrations/${provider}/start`}>Connect {label}</a>}</article>;
}
