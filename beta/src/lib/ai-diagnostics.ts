import "server-only";

// These checks never generate content and are used only by the owner connection test.
export async function inspectGeminiAccess() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return [];
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash";
  const checks = [
    { name: "Model lookup", url: endpoint, body: undefined },
    { name: "Minimal token count", url: `${endpoint}:countTokens`, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Synthetic connection check." }] }] }) },
  ];
  const results: Array<{ check: string; http: number; detail: string }> = [];
  for (const check of checks) {
    try {
      const response = await fetch(check.url, {
        method: check.body ? "POST" : "GET",
        headers: { "x-goog-api-key": key, "content-type": "application/json" },
        body: check.body,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(6000),
      });
      const data = await response.json().catch(() => null);
      const message = typeof data?.error?.message === "string" ? data.error.message : response.ok ? "Accessible" : "Google returned no JSON error detail.";
      const detail = message.replaceAll(key, "[REDACTED]").replace(/(?:AQ\.|AIza)[A-Za-z0-9_.-]+/g, "[REDACTED]").slice(0, 500);
      results.push({ check: check.name, http: response.status, detail });
    } catch {
      results.push({ check: check.name, http: 0, detail: "Diagnostic request could not complete." });
    }
  }
  return results;
}
