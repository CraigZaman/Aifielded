"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, LoaderCircle, Send } from "lucide-react";
import type { PolicyDraft } from "@/lib/policy-schema";
import { AudiencePicker } from "@/components/audience-picker";
import { previewAudience,type Audience,type AudienceMember,type AudienceDepartment } from "@/lib/audience";

export function PolicyLaunchForm({ members, departments = [], requestId, approval: configuredApproval = "none", directDepartment, audienceScope = "organisation" }: { members: AudienceMember[]; departments?: AudienceDepartment[]; requestId: string; approval?: string; directDepartment?:string|null; audienceScope?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sourceName, setSourceName] = useState("Pasted policy");
  const [draft, setDraft] = useState<PolicyDraft | null>(null);
  const [audience,setAudience]=useState<Audience>({mode:"individuals",departmentKeys:[],individualIds:[]});
  const selected=previewAudience(members,departments,audience).map(m=>m.id);
  const approval=directDepartment&&selected.length>0&&selected.every(id=>members.find(m=>m.id===id)?.department===directDepartment)?"none":configuredApproval;
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [publicationStarted, setPublicationStarted] = useState(false);
  async function generate() {
    if (busy) return;
    setBusy("draft"); setError(""); setReviewed(false);
    try {
      const form = new FormData();
      form.set("policyText", text);
      if (file) form.set("file", file);
      const response = await fetch("/api/communications/draft", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Drafting failed.");
      setText(result.policyText); setSourceName(result.sourceName); setFile(null);
      setDraft({ briefing: result.briefing, questions: result.questions });
    } catch (e) { setError(e instanceof Error ? e.message : "Drafting failed. Your input is retained."); }
    finally { setBusy(""); }
  }
  async function publish(event: React.FormEvent) {
    event.preventDefault();
    if (!draft || busy) return;
    setBusy("publish"); setError(""); setPublicationStarted(true);
    try {
      const response = await fetch("/api/communications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, title, version, policyText: text, sourceName, ...draft, recipients: selected, audience, reviewed }) });
      const result = await response.json();
      if (!response.ok) { if (response.status < 500) setPublicationStarted(false); throw new Error(result.error || "Publication failed."); }
      router.push(result.request ? `/app/publishing/${result.id}` : `/app/communications/${result.id}`); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Connection interrupted. Retry the same publication to check its status."); }
    finally { setBusy(""); }
  }
  function updateQuestion(index: number, change: Partial<PolicyDraft["questions"][number]>) {
    setDraft(current => current && ({ ...current, questions: current.questions.map((q, i) => i === index ? { ...q, ...change } : q) }));
    setReviewed(false);
  }
  return <form onSubmit={publish} className="stack-form policy-builder">
    {approval !== "none" && <div className="form-message">{approval === "owner" ? "Owner approval required before assignment." : "Department-head review, then owner approval, before assignment."}</div>}
    {error && <div className="form-message" role="alert">{error}</div>}
    <fieldset disabled={Boolean(busy) || publicationStarted} className="policy-fieldset">
      <div className="policy-section"><h2>01 / Policy source</h2>
        <div className="policy-field-grid"><label>Communication title<input required minLength={4} maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="Whistleblowing policy update" /></label><label>Policy version or effective date<input required maxLength={80} value={version} onChange={e => setVersion(e.target.value)} placeholder="September 2026" /></label></div>
        {!draft && <label className="policy-upload"><FileUp size={20} />Policy document<input type="file" accept="application/pdf,text/plain,.pdf,.txt" onChange={e => setFile(e.target.files?.[0] || null)} /></label>}
        <label>{draft ? "Reviewed source text" : "Or paste the policy"}<textarea rows={draft ? 10 : 6} maxLength={24000} value={text} onChange={e => { setText(e.target.value); setReviewed(false); }} placeholder="Include the reporting routes, responsibilities and changes employees need to understand." /></label>
        {draft && <p className="muted">Source: {sourceName}. The reviewed text below is the published source; the original file is not distributed. Check extracted text against your document.</p>}
        <button className="button button-quiet" type="button" disabled={!file && text.trim().length < 80} onClick={generate}>{busy === "draft" ? <LoaderCircle className="spin" size={16} /> : <FileUp size={16} />}{draft ? "Regenerate briefing and check" : "Prepare briefing and three questions"}</button>
      </div>
      {draft && <>
        <div className="policy-section"><h2>02 / Review the briefing and check</h2><label>Employee briefing<textarea required minLength={20} maxLength={3000} rows={6} value={draft.briefing} onChange={e => { setDraft({ ...draft, briefing: e.target.value }); setReviewed(false); }} /></label>
          {draft.questions.map((q, i) => <fieldset className="policy-question" key={i}><legend>Question {i + 1}</legend>
            <label>Question<input required minLength={8} maxLength={500} value={q.question} onChange={e => updateQuestion(i, { question: e.target.value })} /></label>
            {q.options.map((option, j) => <label key={j}>Option {j + 1}<input required maxLength={300} value={option} onChange={e => updateQuestion(i, { options: q.options.map((v, k) => k === j ? e.target.value : v) })} /></label>)}
            <label>Correct answer<select value={q.correctIndex} onChange={e => updateQuestion(i, { correctIndex: Number(e.target.value) })}>{q.options.map((_, j) => <option key={j} value={j}>Option {j + 1}</option>)}</select></label>
            <label>Explanation<textarea required minLength={8} maxLength={1000} rows={2} value={q.explanation} onChange={e => updateQuestion(i, { explanation: e.target.value })} /></label>
            <label>Exact supporting quotation<textarea required minLength={8} maxLength={500} rows={2} value={q.sourceQuote} onChange={e => updateQuestion(i, { sourceQuote: e.target.value })} /></label>
          </fieldset>)}
        </div>
        <div className="policy-section"><h2>03 / Recipients</h2><AudiencePicker members={members} departments={departments} value={audience} onChange={value=>{setAudience(value);setReviewed(false);}} scope={audienceScope} />
          <label className="policy-choice"><input type="checkbox" required checked={reviewed} onChange={e => setReviewed(e.target.checked)} /><span>I have verified the source, briefing, answer key and recipients. {approval === "none" ? "Publish this version to their employee portals." : "Submit this version for the required approvals."}</span></label>
        </div>
      </>}
    </fieldset>
    {draft && <button type="submit" className="button button-primary" disabled={Boolean(busy) || !reviewed || !selected.length || selected.length>200}>{busy === "publish" ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}{publicationStarted ? "Check submission" : approval === "none" ? "Publish communication" : "Submit for approval"}</button>}
  </form>;
}
