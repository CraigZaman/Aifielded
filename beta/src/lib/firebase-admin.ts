import "server-only";
import { createSign } from "node:crypto";

type PushMessage = { token: string; title: string; body: string; data: Record<string, string> };

function base64url(value: string) {
  return Buffer.from(value).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll(/=+$/g, "");
}

function configuration() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replaceAll("\\n", "\n")
    || (process.env.FIREBASE_PRIVATE_KEY_B64 ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, "base64").toString("utf8") : undefined);
  return projectId && clientEmail && privateKey ? { projectId, clientEmail, privateKey } : null;
}

async function accessToken() {
  const config = configuration();
  if (!config) return null;
  const now = Math.floor(Date.now() / 1000);
  const assertion = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(JSON.stringify({ iss: config.clientEmail, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }))}`;
  const signature = createSign("RSA-SHA256").update(assertion).sign(config.privateKey, "base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${assertion}.${signature}` }) });
  if (!response.ok) throw new Error("Firebase access token could not be created.");
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("Firebase access token was missing.");
  return { token: payload.access_token, projectId: config.projectId };
}

export function hasFirebaseAdminConfiguration() { return Boolean(configuration()); }

export async function sendFirebasePush(message: PushMessage) {
  const auth = await accessToken();
  if (!auth) return { sent: false, configured: false };
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${encodeURIComponent(auth.projectId)}/messages:send`, {
    method: "POST",
    headers: { authorization: `Bearer ${auth.token}`, "content-type": "application/json" },
    body: JSON.stringify({ message: { token: message.token, notification: { title: message.title, body: message.body }, data: message.data, android: { priority: "high" }, apns: { payload: { aps: { sound: "default" } } } } }),
  });
  if (response.ok) return { sent: true, configured: true };
  const detail = await response.text().catch(() => "");
  return { sent: false, configured: true, invalid: response.status === 400 || response.status === 404, reason: detail.slice(0, 500) };
}
