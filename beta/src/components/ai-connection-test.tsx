"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Plug } from "lucide-react";

export function AIConnectionTest() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [ok, setOk] = useState(false);
  async function test() {
    if (busy) return;
    setBusy(true);
    setResult("");
    try {
      const response = await fetch("/api/ai/check", { method: "POST", signal: AbortSignal.timeout(60000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The connection test failed.");
      setOk(true);
      setResult(`Verified: ${data.model}. Response: ${data.answer}`);
    } catch (failure) {
      setOk(false);
      setResult(failure instanceof Error ? failure.message : "The connection test failed.");
    } finally { setBusy(false); }
  }
  return <section className="panel form-panel"><h2>AI processing</h2><div className="stat-line"><span>Model</span><strong>Gemini 3.6 Flash</strong></div><div className="stat-line"><span>Daily reserved allowance</span><strong>$1.00 USD, shared across Fielded</strong></div><div className="stat-line"><span>Automatic model fallback</span><strong>Disabled</strong></div><button className="button button-primary" onClick={test} disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Plug size={16} />}Test connection</button>{result && <p className="form-message" role={ok ? "status" : "alert"}>{ok && <CheckCircle2 size={16} />}{result}</p>}</section>;
}
