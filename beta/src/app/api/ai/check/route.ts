import { generateText } from "ai";
import { NextResponse } from "next/server";
import { MODEL, MODEL_ID, AI_REQUEST_OPTIONS, hasAIProvider } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { AIProcessingError } from "@/lib/ai-budget";
import { inspectGeminiAccess } from "@/lib/ai-diagnostics";

export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: membership } = await supabase.from("organisation_memberships")
    .select("id").eq("user_id", auth.user.id).eq("role", "owner").eq("status", "active").limit(1).maybeSingle();
  if (!membership) return NextResponse.json({ error: "Workspace owner access required." }, { status: 403 });
  if (!hasAIProvider()) return NextResponse.json({ error: "The Google API key is not configured on this release." }, { status: 503 });
  try {
    const result = await generateText({
      ...AI_REQUEST_OPTIONS,
      maxOutputTokens: 256,
      model: MODEL,
      prompt: "This is a synthetic connection test, with no employee information. Reply with: Fielded connection verified.",
    });
    if (!result.text.trim()) throw new Error("Empty response");
    return NextResponse.json({ model: MODEL_ID, answer: result.text, ok: true });
  } catch (error) {
    if (error instanceof AIProcessingError) {
      const diagnostics = error.code.startsWith("GOOGLE_") ? await inspectGeminiAccess() : [];
      const detail = diagnostics.map(item => `${item.check}: ${item.http ? `HTTP ${item.http}` : "unavailable"}. ${item.detail}`).join("\n");
      return NextResponse.json({ error: [error.message, detail].filter(Boolean).join("\n\n"), code: error.code, diagnostics }, { status: 503 });
    }
    console.error("AI connection test failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Gemini verification failed. Check the Google key, billing status and daily AI allowance. No alternate model was used." }, { status: 503 });
  }
}
