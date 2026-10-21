import { NextResponse } from "next/server";
import { z } from "zod";
import { decryptSecret } from "@/lib/crypto";
import { integrationViewer } from "@/lib/integrations";

type Connection = { id: string; provider: "slack" | "google"; access_token_encrypted: string; metadata: { selected_channels?: string[]; selected_labels?: string[] } };

export async function POST(request: Request) {
  const parsed = z.object({ provider: z.enum(["slack", "google"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Unknown integration." }, { status: 400 });
  const viewer = await integrationViewer(); if ("error" in viewer) return NextResponse.json({ error: viewer.error }, { status: 403 });
  const { data } = await viewer.supabase.from("integration_connections").select("id,provider,access_token_encrypted,metadata").eq("organisation_id", viewer.membership.organisation_id).eq("provider", parsed.data.provider).eq("status", "active").maybeSingle();
  const connection = data as Connection | null;
  if (!connection) return NextResponse.json({ error: "Connect the integration first." }, { status: 404 });
  const selected = connection.provider === "slack" ? connection.metadata.selected_channels : connection.metadata.selected_labels;
  if (!selected?.length) return NextResponse.json({ error: "Select approved sources before starting a sync." }, { status: 400 });
  const token = decryptSecret(connection.access_token_encrypted);
  const run = await viewer.supabase.from("integration_sync_runs").insert({ organisation_id: viewer.membership.organisation_id, connection_id: connection.id, status: "running", started_by: viewer.user.id }).select("id").single();
  if (run.error || !run.data) return NextResponse.json({ error: "The sync could not be started." }, { status: 503 });
  try {
    const records: Array<Record<string, unknown>> = [];
    if (connection.provider === "slack") {
      const channels = connection.metadata.selected_channels || [];
      if (!channels.length) return NextResponse.json({ message: "Connected. Select approved Slack channels before the first sync." });
      for (const channel of channels.slice(0, 10)) {
        const response = await fetch(`https://slack.com/api/conversations.history?channel=${encodeURIComponent(channel)}&limit=50`, { headers: { Authorization: `Bearer ${token}` } });
        const body = await response.json() as { ok: boolean; messages?: Array<{ ts: string; text: string; user?: string }> };
        if (!response.ok || !body.ok) throw new Error("Slack source could not be read");
        if (body.ok) records.push(...(body.messages || []).map((item) => ({ organisation_id: viewer.membership.organisation_id, provider: "slack", source_type: "message", external_id: `${channel}:${item.ts}`, title: `Slack message in ${channel}`, content: item.text, occurred_at: new Date(Number(item.ts.split(".")[0]) * 1000).toISOString(), metadata: { channel, author: item.user } })));
      }
    } else {
      const labels = connection.metadata.selected_labels || [];
      if (!labels.length) return NextResponse.json({ message: "Connected. Select approved Gmail labels before the first sync." });
      const list = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30&labelIds=${labels.map(encodeURIComponent).join("&labelIds=")}`, { headers: { Authorization: `Bearer ${token}` } });
      const listed = await list.json() as { messages?: Array<{ id: string }> };
      if (!list.ok) throw new Error("Gmail source could not be read");
      for (const item of (listed.messages || []).slice(0, 30)) {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, { headers: { Authorization: `Bearer ${token}` } });
        const message = await response.json() as { id: string; snippet?: string; internalDate?: string; payload?: { headers?: Array<{ name: string; value: string }> } };
        if (!response.ok || !message.id) throw new Error("Gmail message could not be read");
        const headers = Object.fromEntries((message.payload?.headers || []).map((header) => [header.name.toLowerCase(), header.value]));
        records.push({ organisation_id: viewer.membership.organisation_id, provider: "google", source_type: "email", external_id: message.id, title: headers.subject || "Email", content: message.snippet || "", occurred_at: message.internalDate ? new Date(Number(message.internalDate)).toISOString() : null, metadata: { from: headers.from, labels } });
      }
    }
    if (records.length) {
      const saved = await viewer.supabase.from("source_records").upsert(records.map(record => ({ ...record, user_id: viewer.user.id, confidentiality: "PRIVATE" })), { onConflict: "organisation_id,provider,external_id", ignoreDuplicates: true });
      if (saved.error) throw new Error("Imported records could not be saved");
    }
    if (run.data) await viewer.supabase.from("integration_sync_runs").update({ status: "completed", completed_at: new Date().toISOString(), records_processed: records.length }).eq("id", run.data.id);
    return NextResponse.json({ message: `${records.length} records processed privately. Imports are not automatically added to approved company evidence.` });
  } catch (error) {
    if (run.data) await viewer.supabase.from("integration_sync_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_message: error instanceof Error ? error.message : "Sync failed" }).eq("id", run.data.id);
    return NextResponse.json({ error: "The sync could not be completed." }, { status: 502 });
  }
}
