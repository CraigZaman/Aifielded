import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

import { AIProcessingError } from "@/lib/ai-budget";
import { aiWorkspace } from "@/lib/ai-workspace";
import { getViewer } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Temporary Claude provider. Every request goes through the same workspace
// allowance as Gemini: count input tokens, reserve the maximum output in the
// database, then generate and record actual usage.
//
// Conversational turns use the fast model; extraction, analysis and drafting
// use the stronger one. Both can be overridden without a code change.
export const CLAUDE_CHAT_MODEL = process.env.ANTHROPIC_CHAT_MODEL?.trim() || "claude-haiku-5-5";
export const CLAUDE_WORK_MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5-5";

// Each request may reserve at most 4096 output tokens (reserve_workspace_generation),
// so thinking stays off: thinking tokens would count against that cap.
function thinkingFor(model: string): Anthropic.Beta.BetaThinkingConfigParam | undefined {
  if (model.startsWith("claude-sonnet-5-5")) return { type: "between_tools" };
  if (/^claude-(haiku-5-5|sonnet-5|opus-5)$/.test(model)) return { type: "disabled" };
  return undefined;
}

export function hasClaudeProvider() {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return Boolean(key && key !== "[SENSITIVE]" && key !== "not-configured");
}

let client: Anthropic | null = null;
function claude() {
  // Retries are off as with Gemini: a retried request would spend a second reservation.
  client ??= new Anthropic({ maxRetries: 0, timeout: 45000 });
  return client;
}

function providerFailure(error: unknown) {
  if (error instanceof AIProcessingError) return error;
  if (error instanceof Anthropic.AuthenticationError)
    return new AIProcessingError("ANTHROPIC_KEY_INVALID", "Anthropic rejected the API key. Replace ANTHROPIC_API_KEY with a key from the Claude Console.");
  if (error instanceof Anthropic.RateLimitError)
    return new AIProcessingError("ANTHROPIC_QUOTA_EXCEEDED", "The Anthropic rate limit or credit balance is exhausted. Check usage and billing in the Claude Console.");
  if (error instanceof Anthropic.PermissionDeniedError)
    return new AIProcessingError("ANTHROPIC_ACCESS_DENIED", "Anthropic denied access to the configured model. Check the key's workspace and model access.");
  if (error instanceof Anthropic.APIError) {
    // Log status only: provider messages can echo transcript content.
    console.error("AI provider rejected request", { provider: "anthropic", status: error.status });
    return new AIProcessingError("ANTHROPIC_REQUEST_REJECTED", `Anthropic rejected the request (HTTP ${error.status ?? "unknown"}).`);
  }
  return error;
}

type Request = {
  model: string;
  system?: string;
  content: string | Anthropic.Beta.BetaContentBlockParam[];
  maxOutputTokens: number;
};

async function budgeted<T>({ model, system, content, maxOutputTokens }: Request, run: () => Promise<T & { usage: unknown }>) {
  if (!Number.isInteger(maxOutputTokens) || maxOutputTokens < 1 || maxOutputTokens > 4096) {
    throw new Error("AI request exceeds permitted generation settings.");
  }
  let admin: ReturnType<typeof createAdminClient>;
  try { admin = createAdminClient(); }
  catch { throw new AIProcessingError("AI_BUDGET_CONFIGURATION", "The server's Supabase budget connection is not configured."); }
  const workspace = aiWorkspace.getStore() || (await getViewer())?.organisationId;
  if (!workspace) throw new AIProcessingError("AI_WORKSPACE_REQUIRED", "An active company workspace is required for AI processing.");

  let inputTokens: number;
  try {
    const counted = await claude().messages.countTokens({
      model,
      ...(system ? { system } : {}),
      messages: [{ role: "user", content: content as Anthropic.MessageParam["content"] }],
    });
    inputTokens = counted.input_tokens;
  } catch (error) {
    throw providerFailure(error);
  }
  if (!Number.isInteger(inputTokens) || inputTokens < 1 || inputTokens > 100000) throw new Error("AI input exceeds the permitted size.");

  const reserved = await admin.rpc("reserve_workspace_generation", { workspace, input_token_count: inputTokens, output_token_limit: maxOutputTokens });
  if (reserved.error || !reserved.data) {
    if (reserved.error?.message?.includes("Workspace AI allowance reached")) throw new AIProcessingError("AI_WORKSPACE_LIMIT", "Your workspace AI allowance has been reached. No extra usage has been charged. Your owner can review the allowance in Workspace plan.");
    if (reserved.error?.message?.includes("Workspace trial has ended")) throw new AIProcessingError("WORKSPACE_EXPIRED", "The workspace trial has ended. Ask your workspace owner to activate a plan or tester code.");
    const exhausted = reserved.error?.message?.includes("Daily AI allowance reached");
    console.error("AI reservation rejected", { code: reserved.error?.code, exhausted });
    throw new AIProcessingError(exhausted ? "AI_DAILY_LIMIT" : "AI_BUDGET_UNAVAILABLE", exhausted ? "The daily Fielded AI allowance is exhausted. It resets at midnight UTC." : `The database AI allowance is unavailable (${reserved.error?.code || "no reservation"}). No generation was started.`);
  }

  try {
    const result = await run();
    const recorded = await admin.from("ai_generations").update({ status: "succeeded", usage: result.usage, finished_at: new Date().toISOString() }).eq("id", reserved.data);
    if (recorded.error) console.error("AI usage recording failed", { generationId: reserved.data });
    return result;
  } catch (error) {
    await admin.from("ai_generations").update({ status: "failed", finished_at: new Date().toISOString() }).eq("id", reserved.data);
    throw providerFailure(error);
  }
}

function requestParams({ model, system, content, maxOutputTokens }: Request) {
  const thinking = thinkingFor(model);
  return {
    model,
    max_tokens: maxOutputTokens,
    ...(system ? { system } : {}),
    ...(thinking ? { thinking } : {}),
    messages: [{ role: "user" as const, content }],
    // On a policy decline, retry on the model's server-defined fallback.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default" as const,
  };
}

// Stop reasons that mean the text can't be used as-is. The finishReason values
// match the ones describeAIFailure already recognises.
function checkStop(message: Anthropic.Beta.BetaMessage) {
  if (message.stop_reason === "refusal")
    throw Object.assign(new AIProcessingError("AI_REFUSED", "The AI declined to process this request."), { finishReason: "content-filter" });
  if (message.stop_reason === "max_tokens")
    throw Object.assign(new AIProcessingError("AI_OUTPUT_TRUNCATED", "The AI response was cut short."), { finishReason: "length" });
}

export async function claudeText(request: Request) {
  const message = await budgeted(request, () => claude().beta.messages.create({ ...requestParams(request), stream: false }));
  checkStop(message);
  const text = message.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("").trim();
  if (!text) throw new Error("No readable content was returned.");
  return text;
}

export async function claudeObject<S extends z.ZodType>(schema: S, request: Omit<Request, "maxOutputTokens"> & { maxOutputTokens?: number }): Promise<z.infer<S>> {
  const full = { ...request, maxOutputTokens: request.maxOutputTokens ?? 4096 };
  const message = await budgeted(full, () =>
    claude().beta.messages.parse({ ...requestParams(full), output_config: { format: zodOutputFormat(schema) } }),
  );
  checkStop(message);
  // Callers validate again with the full Zod schema, including bounds the
  // structured-output grammar can't express.
  if (message.parsed_output == null) throw Object.assign(new Error("The AI returned an invalid structured response."), { name: "AI_NoObjectGeneratedError" });
  return message.parsed_output as z.infer<S>;
}

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export function attachmentBlock(bytes: Uint8Array, mediaType: string): Anthropic.Beta.BetaContentBlockParam {
  const data = Buffer.from(bytes).toString("base64");
  if (mediaType === "application/pdf") return { type: "document", source: { type: "base64", media_type: "application/pdf", data } };
  if (IMAGE_TYPES.has(mediaType)) return { type: "image", source: { type: "base64", media_type: mediaType as "image/png", data } };
  throw new AIProcessingError("AI_UNSUPPORTED_MEDIA", "This file type can't be read by the current AI provider. Upload a PDF, image or text file instead.");
}
