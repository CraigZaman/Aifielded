import { NextResponse } from "next/server";
import { z } from "zod";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ token: z.string().min(20).max(4096), platform: z.enum(["ios", "android"]), appVersion: z.string().max(100).optional() });

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid device registration." }, { status: 400 });
  const db = await createClient();
  const result = await db.rpc("touch_mobile_push_device", { target_token: parsed.data.token, target_platform: parsed.data.platform, target_version: parsed.data.appVersion || null });
  if (result.error) return NextResponse.json({ error: "This phone could not be registered for alerts." }, { status: 503 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = z.object({ token: z.string().min(20).max(4096) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid device registration." }, { status: 400 });
  const db = await createClient();
  const result = await db.from("mobile_push_devices").update({ enabled: false, updated_at: new Date().toISOString() }).eq("user_id", viewer.id).eq("token", parsed.data.token);
  if (result.error) return NextResponse.json({ error: "This phone could not be disabled." }, { status: 503 });
  return NextResponse.json({ ok: true });
}
