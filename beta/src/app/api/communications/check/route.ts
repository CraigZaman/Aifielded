import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { processApprovedAssignment } from "@/lib/mission-analysis";

export const maxDuration = 120;
const schema = z.object({ assignmentId: z.string().uuid(), answers: z.array(z.number().int().min(0).max(2)).length(3), acknowledged: z.literal(true), hasConcerns: z.boolean(), feedback: z.string().trim().max(2000) });
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Answer all three questions and confirm you have read the policy." }, { status: 400 });
  const p = parsed.data;
  const { data, error } = await supabase.rpc("submit_policy_check", { target_assignment: p.assignmentId, selected_answers: p.answers, confirmed_receipt: p.acknowledged, concerns: p.hasConcerns, shared_feedback: p.feedback });
  if (error || !data) return NextResponse.json({ error: "Your check could not be saved. Your answers are retained. Please retry or check whether the assignment has closed." }, { status: 503 });
  after(() => processApprovedAssignment(p.assignmentId, auth.user!.id));
  revalidatePath("/app", "layout");
  return NextResponse.json(data);
}
