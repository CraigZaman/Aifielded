import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { dispatchWorkNotifications } from "@/lib/work-notifications";
import { localSmtpPort } from "@/lib/local-smtp";

// Local-only queue drain for smoke tests. Never expose this route in a
// deployment that has no explicitly configured local Mailpit listener.
export async function POST() {
  if (process.env.NODE_ENV !== "development" || !localSmtpPort()) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const viewer = await getViewer();
  if (!viewer || viewer.role !== "owner") return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  try {
    await dispatchWorkNotifications(viewer.organisationId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Local notifications could not be processed." }, { status: 503 });
  }
}
