/* A shared conversation surface. Media stays local; model replies are demo adapters. */
const engineThreads = new Map();
let engineCapture = null;
const engineProfiles = {
  individual: {
    name: "Priya", label: "Your personal workspace", theme: "personal", model: "Your work picture",
    opening: "Before we get into the day, how are things going? We can work through the Atlas proposal, a task that's getting stuck, or something you'd like to do differently.",
    prompts: ["Let's plan my day", "I'm repeating the same work", "I'd like to build my skills"],
    focus: [["Today", "Atlas proposal", "Separate costs and confirm the assumptions."], ["Worth a look", "Your weekly update", "The report and steering deck repeat each other."], ["Looking ahead", "Commercial storytelling", "A useful skill to practise on this proposal."]],
    sources: [["FileText", "Atlas proposal v3", "Document"], ["Presentation", "Steering committee update", "Presentation"], ["AudioLines", "Atlas discovery call", "Call transcript"]],
    destination: "today", destinationLabel: "Open my day", contributionLabel: "Add to my work picture"
  },
  sme: {
    name: "Sam", label: "Lumen Studio · 12 people", theme: "team", model: "Your team's work picture",
    opening: "How's the studio doing this morning? Atlas has a scope decision to make, and Cedar is ready for review. Tell me what's actually happening on your side.",
    prompts: ["Let's talk about the Atlas handover", "Something's blocking the team", "Review this week's priorities"],
    focus: [["Needs a decision", "Atlas scope", "Confirm whether analytics belongs in phase one."], ["In progress", "Cedar concepts", "Bring the review comments into one place."], ["Small improvement", "A better kickoff", "Clear scope, one owner and an agreed next step."]],
    sources: [["MessageCircle", "Delivery team conversation", "Shared Slack channel"], ["ClipboardList", "Atlas delivery board", "Shared task board"], ["AudioLines", "Atlas client call", "Approved transcript"]],
    destination: "work", destinationLabel: "Open team work", contributionLabel: "Review for the team picture"
  },
  manager: {
    name: "Harriet", label: "Acme Engineering · Leadership", theme: "leadership", model: "Acme's evolving picture",
    opening: "What's on your mind about Acme today? We're hearing different accounts of the approval process. Your perspective can help us decide what to investigate next.",
    prompts: ["Talk through the approval bottleneck", "I have a board presentation", "What are employees telling us?"],
    focus: [["Emerging pattern", "Approval handovers", "Queue time and missing information both matter."], ["From the floor", "Clearer reporting routes", "Anonymised contributions raise a policy question."], ["Next decision", "Test the cause", "Validate the handover before changing capacity."]],
    sources: [["Users", "38 approved perspectives", "Across five departments"], ["AudioLines", "Finance review", "Shared meeting extract"], ["ClipboardList", "Project Margin Review", "Active mission"]],
    destination: "live-overview", destinationLabel: "Open Fielded Live Overview", contributionLabel: "Review for Acme's picture"
  },
  participant: {
    name: "Priya", label: "Acme Engineering · Your employee workspace", theme: "personal", model: "Your work at Acme",
    opening: "Good morning, Priya. You have two follow-ups from Acme and one active Fielded interview. We can work through an assigned action, clarify a policy update or talk about what is happening in the work.",
    prompts: ["Talk through my reporting-route follow-up", "Something in the safety action is unclear", "Continue the Project Margin Review"],
    focus: [["For you", "A clearer approval request", "Scope, cost, risk and the decision you need."], ["In progress", "Project Margin Review", "Your experience helps explain the wider pattern."], ["Company update", "Speaking up", "Questions about policy can become useful feedback."]],
    sources: [["ClipboardList", "Project Margin Review", "Your active mission"], ["ShieldCheck", "Speaking Up policy", "Company update"], ["Presentation", "Weekly delivery update", "Your chosen context"]],
    destination: "employee-tasks", destinationLabel: "View my follow-ups", contributionLabel: "Review my observation"
  },
  hr: {
    name: "Aisha", label: "Acme Engineering · People & safety", theme: "people", model: "The people & policy picture",
    opening: "How are people responding to the new policy? Bring a memo, a presentation or a question you've heard. We can work out what needs explaining and what HR needs to hear back.",
    prompts: ["People aren't sure where to report", "I'd like to discuss the new memo", "What should we clarify next?"],
    focus: [["Listen", "Reporting-route questions", "Clarity matters as much as distribution."], ["Explain", "Speaking Up policy", "A conversation can reveal misunderstanding."], ["Follow through", "Close the feedback loop", "Let people know what changed after they spoke."]],
    sources: [["FileText", "Speaking Up policy v3.2", "Approved policy"], ["Users", "Anonymised employee questions", "Approved contributions"], ["ClipboardList", "Policy action log", "HR review"]],
    destination: "hr-overview", destinationLabel: "Open people overview", contributionLabel: "Review for policy intelligence"
  },
  consulting: {
    name: "Lydia", label: "Avery & Stone · Client fieldwork", theme: "advisory", model: "Your engagement picture",
    opening: "What would you like to learn about the client today? Bring a founder-call transcript, a deck or an observation. We'll turn it into better questions for the people doing the work.",
    prompts: ["Talk through the Redwood founder call", "What should we ask employees?", "I have a due diligence policy"],
    focus: [["Client context", "Redwood Fabrication", "Changes reach production before approval."], ["Fieldwork", "Ask the people closest to it", "Collect the experience behind a management claim."], ["Due diligence", "From policy to evidence", "Owners, questions and controlled disclosure."]],
    sources: [["AudioLines", "Redwood founder conversation", "Demo transcript"], ["BriefcaseBusiness", "Four client engagements", "Consulting portfolio"], ["ShieldCheck", "Supplier assurance requirements", "Due diligence scope"]],
    destination: "consulting", destinationLabel: "Open consulting portfolio", contributionLabel: "Review for the engagement"
  },
  diligence: {
    name: "Lydia", label: "Redwood Fabrication · Supplier assurance", theme: "advisory", model: "The evidence collection picture",
    opening: "Let's start with what the requesting company needs to know. Which policy or control should we work through? We can identify the right owner and the evidence to ask for.",
    prompts: ["Start with access controls", "Discuss the data retention policy", "What evidence is still missing?"],
    focus: [["Scope", "Supplier assurance", "Collect policy and control evidence only."], ["Owners", "Security, privacy and leadership", "Ask specific people, not everyone."], ["Before disclosure", "Review the evidence", "A statement is not a verified control."]],
    sources: [["ShieldCheck", "Buyer requirements", "Supplied policy"], ["Users", "Company evidence owners", "Collection plan"], ["FileText", "Reviewed responses", "Evidence room"]],
    destination: "dd-policy", destinationLabel: "Open policy & collection plan", contributionLabel: "Review collection note"
  }
};

function engineThread(key) {
  if (!engineThreads.has(key)) engineThreads.set(key, { draft: "", files: [], messages: [], scope: "PRIVATE", review: null, observations: [], notice: "", referenceDraft: null });
  return engineThreads.get(key);
}
function engineIcon(name) {
  const nodes = fieldedIconNodes[name] || fieldedIconNodes.FileText;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${nodes.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([key, value]) => `${key}="${xEscape(value)}"`).join(" ")}></${tag}>`).join("")}</svg>`;
}
function engineTool(name, label, action, key) {
  return `<button type="button" class="d-tool" aria-label="${label}" data-media="${action}" data-engine-key="${key}">${engineIcon(name)}<span class="d-tooltip" role="tooltip">${label}</span></button>`;
}
function engineMediaControls(key) {
  return `<div class="d-media-tools" role="group" aria-label="Add to the conversation">${engineTool("Mic", "Record a voice note", "voice", key)}${engineTool("Paperclip", "Attach files", "file", key)}${engineTool("Presentation", "Add a presentation", "presentation", key)}${engineTool("Camera", "Add a photo or use camera", "camera", key)}<input hidden type="file" multiple data-engine-upload="${key}" accept=".txt,.md,.csv,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.ppt,.pptx"><input hidden type="file" multiple data-engine-deck="${key}" accept=".ppt,.pptx,.pdf,.key"><input hidden type="file" data-engine-photo="${key}" accept="image/png,image/jpeg,image/webp" capture="environment"></div>`;
}
function engineFileCard(file, key, removable = false) {
  const icon = file.kind === "image" ? "Image" : file.kind === "audio" ? "AudioLines" : file.kind === "presentation" ? "Presentation" : "FileText";
  return `<div class="d-file"><button type="button" class="d-file-preview" data-engine-preview="${file.id}" data-engine-key="${key}">${file.kind === "image" && file.url ? `<img src="${file.url}" alt="">` : engineIcon(icon)}<span><strong>${xEscape(file.name)}</strong><small>${file.sample ? "Fictional sample transcript" : `${file.size < 1024 ? file.size + " B" : Math.round(file.size / 1024) + " KB"} · Kept in this browser`}</small></span></button>${removable ? `<button type="button" class="d-remove" data-engine-remove="${file.id}" data-engine-key="${key}" aria-label="Remove ${xEscape(file.name)}">${engineIcon("X")}</button>` : ""}</div>`;
}
function engineMediaTray(key) { return `<div class="d-files" data-engine-tray="${key}">${engineThread(key).files.map(file => engineFileCard(file, key, true)).join("")}</div>`; }
function engineDraft(key, fallback = "") { return engineThread(key).draft || fallback; }
function engineView(key) {
  const profile = engineProfiles[key];
  const thread = engineThread(key);
  const workPicture = key === "participant" ? enterpriseParticipantSidebar(thread) : `<aside class="d-work-picture"><div class="d-picture-title"><span class="d-notebook-label">IN FOCUS</span><h2>${profile.model}</h2><p>Built from the work.<br>Made clearer through conversation.</p></div><div class="d-focus-items">${profile.focus.map(([label, title, detail], index) => `<div><span class="d-focus-number">0${index + 1}</span><div><small>${label}</small><h3>${title}</h3><p>${detail}</p></div></div>`).join("")}</div><div class="d-context-sources"><h3>Context on the table</h3>${profile.sources.map(([icon, title, type]) => `<div>${engineIcon(icon)}<span><strong>${title}</strong><small>${type}</small></span></div>`).join("")}</div><div class="d-picture-footer"><strong>${thread.observations.length ? `${thread.observations.length} reviewed ${thread.observations.length === 1 ? "note" : "notes"} added` : "Your perspective is the missing piece."}</strong><p>${thread.observations.length ? "Open your work view to see the approved context. Private notes stay in this conversation's personal picture." : "What actually happened? What's getting in the way? What might make it easier?"}</p></div>${thread.observations.map(note => `<article class="d-approved-note"><span>${engineIcon("CircleCheck")}${note.scope}</span><p>${xEscape(note.text)}</p></article>`).join("")}</aside>`;
  return `<section class="d-stage ${profile.theme}" data-engine-stage="${key}">
    <header class="d-welcome"><div><div class="d-kicker"><span class="d-status-dot"></span>Your digital deployed engineer<span class="d-context-label">${profile.label}</span></div><h1>Good morning, ${profile.name}.<span>Want to have a quick chat?</span></h1></div><button class="d-open-work" data-engine-destination="${profile.destination}" data-engine-key="${key}">${profile.destinationLabel}${engineIcon("ArrowUpRight")}</button></header>
    <div class="d-workbench"><div class="d-conversation"><div class="d-conversation-label"><span>${engineIcon("MessageCircle")}Today's conversation</span><small>Friday, 4 September</small></div>
      <div class="d-messages" role="log" aria-label="Conversation with your Fielded engineer" aria-live="polite"><article class="d-message assistant"><div class="d-message-byline"><img src="/assets/fielded-logo.png" alt="Fielded.ai"><span>Your engineer</span></div><p>${profile.opening}</p></article>${thread.messages.map(message => `<article class="d-message ${message.role}"><div class="d-message-byline"><strong>${message.role === "user" ? profile.name : "Fielded"}</strong><span>${message.role === "user" ? "Your perspective" : "Following the conversation"}</span></div>${message.text ? `<p>${xEscape(message.text)}</p>` : ""}${message.files?.length ? `<div class="d-message-files">${message.files.map(file => engineFileCard(file, key)).join("")}</div>` : ""}</article>`).join("")}</div>
      ${thread.messages.length ? "" : `<div class="d-starters">${profile.prompts.map(prompt => `<button data-engine-prompt="${xEscape(prompt)}" data-engine-key="${key}">${prompt}${engineIcon("ArrowUpRight")}</button>`).join("")}</div>`}
      <form class="d-composer" data-engine-form="${key}"><label class="d-sr-only" for="engine-message-${key}">Message your Fielded engineer</label><textarea id="engine-message-${key}" data-engine-draft="${key}" maxlength="4000" rows="3" placeholder="Tell me what's happening, or bring something we can look at together...">${xEscape(thread.draft)}</textarea>${engineMediaTray(key)}<div class="d-composer-bottom">${engineMediaControls(key)}<span class="d-composer-hint">A conversation, in your own way.</span><button class="d-send" type="submit" aria-label="Send message">${engineIcon("ArrowUp")}</button></div></form>
      <div class="d-composer-foot"><span>${engineIcon("LockKeyhole")}Private until you review it</span><small>Demo replies · Attachments are local, not AI-analysed</small></div><p class="d-notice" role="status">${xEscape(thread.notice)}</p>
      ${thread.review ? engineReview(key) : ""}
    </div>${workPicture}</div>
  </section>`;
}
function engineReview(key) {
  const t = engineThread(key);
  return `<section class="d-review"><div class="d-review-head">${engineIcon("ClipboardList")}What should we take from this?</div><label for="engine-note-${key}">Your note, in your words</label><textarea id="engine-note-${key}" data-engine-note="${key}" rows="3" maxlength="4000">${xEscape(t.review)}</textarea><div class="d-review-actions"><label>Use this note<select data-engine-scope="${key}"><option value="PRIVATE" ${t.scope === "PRIVATE" ? "selected" : ""}>PRIVATE · Only for me</option><option value="CONTRIBUTE" ${t.scope === "CONTRIBUTE" ? "selected" : ""}>CONTRIBUTE · Anonymised insight</option><option value="SHARE" ${t.scope === "SHARE" ? "selected" : ""}>SHARE · With my name</option></select></label><button data-engine-approve="${key}" class="d-primary">${engineIcon("CircleCheck")}Approve note</button></div><small>Only this edited note is added. Original files, voice notes and the rest of this conversation are not shared.</small></section>`;
}
function engineContributionFeed(key, title = "From your Fielded conversations") {
  const notes = engineThread(key).observations;
  if (!notes.length) return "";
  return `<section class="d-contribution-feed"><h2>${title}</h2>${notes.filter(note => key === "individual" || note.scope !== "PRIVATE").map(note => `<article><span>${engineIcon("MessageCircle")}${note.scope}</span><p>${xEscape(note.text)}</p><small>Approved participant statement · Not independently verified</small></article>`).join("")}${notes.every(note => note.scope === "PRIVATE") && key !== "individual" ? '<p>Your private notes are retained in My Fielded, not in this shared view.</p>' : ""}</section>`;
}
function engineRespond(key, text, files) {
  if (files.length) {
    const hasText = files.some(file => file.text);
    return `${files.length === 1 ? "That item is" : "Those items are"} now part of this conversation. ${hasText ? "You can open the text preview to check the source." : "I haven't analysed the file contents in this demo."} What should we pay attention to: a decision, a repeated step, or something that's getting in the way?`;
  }
  if (key === "participant") {
    if (/anonymous|reporting route|whistle|policy/i.test(text)) return "The independent reporting route sits outside your management line. HR can see whether you complete the assigned clarification, but not what you say in this conversation. Which part needs to feel clearer before you can close the follow-up?";
    if (/safety|contractor|permit|isolation/i.test(text)) return "Let's test the action against a real handover. Who names the permit owner, who confirms the isolation point, and where could that responsibility still be ambiguous?";
    if (/margin|approval|project/i.test(text)) return "We can continue the Project Margin Review here. Walk me through the latest approval that slowed delivery, including what was missing and who had to make the decision.";
    return "Let's stay with the work in front of you. Is this about an assigned follow-up, an operational blocker, or something Acme should understand from your experience?";
  }
  if (key === "individual") {
    if (/repeat|report|update|same work/i.test(text)) return "Let's make that concrete. Where does the information start, and where do you have to copy it again? A document or a picture of the steps would help us work through it.";
    if (/plan|day|priorit/i.test(text)) return "Let's start with what needs a decision today. The Atlas proposal has two open assumptions. What do you need from someone else before you can move it forward?";
    return fieldedDemoAI.reply("personal", text);
  }
  if (key === "sme") return fieldedDemoAI.reply("team", text);
  if (key === "manager") return /employee|people/i.test(text) ? "The approved contributions point to unclear handovers and reporting routes. They don't establish individual blame. Where does that match what you're seeing, and where does it surprise you?" : "Operations describes waiting; Finance describes missing information. Both may be true. Can you walk me through a recent approval, from the first request to the final decision?";
  if (key === "hr") return "Let's separate what the policy says from what people understand. What exact question have you heard? Keep identifying details out; we can use the question to draft a clearer explanation.";
  if (key === "diligence" || /diligence|policy|security|retention/i.test(text)) return "Let's identify the requirement, the person who owns it, and the evidence that would support their answer. A policy describes an intention; a dated review or control record helps us test the practice. Which requirement should we collect first?";
  return "The Redwood founder describes work reaching production before commercial approval. That's a management account, not yet a complete finding. Who sees the handover first, and what should we ask them to understand the gap?";
}
function engineSend(key, prompt) {
  const t = engineThread(key);
  const text = (prompt ?? t.draft).trim();
  if (!text && !t.files.length) { t.notice = "Add a message or an attachment to begin."; render(); return; }
  const files = t.files.splice(0);
  t.messages.push({ role: "user", text, files }, { role: "assistant", text: engineRespond(key, text, files) });
  t.review = text || files.find(file => file.sample)?.text || "";
  t.draft = "";
  t.notice = "";
  render();
  const log = document.querySelector(`[data-engine-stage="${key}"] .d-messages`);
  if (log) log.scrollTop = log.scrollHeight;
  document.getElementById(`engine-message-${key}`)?.focus({ preventScroll: true });
}
function engineApprove(key) {
  const t = engineThread(key);
  const text = document.querySelector(`[data-engine-note="${key}"]`).value.trim();
  if (!text) { t.notice = "Add a note before approving it."; render(); return; }
  t.observations.push({ text, scope: t.scope, createdAt: new Date().toISOString() });
  t.review = null;
  t.notice = t.scope === "PRIVATE" ? "Added to your private work picture. Nothing has been shared." : "Your approved note now contributes to this demo's shared picture. Original attachments remain private.";
  if (key === "individual") personalSources.unshift({ channel: "Fielded conversation", mark: "F", color: "green", time: "Just now", title: text.slice(0, 90), detail: text, scope: "PRIVATE", type: "Dialogue" });
  if (["manager", "participant", "hr"].includes(key) && t.scope !== "PRIVATE") liveEvents.unshift({ channel: "Fielded conversation", mark: "F", color: "green", time: "Just now", title: text.slice(0, 90), detail: text, scope: t.scope, type: key === "hr" ? "People" : "Process" });
  if (key === "participant") enterpriseAddSharedFeedback(text, t.scope);
  render();
}

function engineSyncExternal(key) {
  const t = engineThread(key);
  if (key === "mission") t.draft = document.getElementById("messageInput")?.value || t.draft;
  if (key.startsWith("coach-")) t.draft = document.querySelector(`[data-coach="${key.slice(6)}"] input`)?.value || "";
  if (key.startsWith("dd-")) {
    t.draft = document.querySelector('#dd-response [name="answer"]')?.value || "";
    t.referenceDraft = document.querySelector('#dd-response [name="evidence"]')?.value || "";
  }
}
async function engineAddFiles(key, files, mode) {
  engineSyncExternal(key);
  const t = engineThread(key);
  const errors = [];
  for (const file of files) {
    if (t.files.length >= 5) { errors.push("Up to five attachments per message."); break; }
    if (file.size > 10 * 1024 * 1024) { errors.push(`${file.name} exceeds 10 MB.`); continue; }
    const image = /image\/(png|jpeg|webp)/.test(file.type);
    if (mode === "photo" && !image) { errors.push("Choose a PNG, JPEG or WebP photo."); continue; }
    if (mode === "presentation" && !/\.(pptx?|pdf|key)$/i.test(file.name)) { errors.push("Choose a PowerPoint, PDF or Keynote presentation."); continue; }
    const kind = image ? "image" : /^audio\//.test(file.type) ? "audio" : mode === "presentation" || /\.(pptx?|key)$/i.test(file.name) ? "presentation" : "file";
    let text = "";
    if (/\.(txt|md|csv)$/i.test(file.name) && file.size <= 100000) {
      try { text = (await file.text()).slice(0, 10000); } catch { errors.push(`The text preview for ${file.name} could not be read.`); }
    }
    t.files.push({ id: crypto.randomUUID(), name: file.name, size: file.size, kind, text, url: URL.createObjectURL(file), type: file.type });
  }
  t.notice = errors.join(" ") || "Attachment ready. Add context, then send when you're ready.";
  render();
}
function engineTakeAttachments(key) {
  const t = engineThread(key);
  t.draft = "";
  t.referenceDraft = null;
  return t.files.splice(0);
}
function engineResetThread(key) {
  const t = engineThreads.get(key);
  if (!t) return;
  [...t.files, ...t.messages.flatMap(message => message.files || [])].forEach(file => { if (file.url) URL.revokeObjectURL(file.url); });
  engineThreads.delete(key);
}
function engineDiligenceAttachmentReferences(key) {
  return engineTakeAttachments(key).map(file => {
    if (file.url) URL.revokeObjectURL(file.url);
    return { name: file.name, kind: file.kind, size: file.size };
  });
}
function engineFindFile(key, id) {
  const t = engineThread(key);
  const coachMessages = key === "coach-personal" ? experienceState.coach : key === "coach-team" ? experienceState.teamCoach : [];
  return [...t.files, ...t.messages.flatMap(message => message.files || []), ...coachMessages.flatMap(message => message.files || []), ...(key === "mission" ? state.dialogueMessages.flatMap(message => message.attachments || []) : [])].find(file => file.id === id);
}
function engineShowDialog(title, contents) {
  engineCloseDialog();
  const dialog = document.createElement("dialog");
  dialog.className = "d-modal";
  dialog.innerHTML = `<header><h2>${xEscape(title)}</h2><button class="d-tool" aria-label="Close dialog" data-close-engine>${engineIcon("X")}</button></header><div class="d-modal-body">${contents}</div>`;
  document.body.append(dialog);
  dialog.querySelector("[data-close-engine]").addEventListener("click", engineCloseDialog);
  dialog.addEventListener("cancel", event => { event.preventDefault(); engineCloseDialog(); });
  dialog.showModal();
  return dialog;
}
function engineCloseDialog() {
  if (engineCapture) {
    const capture = engineCapture;
    engineCapture = null;
    capture.cancelled = true;
    if (capture.recorder?.state === "recording") capture.recorder.stop();
    capture.stream?.getTracks().forEach(track => track.stop());
    clearTimeout(capture.timer);
  }
  document.querySelectorAll(".d-modal").forEach(dialog => { dialog.close(); dialog.remove(); });
}
function enginePreviewFile(key, id) {
  const file = engineFindFile(key, id);
  if (!file) return;
  let contents = file.kind === "image" ? `<img class="d-preview-image" src="${file.url}" alt="${xEscape(file.name)}">` : file.kind === "audio" && file.url ? `<audio controls src="${file.url}"></audio><p>Recorded locally. Automatic transcription is not connected in this demo.</p>` : file.text ? `<pre class="d-text-preview">${xEscape(file.text)}</pre>` : `<div class="d-document-preview">${engineIcon(file.kind === "presentation" ? "Presentation" : "FileText")}<strong>${xEscape(file.name)}</strong><p>Attached locally. The contents have not been analysed.</p></div>`;
  if (file.url) contents += `<a class="d-primary d-download" href="${file.url}" download="${xEscape(file.name)}">${engineIcon("Download")}Download attachment</a>`;
  engineShowDialog(file.name, contents);
}
function engineVoiceDialog(key) {
  engineSyncExternal(key);
  const dialog = engineShowDialog("A voice note for Fielded", `<div class="d-capture-visual">${engineIcon("Mic")}<strong>Say it in your own words.</strong></div><p>Record a short voice note in this browser. Audio is not uploaded or transcribed.</p><div class="d-capture-actions"><button class="d-primary" data-record-voice>Start recording</button><button class="btn secondary" data-sample-voice>Use sample voice transcript</button></div><p class="d-capture-status" role="status"></p>`);
  dialog.querySelector("[data-sample-voice]").addEventListener("click", () => {
    const t = engineThread(key);
    if (t.files.length >= 5) { dialog.querySelector(".d-capture-status").textContent = "Remove an attachment first; the limit is five."; return; }
    t.files.push({ id: crypto.randomUUID(), name: "Morning check-in · sample voice transcript", size: 0, kind: "audio", sample: true, text: "I spend time copying the same project update into a report and a presentation. I'd like one place for the decisions, owners and dates." });
    t.notice = "Fictional sample transcript attached. No microphone was used.";
    engineCloseDialog(); render();
  });
  dialog.querySelector("[data-record-voice]").addEventListener("click", async event => {
    const button = event.currentTarget;
    if (engineCapture?.recorder?.state === "recording") { button.disabled = true; engineCapture.recorder.stop(); return; }
    button.disabled = true;
    const capture = { cancelled: false, stream: null, timer: null };
    engineCapture = capture;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (capture.cancelled) { stream.getTracks().forEach(track => track.stop()); return; }
      capture.stream = stream;
      const recorder = new MediaRecorder(stream);
      capture.recorder = recorder;
      const chunks = [];
      recorder.addEventListener("dataavailable", event => { if (event.data.size) chunks.push(event.data); });
      recorder.addEventListener("stop", async () => {
        stream.getTracks().forEach(track => track.stop());
        clearTimeout(capture.timer);
        if (capture.cancelled) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        engineCapture = null;
        engineCloseDialog();
        if (!blob.size) { engineThread(key).notice = "No audio was captured. Try again or use a sample transcript."; render(); return; }
        await engineAddFiles(key, [new File([blob], `Voice note.${blob.type.includes("mp4") ? "m4a" : "webm"}`, { type: blob.type })], "audio");
      });
      recorder.start();
      button.disabled = false; button.textContent = "Stop & attach";
      dialog.querySelector("[data-sample-voice]").disabled = true;
      dialog.querySelector(".d-capture-status").textContent = "Recording. Stops automatically after 60 seconds.";
      capture.timer = setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 60000);
    } catch {
      capture.stream?.getTracks().forEach(track => track.stop());
      engineCapture = null;
      if (capture.cancelled) return;
      button.disabled = false;
      dialog.querySelector(".d-capture-status").textContent = "Microphone unavailable or permission declined. You can type your message or use the sample transcript.";
    }
  });
}
function engineCameraDialog(key) {
  engineSyncExternal(key);
  const dialog = engineShowDialog("Show Fielded what you mean", `<div class="d-camera-preview"><video autoplay playsinline muted aria-label="Camera preview"></video><div class="d-camera-placeholder">${engineIcon("Camera")}<strong>A whiteboard. A process. The work in front of you.</strong></div></div><p>Photos stay in this browser. They are not uploaded or analysed.</p><div class="d-capture-actions"><button class="d-primary" data-start-camera>Use camera</button><button class="btn secondary" data-choose-photo>Choose a photo</button><button class="d-primary" data-take-photo hidden>Capture photo</button></div><p class="d-capture-status" role="status"></p>`);
  dialog.querySelector("[data-choose-photo]").addEventListener("click", () => { engineCloseDialog(); document.querySelector(`[data-engine-photo="${key}"]`).click(); });
  dialog.querySelector("[data-start-camera]").addEventListener("click", async event => {
    const button = event.currentTarget; button.disabled = true;
    const capture = { cancelled: false, stream: null }; engineCapture = capture;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (capture.cancelled) { stream.getTracks().forEach(track => track.stop()); return; }
      capture.stream = stream;
      const video = dialog.querySelector("video"); video.srcObject = stream; await video.play();
      if (capture.cancelled) return;
      dialog.querySelector(".d-camera-placeholder").hidden = true;
      button.hidden = true; dialog.querySelector("[data-take-photo]").hidden = false;
      dialog.querySelector(".d-capture-status").textContent = "Camera is on. Capture a photo or close this window to turn it off.";
    } catch {
      capture.stream?.getTracks().forEach(track => track.stop()); engineCapture = null;
      if (capture.cancelled) return;
      button.disabled = false; dialog.querySelector(".d-capture-status").textContent = "Camera unavailable or permission declined. Choose an existing photo instead.";
    }
  });
  dialog.querySelector("[data-take-photo]").addEventListener("click", () => {
    const video = dialog.querySelector("video");
    if (!video.videoWidth) { dialog.querySelector(".d-capture-status").textContent = "The camera is still starting. Please try again."; return; }
    const canvas = document.createElement("canvas"); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(async blob => { if (!blob) return; engineCloseDialog(); await engineAddFiles(key, [new File([blob], "Camera capture.jpg", { type: "image/jpeg" })], "photo"); }, "image/jpeg", .88);
  });
}
function engineNavigate(key, destination) {
  if (key === "individual") experienceState.personalTab = destination;
  else if (key === "sme") experienceState.teamTab = destination;
  else if (destination === "employee-tasks") { document.getElementById("employee-work")?.scrollIntoView({ behavior: "smooth" }); return; }
  else if (destination === "dd-policy") { document.getElementById("diligence-work")?.scrollIntoView({ behavior: "smooth" }); return; }
  else {
    if (key === "consulting") { state.role = "consultant"; state.user = seed.users.find(user => user.role === "consultant"); }
    state.route = destination;
  }
  render(); window.scrollTo(0, 0);
}
function bindEngineEvents() {
  document.querySelectorAll("[data-engine-draft]").forEach(input => input.addEventListener("input", () => { engineThread(input.dataset.engineDraft).draft = input.value; }));
  document.querySelectorAll("[data-engine-form]").forEach(form => form.addEventListener("submit", event => { event.preventDefault(); engineSend(form.dataset.engineForm); }));
  document.querySelectorAll("[data-engine-prompt]").forEach(button => button.addEventListener("click", () => engineSend(button.dataset.engineKey, button.dataset.enginePrompt)));
  document.querySelectorAll("[data-engine-scope]").forEach(select => select.addEventListener("change", () => { engineThread(select.dataset.engineScope).scope = select.value; }));
  document.querySelectorAll("[data-engine-note]").forEach(input => input.addEventListener("input", () => { engineThread(input.dataset.engineNote).review = input.value; }));
  document.querySelectorAll("[data-engine-approve]").forEach(button => button.addEventListener("click", () => engineApprove(button.dataset.engineApprove)));
  document.querySelectorAll("[data-engine-destination]").forEach(button => button.addEventListener("click", () => engineNavigate(button.dataset.engineKey, button.dataset.engineDestination)));
  document.querySelectorAll("[data-media]").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.engineKey; engineSyncExternal(key);
    if (button.dataset.media === "voice") engineVoiceDialog(key);
    if (button.dataset.media === "camera") engineCameraDialog(key);
    if (button.dataset.media === "file") document.querySelector(`[data-engine-upload="${key}"]`).click();
    if (button.dataset.media === "presentation") document.querySelector(`[data-engine-deck="${key}"]`).click();
  }));
  document.querySelectorAll("[data-engine-upload], [data-engine-deck], [data-engine-photo]").forEach(input => input.addEventListener("change", () => {
    const key = input.dataset.engineUpload || input.dataset.engineDeck || input.dataset.enginePhoto;
    engineAddFiles(key, [...input.files], input.dataset.engineDeck ? "presentation" : input.dataset.enginePhoto ? "photo" : "file");
  }));
  document.querySelectorAll("[data-engine-remove]").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.engineKey; engineSyncExternal(key); const t = engineThread(key); const file = t.files.find(file => file.id === button.dataset.engineRemove);
    if (file?.url) URL.revokeObjectURL(file.url); t.files = t.files.filter(file => file.id !== button.dataset.engineRemove); render();
  }));
  document.querySelectorAll("[data-engine-preview]").forEach(button => button.addEventListener("click", () => enginePreviewFile(button.dataset.engineKey, button.dataset.enginePreview)));
}
window.addEventListener("pagehide", engineCloseDialog);
startApp();
