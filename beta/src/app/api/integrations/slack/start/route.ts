import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { integrationViewer } from "@/lib/integrations";

export async function GET() {
  const viewer = await integrationViewer();
  if ("error" in viewer) return NextResponse.redirect(`${appUrl()}/sign-in`);
  if (!process.env.SLACK_CLIENT_ID) return NextResponse.redirect(`${appUrl()}/app/settings/integrations?error=Slack+credentials+are+not+configured.`);
  const state = crypto.randomBytes(24).toString("base64url");
  (await cookies()).set("fielded_slack_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  const params = new URLSearchParams({ client_id: process.env.SLACK_CLIENT_ID, scope: "channels:read,channels:history,groups:read,groups:history,users:read", redirect_uri: `${appUrl()}/api/integrations/slack/callback`, state });
  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params}`);
}
