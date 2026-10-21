import { after, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { processApprovedAssignment } from "@/lib/mission-analysis";

export const maxDuration = 180;

export async function POST(request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  if (!z.string().uuid().safeParse(assignmentId).success) return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = z.object({ reviewId: z.string().uuid() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Reload and review the saved summary before approving." }, { status: 400 });
  const { error } = await supabase.rpc("approve_conversation_review", { target_assignment: assignmentId, expected_review: body.data.reviewId });
  if (error) return NextResponse.json({ error: "Your approval could not be saved. Please review the summary and try again." }, { status: 409 });
  after(() => processApprovedAssignment(assignmentId, auth.user!.id));
  return NextResponse.json({ ok: true });
}
