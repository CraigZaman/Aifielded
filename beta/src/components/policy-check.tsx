"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import type { PolicyQuestion } from "@/lib/policy-schema";

export function PolicyCheck({ assignmentId, questions, initialResult = null }: {
  assignmentId: string; questions: Array<Pick<PolicyQuestion, "question" | "options">>;
  initialResult?: { score: number; questions: PolicyQuestion[] } | null;
}) {
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [concerns, setConcerns] = useState<"" | "yes" | "no">("");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState(initialResult);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/communications/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignmentId, answers, acknowledged, hasConcerns: concerns === "yes", feedback }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The check could not be saved.");
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Connection interrupted. Your answers are retained; try again."); }
    finally { setBusy(false); }
  }
  if (result) return <section className="policy-section"><CheckCircle2 size={24} /><h2>Check saved: {result.score} / 3 correct</h2><p>{result.score === 3 ? "You answered all three questions correctly." : "Some points need clarification. Review the explanations below and raise any remaining questions with HR."} This is an understanding check, not a compliance certification.</p>
    {result.questions.map((q, i) => <div className="policy-question" key={i}><h3>{i + 1}. {q.question}</h3><p><strong>Correct answer:</strong> {q.options[q.correctIndex]}</p><p>{q.explanation}</p><blockquote>{q.sourceQuote}</blockquote></div>)}
    <Link href="/app" className="button button-primary">Back to dashboard</Link></section>;
  return <form onSubmit={submit} className="stack-form"><h2>Three quick questions</h2><p>Your first submitted answers are recorded. HR can see your name, receipt acknowledgement, score, concern flag and any feedback you choose to submit here. Your private chat is not included.</p>
    {error && <div className="form-message" role="alert">{error}</div>}
    <fieldset disabled={busy} className="policy-fieldset">
      {questions.map((q, i) => <fieldset className="policy-question" key={i}><legend>{i + 1}. {q.question}</legend>{q.options.map((option, j) => <label className="policy-choice" key={j}><input type="radio" required name={`question-${i}`} value={j} checked={answers[i] === j} onChange={() => setAnswers(current => current.map((v, k) => k === i ? j : v))} /><span>{option}</span></label>)}</fieldset>)}
      <label>Do you have any concerns or need clarification?<select required value={concerns} onChange={e => setConcerns(e.target.value as typeof concerns)}><option value="">Choose an answer</option><option value="yes">Yes, I would like HR to follow up</option><option value="no">No concerns to flag</option></select></label>
      <label>Questions or feedback to share with HR (optional)<textarea maxLength={2000} rows={4} value={feedback} onChange={e => setFeedback(e.target.value)} /></label>
      <p className="muted">For sensitive reports, use the designated channel in the policy. Do not include allegations or identifying details here.</p>
      <label className="policy-choice"><input type="checkbox" required checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)} /><span>I have read this policy and confirm submission of my answers and the information described above. This does not mean I agree with every provision.</span></label>
    </fieldset>
    <button className="button button-primary" type="submit" disabled={busy || answers.includes(-1) || !acknowledged || !concerns}>{busy && <LoaderCircle size={16} className="spin" />}Submit understanding check</button>
  </form>;
}
