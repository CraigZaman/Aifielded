import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { activeModelId, extractAttachment, hasAIProvider } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const supportedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif", "audio/webm", "audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav", "audio/ogg", "audio/flac", "audio/aac", "text/plain", "text/csv"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const assignmentId = String(form.get("assignmentId") || "");
  const confidentiality = ["PRIVATE", "CONTRIBUTE", "SHARE"].includes(String(form.get("confidentiality"))) ? String(form.get("confidentiality")) : "PRIVATE";
  if (!(file instanceof File) || !file.size || file.size > 3 * 1024 * 1024) return NextResponse.json({ error: "Choose a non-empty file smaller than 3 MB." }, { status: 400 });
  const mediaType = file.type.split(";")[0].trim().toLowerCase();
  if (!supportedTypes.has(mediaType)) return NextResponse.json({ error: "Use a PDF, text, CSV, photo or audio file. Export Office documents and presentations as PDF first." }, { status: 415 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: assignment } = await supabase.from("mission_assignments").select("id,mission_id,organisation_id,status,missions(status)").eq("id", assignmentId).eq("user_id", auth.user.id).maybeSingle();
  if (!assignment) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  const mission = assignment.missions as unknown as { status: string } | null;
  if (!["invited", "in_progress"].includes(assignment.status) || mission?.status !== "active") return NextResponse.json({ error: "This assignment is closed. No file was uploaded." }, { status: 409 });
  if (!mediaType.startsWith("text/") && !hasAIProvider()) return NextResponse.json({ error: "File processing is not connected yet. Your file has not been uploaded." }, { status: 503 });
  const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
  const path = `${assignment.organisation_id}/${auth.user.id}/${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  let transcript: string;
  try {
    transcript = mediaType.startsWith("text/") ? new TextDecoder("utf-8", { fatal: true }).decode(bytes) : await extractAttachment({ bytes: new Uint8Array(bytes), mediaType, filename: file.name });
    if (!transcript.trim()) throw new Error("Empty extraction");
  } catch {
    return NextResponse.json({ error: "Fielded could not read this file. Try a clearer photo, shorter recording or text-based PDF. No file was saved." }, { status: 503 });
  }
  const uploaded = await supabase.storage.from("evidence").upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false });
  if (uploaded.error) return NextResponse.json({ error: uploaded.error.message }, { status: 400 });
  // Raw uploads remain private; only reviewed conversation observations may be approved.
  const saved = await supabase.from("source_records").insert({ organisation_id: assignment.organisation_id, mission_id: assignment.mission_id, user_id: auth.user.id, source_type: mediaType.startsWith("audio/") ? "audio" : mediaType.startsWith("image/") ? "image" : "file", title: file.name, storage_path: path, mime_type: mediaType, confidentiality: "PRIVATE", metadata: { size: file.size, transcript, assignment_id: assignment.id, requested_confidentiality: confidentiality, processing_status: "ready_for_review", model: mediaType.startsWith("text/") ? null : activeModelId() } });
  if (saved.error) {
    const cleanup = await supabase.storage.from("evidence").remove([path]);
    if (cleanup.error) console.error("Evidence upload cleanup failed", { code: cleanup.error.name });
    return NextResponse.json({ error: "Your file could not be saved to the conversation. Please try again." }, { status: 503 });
  }
  return NextResponse.json({ ok: true, transcript });
}
