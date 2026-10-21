import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { encryptSecret } from "@/lib/crypto";
import { integrationViewer } from "@/lib/integrations";

type GoogleToken = { access_token?: string; refresh_token?: string; expires_in?: number; scope?: string; error_description?: string };

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code"); const state = url.searchParams.get("state");
  const cookieStore = await cookies(); const expected = cookieStore.get("fielded_google_state")?.value; cookieStore.delete("fielded_google_state");
  if (!code || !state || state !== expected) return NextResponse.redirect(`${appUrl()}/app/settings/integrations?error=Google+authorisation+could+not+be+verified.`);
  const viewer = await integrationViewer(); if ("error" in viewer) return NextResponse.redirect(`${appUrl()}/sign-in`);
  const body = new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID || "", client_secret: process.env.GOOGLE_CLIENT_SECRET || "", redirect_uri: `${appUrl()}/api/integrations/google/callback`, grant_type: "authorization_code" });
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const token = (await tokenResponse.json()) as GoogleToken;
  if (!token.access_token) return NextResponse.redirect(`${appUrl()}/app/settings/integrations?error=${encodeURIComponent(token.error_description || "Google connection failed.")}`);
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } });
  const profile = profileResponse.ok ? await profileResponse.json() as { sub?: string; email?: string } : {};
  const { data: existing } = await viewer.supabase.from("integration_connections").select("refresh_token_encrypted").eq("organisation_id", viewer.membership.organisation_id).eq("provider", "google").maybeSingle();
  const { error } = await viewer.supabase.from("integration_connections").upsert({ organisation_id: viewer.membership.organisation_id, provider: "google", status: "active", access_token_encrypted: encryptSecret(token.access_token), refresh_token_encrypted: token.refresh_token ? encryptSecret(token.refresh_token) : existing?.refresh_token_encrypted || null, token_expires_at: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null, external_account_id: profile.sub || null, scopes: token.scope?.split(" ") || [], metadata: { email: profile.email, selected_labels: [] }, connected_by: viewer.user.id, connected_at: new Date().toISOString() }, { onConflict: "organisation_id,provider" });
  if (error) return NextResponse.redirect(`${appUrl()}/app/settings/integrations?error=${encodeURIComponent(error.message)}`);
  return NextResponse.redirect(`${appUrl()}/app/settings/integrations?connected=Google+Workspace`);
}
