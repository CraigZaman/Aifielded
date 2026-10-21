import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { encryptSecret } from "@/lib/crypto";
import { integrationViewer } from "@/lib/integrations";

type SlackToken = { ok: boolean; error?: string; access_token?: string; team?: { id: string; name: string }; authed_user?: { id: string }; scope?: string };

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code"); const state = url.searchParams.get("state");
  const cookieStore = await cookies(); const expected = cookieStore.get("fielded_slack_state")?.value; cookieStore.delete("fielded_slack_state");
  if (!code || !state || state !== expected) return NextResponse.redirect(`${appUrl()}/app/settings/integrations?error=Slack+authorisation+could+not+be+verified.`);
  const viewer = await integrationViewer(); if ("error" in viewer) return NextResponse.redirect(`${appUrl()}/sign-in`);
  const body = new URLSearchParams({ code, client_id: process.env.SLACK_CLIENT_ID || "", client_secret: process.env.SLACK_CLIENT_SECRET || "", redirect_uri: `${appUrl()}/api/integrations/slack/callback` });
  const response = await fetch("https://slack.com/api/oauth.v2.access", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const token = (await response.json()) as SlackToken;
  if (!token.ok || !token.access_token) return NextResponse.redirect(`${appUrl()}/app/settings/integrations?error=${encodeURIComponent(token.error || "Slack connection failed.")}`);
  const { error } = await viewer.supabase.from("integration_connections").upsert({ organisation_id: viewer.membership.organisation_id, provider: "slack", status: "active", access_token_encrypted: encryptSecret(token.access_token), refresh_token_encrypted: null, external_account_id: token.team?.id || null, scopes: token.scope?.split(",") || [], metadata: { team_name: token.team?.name, authed_user_id: token.authed_user?.id, selected_channels: [] }, connected_by: viewer.user.id, connected_at: new Date().toISOString() }, { onConflict: "organisation_id,provider" });
  if (error) return NextResponse.redirect(`${appUrl()}/app/settings/integrations?error=${encodeURIComponent(error.message)}`);
  return NextResponse.redirect(`${appUrl()}/app/settings/integrations?connected=Slack`);
}
