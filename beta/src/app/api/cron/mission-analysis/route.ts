import { timingSafeEqual } from "node:crypto";
import { processMissionAnalysis } from "@/lib/mission-analysis";
import { refreshScheduledCompanySources } from "@/lib/company-source-refresh";

export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret || ""}`);
  if (!secret || secret.length < 32 || provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return Response.json({ error: "Not authorised." }, { status: 401 });
  }
  const results: string[] = [];
  try {
    // Bounded recovery batch; normal approvals also start processing after their response.
    for (let i = 0; i < 4; i++) {
      const result = await processMissionAnalysis();
      results.push(result);
      if (["idle", "unavailable", "deferred"].includes(result)) break;
    }
    let sourceChecks: number | string;
    try { sourceChecks = await refreshScheduledCompanySources(); }
    catch { sourceChecks = "unavailable"; }
    return Response.json({ results, sourceChecks });
  } catch {
    console.error("Scheduled mission analysis failed; queued work retained.");
    return Response.json({ error: "Analysis recovery could not complete." }, { status: 503 });
  }
}
