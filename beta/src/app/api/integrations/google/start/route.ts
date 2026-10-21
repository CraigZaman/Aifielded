import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { integrationViewer } from "@/lib/integrations";

export async function GET() {
  const viewer = await integrationViewer(); if ("error" in viewer) return NextResponse.redirect(`${appUrl()}/sign-in`);
  if (!process.env.GOOGLE_CLIENT_ID) return NextResponse.redirect(`${appUrl()}/app/settings/integrations?error=Google+credentials+are+not+configured.`);
  const state = crypto.randomBytes(24).toString("base64url");
  (await cookies()).set("fielded_google_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: `${appUrl()}/api/integrations/google/callback`, response_type: "code", access_type: "offline", prompt: "consent", include_granted_scopes: "true", state, scope: "openid email https://www.googleapis.com/auth/gmail.readonly" });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
