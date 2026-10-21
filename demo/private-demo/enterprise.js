const ENTERPRISE_STORAGE_KEY = "fielded.enterprise.acme.v2";

const enterpriseSeed = {
  version: 2,
  tasks: [
    {
      id: "followup-reporting-route",
      title: "Review the independent reporting route",
      kind: "Policy follow-up",
      description: "Aisha has sent a short clarification after employees asked who can see a report and how to bypass their management line.",
      source: "Speaking Up & Whistleblowing Policy · v3.2",
      assignedBy: "Aisha Rahman",
      assignedRole: "People & Safety Director",
      assignee: "Priya Nair",
      due: "Today, 16:00",
      dueSort: "2026-09-04T16:00:00+01:00",
      status: "ready",
      required: true,
      instructions: [
        "Read the clarification on independent and anonymous reporting routes.",
        "Use the Fielded conversation if any part is unclear.",
        "Confirm completion when you know where you could report a concern."
      ],
      policy: "You may raise a concern with People & Culture, the Board's designated independent contact or Acme's anonymous reporting channel. You do not have to raise it with your line manager. Access to a report is restricted to those who need to assess or investigate it.",
      clarification: "",
      hrReply: ""
    },
    {
      id: "followup-contractor-handover",
      title: "Confirm the contractor handover step",
      kind: "Safety action",
      description: "Check that the next contractor maintenance handover includes the revised permit-to-work and isolation check.",
      source: "Workshop Health & Safety Update · v1.4",
      assignedBy: "Marcus Webb",
      assignedRole: "Head of Safety",
      assignee: "Priya Nair",
      due: "Monday, 7 Sep",
      dueSort: "2026-09-07T17:00:00+01:00",
      status: "in_progress",
      required: true,
      instructions: [
        "Use the revised handover checklist for contractor maintenance.",
        "Confirm the permit owner and isolation point before work begins.",
        "Record any unclear ownership through your Fielded conversation."
      ],
      policy: "The revised permit-to-work threshold includes contractor maintenance and all isolation work. The named permit owner must confirm the isolation point before the handover is complete.",
      clarification: "",
      hrReply: ""
    },
    {
      id: "followup-hybrid-acknowledgement",
      title: "Acknowledge your team working agreement",
      kind: "People update",
      description: "Review the agreed collaboration hours for the Operations team.",
      source: "Hybrid Working Principles · v2.0",
      assignedBy: "Aisha Rahman",
      assignedRole: "People & Safety Director",
      assignee: "Priya Nair",
      due: "Completed 28 Aug",
      dueSort: "2026-08-28T17:00:00+01:00",
      status: "completed",
      required: false,
      instructions: ["Review the Operations team agreement.", "Confirm acknowledgement."],
      policy: "Operations has agreed core collaboration hours of 10:00-15:00, with flexibility around role and customer needs.",
      clarification: "",
      hrReply: "",
      completedAt: "2026-08-28T14:20:00+01:00"
    }
  ],
  sharedFeedback: [],
  activity: [
    { id: "activity-1", text: "Priya opened the contractor handover action", time: "Yesterday, 15:42" },
    { id: "activity-2", text: "Priya completed the team working agreement", time: "28 Aug, 14:20" }
  ]
};

function enterpriseClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadEnterpriseState() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ENTERPRISE_STORAGE_KEY));
    if (parsed?.version === enterpriseSeed.version && Array.isArray(parsed.tasks)) return parsed;
  } catch {}
  return enterpriseClone(enterpriseSeed);
}

const enterpriseState = loadEnterpriseState();

function saveEnterpriseState() {
  try {
    window.localStorage.setItem(ENTERPRISE_STORAGE_KEY, JSON.stringify(enterpriseState));
  } catch {}
}

function enterpriseTasks() {
  return enterpriseState.tasks.filter((task) => task.assignee === "Priya Nair");
}

function enterpriseTask(id) {
  return enterpriseState.tasks.find((task) => task.id === id);
}

function enterpriseStatusLabel(status) {
  return { ready: "To do", in_progress: "In progress", clarification: "Needs clarification", completed: "Completed" }[status] || "To do";
}

function enterpriseStatusClass(status) {
  return { ready: "enterprise-ready", in_progress: "enterprise-progress", clarification: "enterprise-question", completed: "enterprise-complete" }[status] || "enterprise-ready";
}

function enterpriseAttentionTasks() {
  return enterpriseTasks().filter((task) => task.status !== "completed");
}

function enterpriseParticipantSidebar(thread) {
  const attention = enterpriseAttentionTasks();
  return `<aside class="d-work-picture enterprise-chat-rail">
    <div class="enterprise-rail-head"><span class="d-notebook-label">FROM ACME</span><span>${attention.length} open</span></div>
    <h2>Your follow-ups</h2>
    <p>People &amp; Safety actions, operational requests and required updates in one place.</p>
    <div class="enterprise-rail-tasks">
      ${attention.slice(0, 3).map((task) => `<button type="button" data-enterprise-task-open="${task.id}"><span class="enterprise-task-kind">${xEscape(task.kind)}</span><strong>${xEscape(task.title)}</strong><small>${xEscape(task.due)} · ${enterpriseStatusLabel(task.status)}</small>${engineIcon("ArrowUpRight")}</button>`).join("")}
    </div>
    <div class="enterprise-rail-boundary">${engineIcon("LockKeyhole")}<p><strong>The status loop is separate from your conversation.</strong> HR can see whether an assigned action is open, blocked or complete. Your messages stay private unless you approve a note to contribute or share.</p></div>
    ${thread.observations.length ? `<div class="enterprise-rail-approved"><span>${engineIcon("CircleCheck")}${thread.observations.length} approved ${thread.observations.length === 1 ? "note" : "notes"}</span><p>You chose what entered Acme's shared picture.</p></div>` : ""}
  </aside>`;
}

function enterpriseEmployeeHeader() {
  return `<header class="employee-header">
    <div class="employee-wrap employee-header-inner">${brandLogo()}<nav aria-label="Employee workspace"><button data-employee-section="conversation">Conversation</button><button class="active" data-employee-section="follow-ups">Follow-ups <span class="employee-nav-count">${enterpriseAttentionTasks().length}</span></button><button data-open-participant-mission="mission-margin">Missions</button><button data-employee-section="updates">Updates</button></nav><div class="participant-profile"><div class="avatar">PN</div><div><strong>${state.user.name}</strong><span>${state.user.jobTitle}</span></div></div></div>
  </header>`;
}

function enterpriseTaskCard(task) {
  const action = task.status === "completed" ? "View record" : task.status === "clarification" ? "View question" : task.status === "in_progress" ? "Continue" : "Open follow-up";
  return `<article class="enterprise-task-card ${enterpriseStatusClass(task.status)}">
    <div class="enterprise-task-card-top"><span>${xEscape(task.kind)}</span><em class="${enterpriseStatusClass(task.status)}">${enterpriseStatusLabel(task.status)}</em></div>
    <h3>${xEscape(task.title)}</h3><p>${xEscape(task.description)}</p>
    ${task.hrReply ? `<div class="enterprise-reply">${engineIcon("MessageCircle")}<span><strong>Reply from ${xEscape(task.assignedBy)}</strong>${xEscape(task.hrReply)}</span></div>` : ""}
    <div class="enterprise-task-meta"><span><small>From</small>${xEscape(task.assignedBy)}</span><span><small>Due</small>${xEscape(task.due)}</span><span><small>Source</small>${xEscape(task.source)}</span></div>
    <footer><span>${task.required ? "Required follow-up" : "Information"}</span><button class="btn ${task.status === "completed" ? "secondary" : "accent"}" data-enterprise-task-open="${task.id}">${action}</button></footer>
  </article>`;
}

function renderEnterpriseParticipantDashboard() {
  const tasks = enterpriseTasks();
  const open = tasks.filter((task) => task.status !== "completed");
  const questions = tasks.filter((task) => task.status === "clarification");
  const completed = tasks.filter((task) => task.status === "completed");
  return `
    <main class="employee-portal">
      ${enterpriseEmployeeHeader()}
      <section class="employee-wrap employee-main">
        <div id="employee-conversation">${engineView("participant")}</div>
        <div class="view-title enterprise-work-title" id="employee-work"><div><span class="eyebrow">Assigned work</span><h2>Your follow-ups &amp; missions</h2><p>See what Acme needs from you, ask questions through Fielded and close the loop with the person who assigned it.</p></div><span class="employee-trust-status"><i></i>Conversation content is private until you approve it</span></div>
        <section class="employee-summary"><div class="lead"><span>Needs your attention</span><strong>${open.length}</strong><small>${questions.length ? `${questions.length} awaiting clarification` : "Required actions and briefings"}</small></div><div><span>Due today</span><strong>${open.filter((task) => task.due.startsWith("Today")).length}</strong><small>People &amp; Safety follow-up</small></div><div><span>Active Mission</span><strong>1</strong><small>Project Margin Review</small></div><div><span>Completed</span><strong>${completed.length + 3}</strong><small>Follow-ups and conversations</small></div></section>
        <section class="enterprise-employee-grid">
          <div class="enterprise-followups">
            <div class="section-head"><div><span class="eyebrow">Sent to you</span><h2>Follow-up actions</h2></div><span class="attention-count">${open.length}</span></div>
            ${open.map(enterpriseTaskCard).join("") || `<div class="enterprise-empty"><strong>You are up to date.</strong><p>New actions from HR and your managers will appear here.</p></div>`}
            <div class="section-head enterprise-mission-heading"><div><span class="eyebrow">Digital fieldwork</span><h2>Active interview</h2></div><span class="mission-status teal">In progress</span></div>
            <article class="employee-mission-card enterprise-mission-card"><header><div class="mission-number">01</div><div><span class="eyebrow">Operational discovery · About 4 minutes</span><h2>Project Margin Review</h2></div></header><p>Share what you see in project reporting, approvals and scope changes. Fielded follows up where your experience can clarify how work really happens.</p><div class="employee-mission-meta"><span><small>Requested by</small><strong>Harriet Cole, CEO</strong></span><span><small>Due</small><strong>Friday, 4 Sep</strong></span><span><small>Your progress</small><strong>1 of 3 topics</strong></span></div><div class="progress-bar"><span style="width:34%"></span></div><footer><span><i class="live-dot"></i> Your draft is saved privately</span><button class="btn accent" data-open-participant-mission="mission-margin">Continue interview</button></footer></article>
          </div>
          <aside class="employee-updates" id="employee-updates">
            <div class="section-head"><div><span class="eyebrow">Company updates</span><h2>Important for you</h2></div><span class="count-label">1 new</span></div>
            <article class="employee-update urgent"><header><span>People &amp; Safety</span><time>Today</time></header><h3>Speaking Up policy clarification</h3><p>Acme has clarified who can access a concern, the independent reporting route and protection from retaliation.</p><div><span>Follow-up assigned</span><strong>Due today</strong></div><button class="btn secondary" data-enterprise-task-open="followup-reporting-route">Review clarification</button></article>
            <article class="employee-update"><header><span>Health &amp; safety</span><time>28 Aug</time></header><h3>Workshop Safety Update</h3><p>The permit-to-work threshold now includes contractor maintenance and all isolation work.</p><div><span>Action in progress</span><strong>Due Monday</strong></div><button class="btn secondary" data-enterprise-task-open="followup-contractor-handover">Open action</button></article>
            <div class="employee-help enterprise-privacy-note"><span class="eyebrow">Your control</span><strong>Operational status is not conversation access.</strong><p>People &amp; Culture can see whether an assigned follow-up is open, blocked or complete. Your conversation, voice notes and files remain private unless you approve a specific note.</p></div>
            ${completed.length ? `<div class="enterprise-completed"><span class="eyebrow">Recently completed</span>${completed.map((task) => `<button data-enterprise-task-open="${task.id}">${engineIcon("CircleCheck")}<span><strong>${xEscape(task.title)}</strong><small>${xEscape(task.due)}</small></span></button>`).join("")}</div>` : ""}
          </aside>
        </section>
      </section>
    </main>`;
}

function enterpriseOpenTask(id) {
  const task = enterpriseTask(id);
  if (!task) return;
  if (task.status === "ready") {
    task.status = "in_progress";
    enterpriseState.activity.unshift({ id: crypto.randomUUID(), text: `${task.assignee} opened “${task.title}”`, time: "Just now" });
    saveEnterpriseState();
  }
  const isComplete = task.status === "completed";
  const dialog = engineShowDialog(task.title, `<div class="enterprise-task-dialog">
    <div class="enterprise-dialog-status"><span class="${enterpriseStatusClass(task.status)}">${enterpriseStatusLabel(task.status)}</span><small>${xEscape(task.kind)} · ${xEscape(task.due)}</small></div>
    <p>${xEscape(task.description)}</p>
    <div class="enterprise-policy-copy"><span>Approved source · ${xEscape(task.source)}</span><p>${xEscape(task.policy)}</p></div>
    <div class="enterprise-checklist"><strong>What Acme needs from you</strong>${task.instructions.map((item) => `<div>${engineIcon("CircleCheck")}<span>${xEscape(item)}</span></div>`).join("")}</div>
    ${task.clarification ? `<div class="enterprise-dialog-question"><strong>Your question to ${xEscape(task.assignedBy)}</strong><p>${xEscape(task.clarification)}</p>${task.hrReply ? `<strong>Reply</strong><p>${xEscape(task.hrReply)}</p>` : "<small>Awaiting a reply. HR can see this question because you chose to send it.</small>"}</div>` : ""}
    <form class="enterprise-clarification-form" data-enterprise-clarification-form="${task.id}" hidden><label for="enterprise-question-${task.id}">What do you need clarified?</label><textarea id="enterprise-question-${task.id}" rows="3" maxlength="1000" required></textarea><small>This question and your name are sent to ${xEscape(task.assignedBy)}. Your Fielded conversation is not sent.</small><button class="btn secondary" type="submit">Send question</button></form>
    <div class="enterprise-dialog-actions">${isComplete ? `<button class="btn secondary" data-close-enterprise>Close</button>` : `<button class="btn secondary" data-enterprise-discuss="${task.id}">${engineIcon("MessageCircle")}Discuss privately with Fielded</button><button class="btn secondary" data-enterprise-show-question>Request clarification</button><button class="btn accent" data-enterprise-complete="${task.id}">Mark complete</button>`}</div>
    <p class="enterprise-status-disclosure">${engineIcon("LockKeyhole")} ${isComplete ? `Completion was shared with ${xEscape(task.assignedBy)}.` : `Opening and completion status are visible to ${xEscape(task.assignedBy)}. Conversation content is not.`}</p>
  </div>`);
  dialog.querySelector("[data-close-enterprise]")?.addEventListener("click", engineCloseDialog);
  dialog.querySelector("[data-enterprise-show-question]")?.addEventListener("click", () => {
    const form = dialog.querySelector("[data-enterprise-clarification-form]");
    form.hidden = false;
    form.querySelector("textarea").focus();
  });
  dialog.querySelector("[data-enterprise-clarification-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = event.currentTarget.querySelector("textarea").value.trim();
    if (!question) return;
    task.clarification = question;
    task.status = "clarification";
    enterpriseState.activity.unshift({ id: crypto.randomUUID(), text: `${task.assignee} requested clarification on “${task.title}”`, time: "Just now" });
    saveEnterpriseState();
    engineCloseDialog();
    render();
    buttonToast("Question sent to " + task.assignedBy);
  });
  dialog.querySelector("[data-enterprise-discuss]")?.addEventListener("click", () => enterpriseDiscussTask(task.id));
  dialog.querySelector("[data-enterprise-complete]")?.addEventListener("click", () => enterpriseCompleteTask(task.id));
}

function enterpriseDiscussTask(id) {
  const task = enterpriseTask(id);
  if (!task) return;
  if (task.status === "ready") task.status = "in_progress";
  saveEnterpriseState();
  engineThread("participant").draft = `I'd like to talk through the follow-up “${task.title}”. `;
  engineCloseDialog();
  render();
  setTimeout(() => {
    document.getElementById("employee-conversation")?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("engine-message-participant")?.focus({ preventScroll: true });
  }, 30);
}

function enterpriseCompleteTask(id) {
  const task = enterpriseTask(id);
  if (!task) return;
  task.status = "completed";
  task.completedAt = new Date().toISOString();
  enterpriseState.activity.unshift({ id: crypto.randomUUID(), text: `${task.assignee} completed “${task.title}”`, time: "Just now" });
  saveEnterpriseState();
  engineCloseDialog();
  render();
  buttonToast("Follow-up completed · HR status updated");
}

function enterpriseAddSharedFeedback(text, scope) {
  if (scope === "PRIVATE") return;
  enterpriseState.sharedFeedback.unshift({ id: crypto.randomUUID(), text, scope, createdAt: new Date().toISOString(), participant: scope === "SHARE" ? "Priya Nair" : "Employee contribution" });
  saveEnterpriseState();
}

function enterpriseHRFollowupsView() {
  const tasks = enterpriseTasks();
  const counts = {
    open: tasks.filter((task) => task.status !== "completed").length,
    questions: tasks.filter((task) => task.status === "clarification").length,
    complete: tasks.filter((task) => task.status === "completed").length
  };
  return `<div class="view-title"><div><span class="eyebrow">People actions</span><h1>Assign the next step. See the loop close.</h1><p>Send targeted follow-ups after a policy briefing and track delivery without opening an employee's private Fielded conversation.</p></div><button class="btn accent" data-enterprise-toggle-assign>Assign follow-up</button></div>
    <section class="enterprise-hr-kpis"><div><span>Open follow-ups</span><strong>${counts.open}</strong><small>Assigned to Priya</small></div><div><span>Needs clarification</span><strong>${counts.questions}</strong><small>Employee chose to send a question</small></div><div><span>Completed</span><strong>${counts.complete}</strong><small>Status confirmed</small></div><div><span>Private conversations</span><strong>Protected</strong><small>Not visible in this workspace</small></div></section>
    <section class="enterprise-assign-panel" data-enterprise-assign-panel hidden><div><span class="eyebrow">New follow-up</span><h2>Send an action to an employee</h2><p>Create a specific next step linked to an approved communication or operational source.</p></div><form data-enterprise-assign-form><label>Employee<select name="assignee"><option>Priya Nair · Project Manager</option></select></label><label>Type<select name="kind"><option>Policy follow-up</option><option>Safety action</option><option>Operational action</option><option>Required briefing</option></select></label><label class="enterprise-field-wide">Title<input name="title" maxlength="120" required value="Confirm the revised reporting route"></label><label class="enterprise-field-wide">What needs to happen<textarea name="description" rows="3" maxlength="500" required>Review the clarification, discuss anything unclear with Fielded and confirm when you know which independent route to use.</textarea></label><label>Due<input type="date" name="due" required value="2026-09-08"></label><label>Approved source<input name="source" required value="Speaking Up policy · v3.2"></label><div class="enterprise-form-boundary">${engineIcon("LockKeyhole")}<span><strong>Privacy boundary</strong>HR receives delivery, clarification and completion status. Private Fielded messages and attachments remain outside this record.</span></div><div class="enterprise-form-actions"><button type="button" class="btn secondary" data-enterprise-cancel-assign>Cancel</button><button type="submit" class="btn accent">Assign to Priya</button></div></form></section>
    <section class="enterprise-hr-grid"><div class="enterprise-action-register"><div class="section-head"><div><span class="eyebrow">Employee follow-ups</span><h2>Live action register</h2></div><button class="text-link" data-enterprise-preview-employee>Open Priya's portal →</button></div>${tasks.map((task) => `<article><span class="${enterpriseStatusClass(task.status)}">${enterpriseStatusLabel(task.status)}</span><div><strong>${xEscape(task.title)}</strong><p>${xEscape(task.description)}</p><small>${xEscape(task.source)} · ${xEscape(task.assignee)}</small>${task.clarification ? `<div class="enterprise-hr-question"><b>Employee question</b><span>${xEscape(task.clarification)}</span>${task.hrReply ? `<em>Answered: ${xEscape(task.hrReply)}</em>` : `<button class="btn secondary" data-enterprise-answer="${task.id}">Reply</button>`}</div>` : ""}</div><div><small>Assigned by</small><strong>${xEscape(task.assignedBy)}</strong></div><div><small>Due</small><strong>${xEscape(task.due)}</strong></div><button class="d-tool" aria-label="Open employee follow-up" data-enterprise-task-open="${task.id}">${engineIcon("ArrowUpRight")}</button></article>`).join("")}</div>
      <aside class="enterprise-hr-activity"><span class="eyebrow">Status activity</span><h2>What HR is allowed to see</h2>${enterpriseState.activity.slice(0, 5).map((item) => `<div><i></i><span><strong>${xEscape(item.text)}</strong><small>${xEscape(item.time)}</small></span></div>`).join("")}<p>${engineIcon("ShieldCheck")}No transcript, recording, file or private note is exposed in this status feed.</p></aside></section>
    ${enterpriseState.sharedFeedback.length ? `<section class="enterprise-shared-feedback"><div class="section-head"><div><span class="eyebrow">Explicitly approved</span><h2>Employee contributions</h2></div><span class="count-label">${enterpriseState.sharedFeedback.length} shared</span></div>${enterpriseState.sharedFeedback.map((item) => `<article><span>${item.scope}</span><p>${xEscape(item.text)}</p><small>${xEscape(item.participant)} · Participant-approved note</small></article>`).join("")}</section>` : ""}`;
}

function enterpriseCreateTask(form) {
  const data = new FormData(form);
  const due = new Date(`${data.get("due")}T17:00:00`);
  const task = {
    id: `followup-${crypto.randomUUID()}`,
    title: String(data.get("title") || "New follow-up").trim(),
    kind: String(data.get("kind") || "Policy follow-up"),
    description: String(data.get("description") || "").trim(),
    source: String(data.get("source") || "HR action").trim(),
    assignedBy: state.user?.name || "Aisha Rahman",
    assignedRole: state.user?.jobTitle || "People & Safety Director",
    assignee: "Priya Nair",
    due: Number.isNaN(due.getTime()) ? "No due date" : due.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    dueSort: Number.isNaN(due.getTime()) ? "" : due.toISOString(),
    status: "ready",
    required: true,
    instructions: ["Review the assigned information.", "Use Fielded to discuss anything unclear.", "Confirm completion so the action owner can close the loop."],
    policy: String(data.get("description") || "").trim(),
    clarification: "",
    hrReply: ""
  };
  enterpriseState.tasks.unshift(task);
  enterpriseState.activity.unshift({ id: crypto.randomUUID(), text: `${task.assignedBy} assigned “${task.title}” to Priya`, time: "Just now" });
  saveEnterpriseState();
  render();
  buttonToast("Follow-up assigned to Priya");
}

function enterpriseAnswerTask(id) {
  const task = enterpriseTask(id);
  if (!task) return;
  const dialog = engineShowDialog(`Reply to Priya`, `<form class="enterprise-reply-form"><p><strong>${xEscape(task.title)}</strong></p><blockquote>${xEscape(task.clarification)}</blockquote><label for="enterprise-hr-reply">Your reply</label><textarea id="enterprise-hr-reply" rows="4" maxlength="1200" required>Thanks for asking. The independent channel is managed outside your reporting line. Only the designated People &amp; Safety lead and investigation owner can access the case, and identifying details are restricted wherever possible.</textarea><small>This named reply is sent to Priya's follow-up record. It does not open her Fielded conversation.</small><button class="btn accent" type="submit">Send reply</button></form>`);
  dialog.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    task.hrReply = event.currentTarget.querySelector("textarea").value.trim();
    task.status = "in_progress";
    enterpriseState.activity.unshift({ id: crypto.randomUUID(), text: `${task.assignedBy} replied to Priya's clarification request`, time: "Just now" });
    saveEnterpriseState();
    engineCloseDialog();
    render();
    buttonToast("Reply sent to Priya");
  });
}

function enterpriseDownloadAssurance() {
  const lines = ["Acme Engineering · People & Policy Assurance", "Generated 4 September 2026", "", ...enterpriseTasks().map((task) => `${enterpriseStatusLabel(task.status)} | ${task.title} | ${task.assignee} | ${task.source}`), "", "Private Fielded conversations are excluded from this report."];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "acme-policy-assurance.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function enterpriseNewCommunicationDialog() {
  const dialog = engineShowDialog("New policy communication", `<form class="enterprise-reply-form" data-enterprise-policy-form><label>Title<input name="title" required value="Data handling and acceptable use"></label><label>Policy objective<textarea name="objective" rows="3" required>Ensure employees understand the approved handling route for customer and employee data.</textarea></label><label>Source reference<input name="source" required value="INFOSEC-032 · Version 1.0"></label><label>Audience<select name="audience"><option value="80">All employees · 80</option><option value="46">Operations &amp; Engineering · 46</option></select></label><button class="btn accent" type="submit">Create communication</button></form>`);
  dialog.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const item = { id: `policy-${crypto.randomUUID()}`, title: String(data.get("title")), category: "Information governance", owner: state.user.name, audience: Number(data.get("audience")), reached: 0, completed: 0, understood: 0, questions: 0, concerns: 0, status: "Draft", launched: "Not published", source: String(data.get("source")), objective: String(data.get("objective")), summary: String(data.get("objective")) };
    hrSeed.policies.unshift(item);
    state.selectedPolicyId = item.id;
    state.route = "hr-communication";
    engineCloseDialog();
    render();
  });
}

function enterprisePublishSelectedPolicy() {
  const policy = selectedPolicy();
  policy.status = "Live";
  policy.launched = "Just now";
  policy.reached = Math.max(policy.reached, 1);
  const exists = enterpriseState.tasks.some((task) => task.source.startsWith(policy.title));
  if (!exists) {
    enterpriseState.tasks.unshift({ id: `policy-task-${crypto.randomUUID()}`, title: `Review ${policy.title}`, kind: "Required briefing", description: policy.objective, source: `${policy.title} · ${policy.source}`, assignedBy: state.user.name, assignedRole: state.user.jobTitle, assignee: "Priya Nair", due: "Within 3 working days", dueSort: "", status: "ready", required: true, instructions: ["Review the approved briefing.", "Ask Fielded anything that is unclear.", "Confirm completion."], policy: policy.summary, clarification: "", hrReply: "" });
    enterpriseState.activity.unshift({ id: crypto.randomUUID(), text: `${state.user.name} published “${policy.title}” to Priya`, time: "Just now" });
    saveEnterpriseState();
  }
  render();
  buttonToast("Communication published · employee follow-up created");
}

function enterpriseHandleHRAction(action) {
  if (action === "new-communication") { enterpriseNewCommunicationDialog(); return true; }
  if (action === "publish-policy") { enterprisePublishSelectedPolicy(); return true; }
  if (action === "send-clarification" || action === "assign-action") { state.route = "hr-followups"; render(); setTimeout(() => document.querySelector("[data-enterprise-toggle-assign]")?.click(), 20); return true; }
  if (action === "export-assurance") { enterpriseDownloadAssurance(); buttonToast("Assurance report downloaded"); return true; }
  if (action === "acknowledge-feedback") { buttonToast("Understanding response recorded"); return true; }
  return false;
}

function bindEnterpriseEvents() {
  document.querySelectorAll("[data-employee-section]").forEach((button) => button.addEventListener("click", () => {
    const target = { conversation: "employee-conversation", "follow-ups": "employee-work", updates: "employee-updates" }[button.dataset.employeeSection];
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  document.querySelectorAll("[data-enterprise-task-open]").forEach((button) => button.addEventListener("click", () => enterpriseOpenTask(button.dataset.enterpriseTaskOpen)));
  document.querySelector("[data-enterprise-toggle-assign]")?.addEventListener("click", () => {
    const panel = document.querySelector("[data-enterprise-assign-panel]");
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("[data-enterprise-cancel-assign]")?.addEventListener("click", () => { document.querySelector("[data-enterprise-assign-panel]").hidden = true; });
  document.querySelector("[data-enterprise-assign-form]")?.addEventListener("submit", (event) => { event.preventDefault(); enterpriseCreateTask(event.currentTarget); });
  document.querySelectorAll("[data-enterprise-answer]").forEach((button) => button.addEventListener("click", () => enterpriseAnswerTask(button.dataset.enterpriseAnswer)));
  document.querySelectorAll("[data-enterprise-preview-employee]").forEach((button) => button.addEventListener("click", () => { state.role = "participant"; state.user = seed.users.find((user) => user.id === "u-pm-a"); state.route = "participant-home"; render(); window.scrollTo(0, 0); }));
}

window.addEventListener("storage", (event) => {
  if (event.key !== ENTERPRISE_STORAGE_KEY || !event.newValue) return;
  try {
    const updated = JSON.parse(event.newValue);
    if (updated.version !== enterpriseSeed.version) return;
    enterpriseState.tasks = updated.tasks;
    enterpriseState.sharedFeedback = updated.sharedFeedback || [];
    enterpriseState.activity = updated.activity || [];
    render();
  } catch {}
});
