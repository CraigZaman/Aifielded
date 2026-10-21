import { NextResponse } from "next/server";
import { z } from "zod";
import { getViewer } from "@/lib/auth";
import { hasFirebaseAdminConfiguration, sendFirebasePush } from "@/lib/firebase-admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = z.object({ token: z.string().min(20).max(4096) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid phone token." }, { status: 400 });
  if (!hasFirebaseAdminConfiguration()) {
    return NextResponse.json({ error: "Firebase is not configured on the backend." }, { status: 503 });
  }

  const db = await createClient();
  const { data: device, error } = await db.from("mobile_push_devices")
    .select("id,token")
    .eq("user_id", viewer.id)
    .eq("organisation_id", viewer.organisationId)
    .eq("token", parsed.data.token)
    .eq("enabled", true)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Phone registration could not be checked." }, { status: 503 });
  if (!device) return NextResponse.json({ error: "Enable notifications on this phone first." }, { status: 409 });

  try {
    const delivery = await sendFirebasePush({
      token: device.token,
      title: "Fielded test alert",
      body: "Your phone is connected to the Fielded backend.",
      data: { kind: "backend_test" },
    });
    if (delivery.invalid) {
      await db.from("mobile_push_devices").update({ enabled: false, updated_at: new Date().toISOString() }).eq("id", device.id);
    }
    if (!delivery.sent) return NextResponse.json({ error: "Firebase did not accept this phone token. Enable notifications again and retry." }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Firebase could not be reached. Please retry." }, { status: 502 });
  }
}
