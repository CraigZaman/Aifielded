import { NextResponse } from "next/server";
import { z } from "zod";
import { decryptSecret } from "@/lib/crypto";
import { integrationViewer } from "@/lib/integrations";

const providerSchema = z.enum(["slack", "google"]);
type Connection = { id: string; provider: "slack" | "google"; access_token_encrypted: string; metadata: Record<string, unknown> };

async function connectionFor(provider: "slack" | "google") {
  const viewer = await integrationViewer();
  if ("error" in viewer) return { error: viewer.error } as const;
  const { data } = await viewer.supabase.from("integration_connections").select("id,provider,access_token_encrypted,metadata").eq("organisation_id", viewer.membership.organisation_id).eq("provider", provider).eq("status", "active").maybeSingle();
  if (!data) return { error: "Connect the integration first." } as const;
  return { viewer, connection: data as Connection, token: decryptSecret(data.access_token_encrypted) } as const;
}

export async function GET(request: Request) {
  const parsed = providerSchema.safeParse(new URL(request.url).searchParams.get("provider"));
  if (!parsed.success) return NextResponse.json({ error: "Unknown provider." }, { status: 400 });
  const context = await connectionFor(parsed.data); if ("error" in context) return NextResponse.json({ error: context.error }, { status: 403 });
  if (parsed.data === "slack") {
    const response = await fetch("https://slack.com/api/conversations.list?types=public_channel,private_channel&exclude_archived=true&limit=200", { headers: { Authorization: `Bearer ${context.token}` } });
    const body = await response.json() as { ok: boolean; error?: string; channels?: Array<{ id: string; name: string }> };
    if (!body.ok) return NextResponse.json({ error: body.error || "Slack sources could not be loaded." }, { status: 502 });
    const selected = (context.connection.metadata.selected_channels || []) as string[];
    return NextResponse.json({ sources: (body.channels || []).map((item) => ({ id: item.id, name: `#${item.name}`, selected: selected.includes(item.id) })) });
  }
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/labels", { headers: { Authorization: `Bearer ${context.token}` } });
  const body = await response.json() as { labels?: Array<{ id: string; name: string; type: string }>; error?: { message?: string } };
  if (!response.ok) return NextResponse.json({ error: body.error?.message || "Google sources could not be loaded." }, { status: 502 });
  const selected = (context.connection.metadata.selected_labels || []) as string[];
  return NextResponse.json({ sources: (body.labels || []).filter((item) => item.type === "user" || ["INBOX", "SENT", "STARRED"].includes(item.id)).map((item) => ({ id: item.id, name: item.name, selected: selected.includes(item.id) })) });
}

export async function POST(request: Request) {
  const parsed = z.object({ provider: providerSchema, sourceIds: z.array(z.string().min(1)).max(20) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose up to 20 sources." }, { status: 400 });
  const context = await connectionFor(parsed.data.provider); if ("error" in context) return NextResponse.json({ error: context.error }, { status: 403 });
  const key = parsed.data.provider === "slack" ? "selected_channels" : "selected_labels";
  const metadata = { ...context.connection.metadata, [key]: parsed.data.sourceIds };
  const { error } = await context.viewer.supabase.from("integration_connections").update({ metadata, updated_at: new Date().toISOString() }).eq("id", context.connection.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: `${parsed.data.sourceIds.length} source${parsed.data.sourceIds.length === 1 ? "" : "s"} approved.` });
}
