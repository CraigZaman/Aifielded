"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Check, FileUp, LoaderCircle, Mic, Send, Square, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Confidentiality } from "@/lib/types";

type ChatMessage = { id: string; sender: "participant" | "fielded"; content: string; confidentiality: Confidentiality };
type Review = { reviewId: string; summary: string; observations: Array<{ category: string; summary: string; sourceConfidentiality: Confidentiality }> };

export function FieldedChat({ assignmentId, missionTitle, missionObjective, participantName, initialMessages, initialReview = null, policyMode = false }: { assignmentId: string; missionTitle: string; missionObjective: string; participantName: string; initialMessages: ChatMessage[]; initialReview?: Review | null; policyMode?: boolean }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [content, setContent] = useState("");
  const [confidentiality, setConfidentiality] = useState<Confidentiality>("PRIVATE");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [review, setReview] = useState<Review | null>(initialReview);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (recordingTimer.current) clearTimeout(recordingTimer.current);
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.onstop = null;
      if (recorder.state !== "inactive") recorder.stop();
      recorder.stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  async function sendMessage(text = content) {
    const trimmed = text.trim();
    if (!trimmed || busy || recording) return;
    if (trimmed.length > 8000) { setError("Please shorten this contribution to 8,000 characters or send it in parts."); return; }
    setError("");
    const optimistic: ChatMessage = { id: crypto.randomUUID(), sender: "participant", content: trimmed, confidentiality };
    setMessages((current) => [...current, optimistic]);
    setContent("");
    setBusy(true);
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignmentId, content: trimmed, confidentiality }) });
      const data = await response.json();
      if (!response.ok) {
        if (!data.saved) {
          setMessages(current => current.filter(item => item.id !== optimistic.id));
          setContent(trimmed);
        }
        setError(data.error || "Fielded could not respond. Refresh to check whether your contribution was saved.");
        return;
      }
      setMessages((current) => [...current, { id: data.id, sender: "fielded", content: data.content, confidentiality }]);
    } catch (error) {
      setMessages(current => current.filter(item => item.id !== optimistic.id));
      setContent(trimmed);
      setError(error instanceof Error ? `${error.message}. Refresh to check whether your contribution was saved before sending again.` : "Connection interrupted. Refresh to check whether your contribution was saved.");
    } finally { setBusy(false); }
  }

  async function upload(file: File) {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const form = new FormData(); form.set("file", file); form.set("assignmentId", assignmentId); form.set("confidentiality", confidentiality);
      const response = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      if (!data.transcript) throw new Error("The file did not return readable content.");
      setContent((current) => [current, `File: ${file.name}\n${data.transcript}`].filter(Boolean).join("\n\n"));
      if (data.transcript.length + file.name.length + content.length + 10 > 8000) setError("The extracted text is longer than one message. Review it and send the relevant parts, up to 8,000 characters at a time.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "The file could not be uploaded.");
    }
    finally { setBusy(false); }
  }

  async function toggleRecording() {
    if (recording) { recorderRef.current?.stop(); return; }
    if (busy) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = async () => {
        if (recordingTimer.current) clearTimeout(recordingTimer.current);
        stream.getTracks().forEach((track) => track.stop()); setRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        await upload(new File([blob], `fielded-note-${Date.now()}.${blob.type.includes("mp4") ? "m4a" : "webm"}`, { type: blob.type }));
      };
      recorderRef.current = recorder; recorder.start(); setRecording(true);
      recordingTimer.current = setTimeout(() => { if (recorder.state !== "inactive") recorder.stop(); }, 120000);
    } catch { setError("Microphone access was not available. You can still upload an audio file."); }
  }

  async function completeConversation() {
    if (busy || recording || approved) return;
    if (content.trim()) { setError("You have an unsent contribution. Send it or clear it before preparing your summary."); return; }
    if (policyMode) { router.push(`/app/communications/respond/${assignmentId}`); return; }
    if (review) { setError("Your summary is already prepared below. Review it, or return to the conversation to add more detail."); return; }
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/conversations/${assignmentId}/complete`, { method: "POST", signal: AbortSignal.timeout(180000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your summary could not be prepared.");
      setReview(data);
      setApproved(false);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The request failed. Please try again.");
    } finally { setBusy(false); }
  }

  async function approveSummary() {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/conversations/${assignmentId}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviewId: review?.reviewId }), signal: AbortSignal.timeout(60000) });
      const data = await response.json();
      if (!response.ok || data.ok !== true) throw new Error(data.error || "Your approval could not be saved.");
      setApproved(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The request failed. Please try again.");
    } finally { setBusy(false); }
  }

  return <main className="conversation-page"><header className="conversation-top"><div><Link className="back-button" href="/app" aria-label="Back to dashboard"><ArrowLeft size={17} /></Link><div><h1>{missionTitle}</h1><p>Digital deployed engineer conversation</p></div></div><button className="button button-quiet" onClick={completeConversation} disabled={busy || approved || recording || (!policyMode && messages.filter(item => item.sender === "participant").length === 0)}>{policyMode ? "Check understanding" : "Finish and review"}</button></header>{error && <div className="form-message" role="alert">{error}</div>}<div className="conversation-layout"><section className="chat-shell">{review ? <div className="message-list"><div className="page-title"><h1>Your conversation summary</h1><p>Review what Fielded understood before anything contributes to organisational intelligence.</p></div><div className="aside-note"><h2>Summary</h2><p>{review.summary}</p></div><div className="panel"><div className="panel-head"><h2>Proposed observations</h2><span className="chip">{review.observations.length}</span></div><div className="row-list">{review.observations.map((item, index) => <div className="row-item" key={`${item.category}-${index}`}><div><h3>{item.summary}</h3><span className="chip">{item.category}</span><span className="chip">{item.sourceConfidentiality}</span></div></div>)}</div></div>{approved ? <div className="empty-auth"><Check size={22} /><p>Approved. Contributions marked PRIVATE remain private; other observations can now inform patterns according to your selected state.</p></div> : <div className="page-actions"><button className="button button-primary" onClick={approveSummary} disabled={busy}><Check size={16} />Approve summary</button><button className="button button-quiet" disabled={busy} onClick={() => setReview(null)}><X size={16} />Return to conversation</button></div>}</div> : <div className="message-list"><div className="message"><span className="message-avatar">F</span><div><div className="message-bubble">{policyMode ? `Let’s talk about ${missionTitle}. Have you already read this policy, or would you like a brief overview first? Afterwards, there are three quick questions to check understanding. You can ask questions or flag concerns along the way.` : "I would like to understand how work actually happens from your perspective. There are no right answers. What are you responsible for, and what has your attention today?"}</div><div className="message-meta">Fielded · private to this dialogue</div></div></div>{messages.map((message) => <div className={`message ${message.sender === "participant" ? "user" : ""}`} key={message.id}><span className="message-avatar">{message.sender === "participant" ? participantName.slice(0, 1) : "F"}</span><div><div className="message-bubble">{message.content}</div><div className="message-meta">{message.sender === "participant" ? message.confidentiality : "Fielded"}</div></div></div>)}{busy && <div className="message"><span className="message-avatar">F</span><div className="message-bubble"><LoaderCircle className="spin" size={16} /> Fielded is thinking...</div></div>}</div>} {!review && <div className="chat-composer">{policyMode ? <p className="muted">Private dialogue. Feedback for HR is submitted separately with your check.</p> : <div className="confidentiality-control" aria-label="Confidentiality"><button className={confidentiality === "PRIVATE" ? "active" : ""} onClick={() => setConfidentiality("PRIVATE")}>PRIVATE</button><button className={confidentiality === "CONTRIBUTE" ? "active" : ""} onClick={() => setConfidentiality("CONTRIBUTE")}>CONTRIBUTE</button><button className={confidentiality === "SHARE" ? "active" : ""} onClick={() => setConfidentiality("SHARE")}>SHARE</button></div>}<div className="composer-row"><textarea maxLength={8000} disabled={busy || recording} value={content} onChange={(event) => setContent(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Tell Fielded what is happening..." aria-label="Message Fielded" /><div className="composer-tools"><button className={`icon-button ${recording ? "primary" : ""}`} type="button" onClick={toggleRecording} disabled={busy} title={recording ? "Stop recording" : "Record voice note"}>{recording ? <Square size={16} /> : <Mic size={17} />}</button><button className="icon-button" type="button" onClick={() => fileRef.current?.click()} disabled={busy || recording} title="Upload a file"><FileUp size={17} /></button><button className="icon-button" type="button" onClick={() => cameraRef.current?.click()} disabled={busy || recording} title="Take a photo"><Camera size={17} /></button><button className="icon-button primary" type="button" onClick={() => sendMessage()} disabled={busy || recording || !content.trim() || content.length > 8000} title="Send"><Send size={16} /></button><input ref={fileRef} hidden type="file" accept=".pdf,.csv,.txt,image/jpeg,image/png,image/webp,image/gif,audio/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} /><input ref={cameraRef} hidden type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} /></div></div></div>}</section><aside className="conversation-aside"><div className="aside-note"><h2>Your confidentiality</h2>{policyMode ? <p>Your chat stays private. HR receives your submitted check, concern flag and any feedback you explicitly share on the check page.</p> : <div className="privacy-options"><div><i /><span><strong>PRIVATE</strong>Used only inside your conversation.</span></div><div><i /><span><strong>CONTRIBUTE</strong>Name and account ID omitted. Details may still identify you.</span></div><div><i /><span><strong>SHARE</strong>Can be attributed where useful.</span></div></div>}</div><div className="aside-note"><h2>Mission</h2><p>{missionObjective}</p></div></aside></div></main>;
}
