"use client";

import { useState } from "react";
import { ArrowUp, LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { evidenceHref } from "@/lib/evidence-links";

export function AskFielded({ missionId }: { missionId?: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [sources, setSources] = useState<Array<{ id: string; missionId: string; summary: string }>>([]);
  async function ask(event: React.FormEvent) {
    event.preventDefault(); if (!question.trim() || busy) return;
    setBusy(true); setAnswer(""); setSources([]);
    try {
      const response = await fetch("/api/ai/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, missionId }), signal: AbortSignal.timeout(60000) });
      const data = await response.json();
      if (response.ok && Array.isArray(data.sources)) setSources(data.sources);
      setAnswer(response.ok && typeof data.answer === "string" ? data.answer : typeof data.error === "string" ? data.error : "Fielded could not answer that question. Please try again.");
    } catch {
      setAnswer("Fielded could not be reached. Your question is still here; please try again.");
    } finally {
      setBusy(false);
    }
  }
  return <section className="ask-fielded">
    <div><Sparkles size={19} /><h2>Ask Fielded</h2><p>Interrogate approved evidence across your workspace. Answers exclude private contributions and show uncertainty where evidence is limited.</p></div>
    <div>
      <form className="ask-form" onSubmit={ask}><input maxLength={1000} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Where are handoffs creating the most delay?" aria-label="Ask Fielded" /><button className="icon-button primary" type="submit" disabled={busy} aria-label="Ask question">{busy ? <LoaderCircle className="spin" size={16} /> : <ArrowUp size={16} />}</button></form>
      {answer && <div className="aside-note" style={{ marginTop: 10 }}><p style={{ whiteSpace: "pre-wrap" }}>{answer}</p>{sources.length > 0 && <ul>{sources.map(source => <li key={source.id}><Link href={evidenceHref(source.missionId, source.id)}>{source.summary}</Link></li>)}</ul>}</div>}
    </div>
  </section>;
}
