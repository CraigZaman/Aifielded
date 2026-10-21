import "server-only";

// Provider exceptions can contain transcripts and keys. Return only allowlisted metadata.
export function describeAIFailure(error: unknown) {
  let current = error;
  let code = "AI_PROCESSING_FAILED";
  let finishReason: string | undefined;
  for (let depth = 0; depth < 8 && current && typeof current === "object"; depth++) {
    const item = current as { code?: string; name?: string; cause?: unknown; finishReason?: string };
    if (["stop", "length", "content-filter", "error", "other", "unknown"].includes(item.finishReason || "")) finishReason = item.finishReason;
    if (["AI_DAILY_LIMIT", "AI_BUDGET_UNAVAILABLE", "AI_BUDGET_CONFIGURATION", "GOOGLE_KEY_INVALID", "GOOGLE_QUOTA_EXCEEDED", "GOOGLE_ACCESS_DENIED", "GOOGLE_REQUEST_REJECTED"].includes(item.code || "")) {
      code = item.code!;
      break;
    }
    if (item.name === "AI_NoObjectGeneratedError" || item.name === "AI_TypeValidationError" || item.name === "ZodError") code = "AI_INVALID_SUMMARY";
    if (item.name === "TimeoutError" || item.name === "AbortError") code = "AI_TIMEOUT";
    current = item.cause;
  }
  const message = code === "AI_DAILY_LIMIT"
    ? "Your transcript is saved. The daily AI allowance has been reached and resets at midnight UTC. Return then to prepare your summary."
    : code === "AI_INVALID_SUMMARY"
      ? "Your transcript is saved, but the AI returned an incomplete or invalid summary. Please retry the summary; you do not need to repeat the discussion."
      : code === "AI_TIMEOUT"
        ? "Your transcript is saved. Summary preparation timed out. Please retry the summary; you do not need to repeat the discussion."
        : "Your transcript is saved, but AI summary processing is unavailable. You do not need to repeat the discussion.";
  return { code, finishReason, message };
}
