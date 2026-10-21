import { NextResponse } from "next/server";
import { hasFirebaseAdminConfiguration } from "@/lib/firebase-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL
    && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    && process.env.SUPABASE_SECRET_KEY
    && hasFirebaseAdminConfiguration(),
  );
  if (!configured) return NextResponse.json({ status: "setup_required" }, { status: 503 });

  try {
    const { error } = await createAdminClient().from("mobile_push_devices").select("id", { head: true, count: "exact" });
    if (error) throw error;
    return NextResponse.json({ status: "ready" });
  } catch {
    return NextResponse.json({ status: "database_unavailable" }, { status: 503 });
  }
}
