import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewer } from "@/lib/auth";
import { aiWorkspace } from "@/lib/ai-workspace";

const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash";

export class AIProcessingError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "AIProcessingError";
  }
}

function providerFailure(stage: string, status: number, result: { error?: { status?: string; message?: string; details?: { reason?: string }[] } }) {
  const reason = result.error?.details?.map(item => item.reason).find(value => value && /^[A-Z_]{1,80}$/.test(value));
  const keyInvalid = reason === "API_KEY_INVALID" || /API key not valid/i.test(result.error?.message || "");
  const code = keyInvalid ? "GOOGLE_KEY_INVALID" : status === 429 ? "GOOGLE_QUOTA_EXCEEDED" : status === 403 ? "GOOGLE_ACCESS_DENIED" : "GOOGLE_REQUEST_REJECTED";
  const diagnostic = /uuid|unsupported.*format|format.*not supported/i.test(result.error?.message || "") ? "SCHEMA_FORMAT"
    : /too (complex|many|large)|complexity|too many states/i.test(result.error?.message || "") ? "SCHEMA_COMPLEXITY"
    : /schema/i.test(result.error?.message || "") ? "SCHEMA_REJECTED" : "OTHER";
  const allowedTerms = new Set("invalid argument unsupported not supported constraints constraint format uuid json schema response output input tokens token max min maximum minimum items maxitems minitems pattern property properties required optional array arrays nested nesting depth limit exceeded exceeds complexity complex states too many large size generation config configuration responsejsonschema responseschema structured mime type maxoutputtokens thinking budget must be less greater than equal integer number string length maxlength minlength field unknown payload enum additionalproperties reference refs ref defs default only allowed cannot found".split(" "));
  const diagnosticTerms = (result.error?.message || "").toLowerCase().match(/[a-z]+/g)?.filter(term => allowedTerms.has(term)).slice(0, 60).join(" ");
  console.error("AI provider rejected request", { stage, status, code, reason, diagnostic, diagnosticTerms });
  return new AIProcessingError(code, keyInvalid ? "Google rejected the API key. Replace GOOGLE_GENERATIVE_AI_API_KEY with a Gemini API key from Google AI Studio." : status === 429 ? "Google's API quota is exhausted. Check billing and Gemini 3.6 Flash quota in Google AI Studio." : `Google rejected the ${stage} request (HTTP ${status}${reason ? `, ${reason}` : ""}). Check API access for the key's Google project.`);
}

// All inference passes through this transport, including structured extraction and Ask.
export const budgetedGeminiFetch: typeof fetch = async (input, init) => {
  if (String(input) !== `${endpoint}:generateContent` || init?.method !== "POST" || typeof init.body !== "string") {
    throw new Error("Only Gemini 3.6 Flash generation is allowed.");
  }
  const body = JSON.parse(init.body);
  const limit = body.generationConfig?.maxOutputTokens;
  if (!Number.isInteger(limit) || limit < 1 || limit > 4096 || body.tools?.length || body.cachedContent) {
    throw new Error("AI request exceeds permitted generation settings.");
  }
  let admin: ReturnType<typeof createAdminClient>;
  try { admin = createAdminClient(); }
  catch { throw new AIProcessingError("AI_BUDGET_CONFIGURATION", "The server's Supabase budget connection is not configured."); }
  const workspace = aiWorkspace.getStore() || (await getViewer())?.organisationId;
  if (!workspace) throw new AIProcessingError("AI_WORKSPACE_REQUIRED", "An active company workspace is required for AI processing.");
  const counted = await fetch(`${endpoint}:countTokens`, {
    method: "POST",
    headers: init.headers,
    signal: init.signal,
    body: JSON.stringify({ generateContentRequest: { ...body, model: "models/gemini-3.6-flash" } }),
    redirect: "error",
  });
  const count = await counted.json();
  if (!counted.ok) throw providerFailure("token-counting", counted.status, count);
  if (!Number.isInteger(count.totalTokens) || count.totalTokens < 1 || count.totalTokens > 100000) {
    throw new Error("AI input exceeds the permitted size.");
  }
  const reserved = await admin.rpc("reserve_workspace_generation", { workspace, input_token_count: count.totalTokens, output_token_limit: limit });
  if (reserved.error || !reserved.data) {
    if (reserved.error?.message?.includes("Workspace AI allowance reached")) throw new AIProcessingError("AI_WORKSPACE_LIMIT", "Your workspace AI allowance has been reached. No extra usage has been charged. Your owner can review the allowance in Workspace plan.");
    if (reserved.error?.message?.includes("Workspace trial has ended")) throw new AIProcessingError("WORKSPACE_EXPIRED", "The workspace trial has ended. Ask your workspace owner to activate a plan or tester code.");
    const exhausted = reserved.error?.message?.includes("Daily AI allowance reached");
    console.error("AI reservation rejected", { code: reserved.error?.code, exhausted });
    throw new AIProcessingError(exhausted ? "AI_DAILY_LIMIT" : "AI_BUDGET_UNAVAILABLE", exhausted ? "The daily Fielded AI allowance is exhausted. It resets at midnight UTC." : `The database AI allowance is unavailable (${reserved.error?.code || "no reservation"}). Verify migration 011 and the Supabase server key. No generation was started.`);
  }
  try {
    const response = await fetch(input, { ...init, redirect: "error" });
    const result = await response.clone().json().catch(() => ({}));
    const recorded = await admin.from("ai_generations").update({
      status: response.ok ? "succeeded" : "failed",
      usage: result.usageMetadata || null,
      finished_at: new Date().toISOString(),
    }).eq("id", reserved.data);
    if (recorded.error) console.error("AI usage recording failed", { generationId: reserved.data });
    if (!response.ok) throw providerFailure("generation", response.status, result);
    return response;
  } catch (error) {
    await admin.from("ai_generations").update({ status: "failed", finished_at: new Date().toISOString() }).eq("id", reserved.data);
    throw error;
  }
};
