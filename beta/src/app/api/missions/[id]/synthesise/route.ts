import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAIProvider } from "@/lib/ai";
import { canManage } from "@/lib/auth";
import { processMissionAnalysis } from "@/lib/mission-analysis";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const native = /^Bearer [A-Za-z0-9._-]+$/i.test(request.headers.get("authorization") || "");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid mission." }, { status: 400 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return native ? NextResponse.json({ error: "Sign in required." }, { status: 401 }) : NextResponse.redirect(new URL("/sign-in", request.url), 303);
  const { data: membership } = await supabase.from("organisation_memberships").select("organisation_id,role").eq("user_id", auth.user.id).eq("status", "active").limit(1).maybeSingle();
  if (!membership || !canManage(membership.role)) return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  const mission = await supabase.from("missions").select("id").eq("id", id).eq("organisation_id", membership.organisation_id).maybeSingle();
  if (mission.error) return NextResponse.json({ error: "Mission could not be loaded." }, { status: 503 });
  if (!mission.data) return NextResponse.json({ error: "Mission not found." }, { status: 404 });
  const destination = new URL(`/app/missions/${id}`, request.url);
  if (!hasAIProvider()) {
    if (native) return NextResponse.json({ error: "AI analysis is currently unavailable. Existing findings are unchanged." }, { status: 503 });
    destination.searchParams.set("message", "AI analysis is currently unavailable. Existing findings are unchanged.");
  }
  else try {
    const queued = await supabase.rpc("request_mission_analysis", { target_mission: id });
    if (queued.error) throw new Error("Analysis could not be queued.");
    const result = await processMissionAnalysis(id);
    const message = result === "ready" ? "Mission intelligence updated." : result === "deferred" ? "The daily AI allowance is reached. Analysis is queued for retry." : ["idle", "pending"].includes(result) ? "Analysis is in progress or queued for refresh." : "Analysis could not finish. Existing findings are unchanged; queued work is retained for retry.";
    if (native) return NextResponse.json({ message });
    destination.searchParams.set("message", message);
  } catch {
    if (native) return NextResponse.json({ error: "Analysis could not be started. Existing findings are unchanged. Please try again." }, { status: 503 });
    destination.searchParams.set("message", "Analysis could not be started. Existing findings are unchanged. Please try again.");
  }
  return NextResponse.redirect(destination, 303);
}
