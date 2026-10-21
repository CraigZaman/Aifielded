const hrSeed = {
  organisation: "Acme Engineering Ltd",
  policies: [
    {
      id: "policy-whistleblowing",
      title: "Speaking Up & Whistleblowing Policy",
      category: "Ethics & conduct",
      owner: "Aisha Rahman",
      audience: 80,
      reached: 76,
      completed: 61,
      understood: 52,
      questions: 18,
      concerns: 7,
      status: "Live",
      launched: "Today, 08:30",
      source: "HR-POL-014 · Version 3.2",
      objective: "Ensure every employee understands how to raise a concern, the protection available to them, and the independent reporting routes.",
      summary: "Acme has updated its whistleblowing policy to clarify anonymous reporting, protection from retaliation and escalation outside the employee's reporting line."
    },
    {
      id: "policy-safety",
      title: "Workshop Health & Safety Update",
      category: "Health & safety",
      owner: "Marcus Webb",
      audience: 46,
      reached: 46,
      completed: 43,
      understood: 40,
      questions: 9,
      concerns: 3,
      status: "Assurance review",
      launched: "28 Aug, 14:00",
      source: "HSE-MEMO-008 · Version 1.4",
      objective: "Confirm that workshop teams understand the revised permit-to-work and near-miss reporting process.",
      summary: "The permit-to-work threshold now covers contractor maintenance and all isolation work, with a simplified near-miss reporting route."
    },
    {
      id: "policy-hybrid",
      title: "Hybrid Working Principles",
      category: "People policy",
      owner: "Aisha Rahman",
      audience: 34,
      reached: 34,
      completed: 31,
      understood: 29,
      questions: 6,
      concerns: 1,
      status: "Complete",
      launched: "21 Aug, 09:00",
      source: "PEOPLE-021 · Version 2.0",
      objective: "Explain team agreements, core collaboration hours and manager discretion.",
      summary: "Updated hybrid working principles establish team-level agreements while preserving flexibility for role and customer needs."
    }
  ],
  feedback: [
    { theme: "Fear of identification", count: 11, sentiment: "Concern", detail: "Employees want clearer reassurance about what anonymous reporting means in a small team." },
    { theme: "Line-manager bypass", count: 8, sentiment: "Question", detail: "Several people did not know they can report outside their management chain." },
    { theme: "Contractor coverage", count: 6, sentiment: "Gap", detail: "Workshop teams are unsure whether agency staff and contractors use the same channel." },
    { theme: "Protection after reporting", count: 5, sentiment: "Concern", detail: "Employees understand retaliation is prohibited but want concrete examples of protection." }
  ],
  actions: [
    { title: "Clarify how anonymity is protected", owner: "Aisha Rahman", cohort: "All employees", due: "Today", status: "Draft ready", source: "11 employee questions" },
    { title: "Add contractor reporting route", owner: "Marcus Webb", cohort: "Operations & Engineering", due: "3 Sep", status: "Assigned", source: "6 evidence points" },
    { title: "Brief people managers on non-retaliation", owner: "Nina Costa", cohort: "14 managers", due: "4 Sep", status: "Scheduled", source: "5 concerns" }
  ],
  dialogue: [
    { sender: "Fielded", text: "Acme has updated its Speaking Up & Whistleblowing Policy. You can report suspected wrongdoing anonymously, and you do not need to raise it with your line manager first." },
    { sender: "Employee", text: "What does anonymous mean here? In a small team, people may still work out who raised it." },
    { sender: "Fielded", text: "Your identity is not included in the report unless you choose to share it. Details that could identify you are restricted, and you can use Acme's independent reporting channel. Would knowing who can access the report help you decide whether you feel safe using it?" },
    { sender: "Employee", text: "Yes. I also wasn't sure whether contractors are protected in the same way." },
    { sender: "Fielded", text: "That is not explicit enough in this briefing. I can record the question for HR without attaching your identity. Based on what you have read, do you know where to report a concern today?" }
  ]
};

function selectedPolicy() {
  return hrSeed.policies.find((item) => item.id === state.selectedPolicyId) || hrSeed.policies[0];
}

function hrMemoSections(policy) {
  if (policy.id === "policy-whistleblowing") return [
    ["Purpose", "Acme encourages employees and contractors to raise genuine concerns about wrongdoing, unsafe practice, fraud, regulatory breaches or conduct that could harm others."],
    ["Your reporting routes", "Speak to your manager, People & Culture, the Board's designated independent contact, or use the anonymous reporting channel. You may bypass your management line."],
    ["Protection", "Retaliation is prohibited. Reports are restricted to those who need to investigate, and identity is shared only where consent or law requires it."],
    ["What happens next", "You receive acknowledgement within two working days, an investigation owner and an update on the outcome where confidentiality permits."]
  ];
  if (policy.id === "policy-safety") return [
    ["Purpose", "The revised process brings contractor maintenance and all isolation work into the permit-to-work threshold."],
    ["Before work begins", "Name the permit owner, identify the isolation point and confirm who is responsible for the contractor handover."],
    ["Near misses", "Use the simplified near-miss route as soon as it is safe to do so. A near miss should be reported even when no injury or damage occurred."],
    ["What happens next", "People & Safety reviews completion and questions, then assigns targeted follow-up where ownership or the process remains unclear."]
  ];
  if (policy.id === "policy-hybrid") return [
    ["Purpose", "Team agreements should make collaboration predictable while preserving flexibility for different roles and customer needs."],
    ["Core collaboration", "Each team agrees the hours when colleagues can expect live collaboration and records exceptions transparently."],
    ["Manager discretion", "Managers may adapt arrangements to operational and individual needs within the agreed principles."],
    ["What happens next", "Employees acknowledge their team agreement and raise practical conflicts through their manager or People & Culture."]
  ];
  return [
    ["Purpose", policy.objective],
    ["Approved source", `This briefing is controlled by ${policy.source}. Fielded should explain only the approved content supplied by the policy owner.`],
    ["Questions", "Employees can ask Fielded for clarification privately or send a named question to the communication owner."],
    ["What happens next", "Completion status is returned to the communication owner. Private conversation content is excluded unless the employee explicitly approves a note."]
  ];
}

function hrNavItems() {
  const items = [
    ["engine-hr", "My Fielded engineer", "F"],
    ["hr-overview", "Overview", "01"],
    ["hr-communications", "Communications", "02"],
    ["hr-dialogue", "Employee dialogue", "03"],
    ["hr-feedback", "Feedback intelligence", "04"],
    ["hr-followups", "Employee follow-ups", "05"],
    ["hr-actions", "Action log", "06"]
  ];
  return items.map(([route, label, index]) => `<button class="nav-item ${state.route === route ? "active" : ""}" data-hr-nav="${route}"><span>${index}</span>${label}</button>`).join("");
}

function renderHR() {
  const policy = selectedPolicy();
  const isEngineer = state.route === "engine-hr";
  mount(`
    <div class="layout hr-layout">
      <aside class="sidebar hr-sidebar">
        ${brandLogo()}
        <div class="workspace-switch"><span>People workspace</span><strong>${hrSeed.organisation}</strong><small>Policy communications & assurance</small></div>
        <nav class="nav-list">${hrNavItems()}</nav>
        <div class="sidebar-foot"><span class="system-status"><i></i> Employee listening active</span><small>80 employees · 3 live communications<br />Last feedback sync: 2 minutes ago</small></div>
      </aside>
      <section>
        <div class="mobile-nav">${hrNavItems()}</div>
        <header class="topbar">
          <div><span class="topbar-label">${isEngineer ? "Your Fielded workspace" : "Active communication"}</span><strong>${isEngineer ? "Acme Engineering · People & safety" : policy.title}</strong></div>
          <div class="topbar-center"><span class="live-dot"></span>${isEngineer ? "Listen, understand and follow through" : `${policy.completed} of ${policy.audience} briefings complete`}</div>
          <div class="identity"><div class="avatar">AR</div><div><strong>${state.user.name}</strong><br /><span class="muted">${state.user.jobTitle}</span></div></div>
        </header>
        <main class="main hr-main">${hrView()}</main>
      </section>
    </div>
  `);
}

function hrView() {
  if (state.route === "engine-hr") return engineView("hr");
  if (state.route === "hr-communications") return hrCommunicationsView();
  if (state.route === "hr-communication") return hrCommunicationView();
  if (state.route === "hr-dialogue") return hrDialogueView();
  if (state.route === "hr-feedback") return hrFeedbackView();
  if (state.route === "hr-followups") return enterpriseHRFollowupsView();
  if (state.route === "hr-actions") return hrActionsView();
  return hrOverviewView();
}

function hrOverviewView() {
  return `
    ${engineContributionFeed("hr", "Reviewed people & policy notes")}
    <div class="view-title"><div><span class="eyebrow">People & policy assurance</span><h1>Good morning, Aisha.</h1><p>Fielded is helping Acme communicate critical policy changes, confirm understanding and hear what employees need clarified.</p></div><button class="btn accent" data-hr-action="new-communication">New communication</button></div>
    <section class="hr-proposition"><div><span class="eyebrow on-dark">Push, listen, understand</span><h2>Distribution is not the same as understanding.</h2><p>Fielded turns a memo into a two-way conversation: explaining the policy, answering questions, checking comprehension and returning structured, privacy-aware feedback to HR.</p></div><div class="hr-flow"><span><b>01</b>Publish policy</span><i></i><span><b>02</b>Explain</span><i></i><span><b>03</b>Check understanding</span><i></i><span><b>04</b>Act on feedback</span></div></section>
    <section class="hr-kpis"><div><span>People reached</span><strong>76</strong><small>95% of Acme employees</small></div><div><span>Briefings complete</span><strong>61</strong><small>Up 14 since 09:00</small></div><div><span>Confirmed understanding</span><strong>85%</strong><small>52 completed checks</small></div><div class="attention"><span>Clarifications needed</span><strong>14</strong><small>Across 4 recurring themes</small></div><div><span>Actions owned</span><strong>3</strong><small>All assigned</small></div></section>
    <section class="hr-overview-grid">
      <div class="hr-live-card"><header><div><span class="eyebrow">Live push mission</span><h2>Speaking Up & Whistleblowing Policy</h2></div><span class="mission-status green">Live</span></header><p>Every employee receives the same core policy, while Fielded adapts its explanation to their questions and role context.</p><div class="hr-progress"><div><span>Reached</span><strong>76 / 80</strong></div><div class="progress-bar"><span style="width:95%"></span></div></div><div class="hr-pulse"><div><strong>85%</strong><span>understand how to report</span></div><div><strong>68%</strong><span>feel confident reporting</span></div><div><strong>18</strong><span>questions surfaced</span></div></div><footer><span>Launched today at 08:30</span><button class="btn accent" data-open-policy="policy-whistleblowing">Open communication</button></footer></div>
      <aside class="hr-attention"><div class="section-head"><div><span class="eyebrow">Needs HR attention</span><h2>Understanding gaps</h2></div><span class="attention-count">3</span></div>${hrSeed.feedback.slice(0,3).map((item) => `<div><b>${item.count}</b><span><strong>${item.theme}</strong><small>${item.detail}</small></span><em>${item.sentiment}</em></div>`).join("")}<button class="text-link" data-hr-nav="hr-feedback">Review all feedback →</button></aside>
    </section>
    <section class="hr-policy-list"><div class="section-head"><div><span class="eyebrow">Policy communications</span><h2>Current assurance portfolio</h2></div><button class="text-link" data-hr-nav="hr-communications">View all communications →</button></div>${hrSeed.policies.map(hrPolicyRow).join("")}</section>
  `;
}

function hrPolicyRow(item) {
  const completion = Math.round((item.completed / item.audience) * 100);
  return `<button class="hr-policy-row" data-open-policy="${item.id}"><span class="policy-icon">${item.category === "Health & safety" ? "HS" : item.category === "Ethics & conduct" ? "EC" : "PP"}</span><span><strong>${item.title}</strong><small>${item.source} · ${item.owner}</small></span><span><small>Completion</small><strong>${completion}%</strong></span><span><small>Questions</small><strong>${item.questions}</strong></span><span class="mission-status ${item.status === "Live" ? "green" : item.status === "Complete" ? "blue" : "teal"}">${item.status}</span></button>`;
}

function hrCommunicationsView() {
  return `<div class="view-title"><div><span class="eyebrow">Policy communications</span><h1>Turn every memo into understanding.</h1><p>Manage who receives each communication, what Fielded must explain and which comprehension signals HR needs back.</p></div><button class="btn accent" data-hr-action="new-communication">New communication</button></div><section class="communication-summary"><div><span>Live</span><strong>1</strong></div><div><span>Assurance review</span><strong>1</strong></div><div><span>Complete</span><strong>1</strong></div><div><span>Total employees engaged</span><strong>111</strong></div></section><section class="communication-grid">${hrSeed.policies.map((item) => `<article class="communication-card"><header><span class="eyebrow">${item.category}</span><span class="mission-status ${item.status === "Live" ? "green" : "blue"}">${item.status}</span></header><h2>${item.title}</h2><p>${item.objective}</p><div><span>${item.completed}/${item.audience} complete</span><span>${item.questions} questions</span><span>${item.concerns} concerns</span></div><footer><small>${item.launched}</small><button class="btn secondary" data-open-policy="${item.id}">Open</button></footer></article>`).join("")}</section>`;
}

function hrCommunicationView() {
  const policy = selectedPolicy();
  const memoSections = hrMemoSections(policy);
  return `<div class="view-title"><div><span class="eyebrow">${policy.category} · Push mission</span><h1>${policy.title}</h1><p>${policy.objective}</p></div><div class="title-actions"><button class="btn secondary" data-hr-action="copy-policy-link">Copy employee link</button><button class="btn accent" data-hr-action="publish-policy">Publish update</button></div></div>
    <section class="policy-command"><div><span class="eyebrow on-dark">Source-controlled communication</span><h2>${policy.source}</h2><p>${policy.summary}</p></div><div><span>Audience</span><strong>${policy.audience}</strong><small>All employees</small></div><div><span>Reached</span><strong>${policy.reached}</strong><small>95%</small></div><div><span>Complete</span><strong>${policy.completed}</strong><small>76%</small></div><div><span>Understanding</span><strong>85%</strong><small>52 confirmed</small></div></section>
    <section class="policy-workspace"><div class="policy-memo"><div class="section-head"><div><span class="eyebrow">Approved internal memo</span><h2>What employees need to know</h2></div><span class="count-label">${policy.source}</span></div>${memoSections.map(([title, copy]) => `<div class="memo-block"><strong>${xEscape(title)}</strong><p>${xEscape(copy)}</p></div>`).join("")}</div>
      <aside class="policy-agent-plan"><span class="eyebrow">Fielded briefing plan</span><h2>One message, adaptive explanation.</h2><div><b>01</b><span><strong>Explain the change</strong><small>Plain language, consistent with the source memo</small></span></div><div><b>02</b><span><strong>Check comprehension</strong><small>Reporting routes, protection and next steps</small></span></div><div><b>03</b><span><strong>Invite questions safely</strong><small>PRIVATE or CONTRIBUTED confidentiality</small></span></div><div><b>04</b><span><strong>Return aggregate intelligence</strong><small>No private content in HR reporting</small></span></div><button class="btn accent" data-hr-action="preview-dialogue">Preview employee dialogue</button></aside>
    </section>`;
}

function hrDialogueView() {
  return `<div class="view-title"><div><span class="eyebrow">Employee experience preview</span><h1>A conversation, not a read receipt.</h1><p>Fielded explains the policy, responds to uncertainty and verifies practical understanding without exposing private questions to HR.</p></div><span class="pill contribute">CONTRIBUTE</span></div><section class="hr-dialogue-layout"><aside class="dialogue-trust"><span class="eyebrow">Your control</span><h2>Choose how this feedback is used.</h2><div class="trust-option"><strong>PRIVATE</strong><span>Only used to respond within this conversation.</span></div><div class="trust-option active"><strong>CONTRIBUTE</strong><span>De-identified themes can help HR improve the policy.</span></div><p>Your identity is never shown in aggregate HR feedback.</p></aside><div class="policy-chat"><header>${brandLogo("Policy briefing")}<span>About 4 minutes</span></header>${hrSeed.dialogue.map((line) => `<div class="policy-message ${line.sender === "Fielded" ? "fielded" : "employee"}"><strong>${line.sender}</strong><p>${line.text}</p></div>`).join("")}<div class="policy-quick-replies"><button data-hr-action="acknowledge-feedback">Yes, I know where to report</button><button data-hr-action="acknowledge-feedback">I still need clarification</button></div></div><aside class="comprehension-rail"><span class="eyebrow">Live signals</span><div><span>Reporting routes</span><strong>Partially understood</strong></div><div><span>Protection</span><strong>Question raised</strong></div><div><span>Contractor scope</span><strong class="attention-text">Policy gap</strong></div><div><span>Confidentiality</span><strong>CONTRIBUTE</strong></div><p>Only permitted, de-identified signals appear in the HR workspace.</p></aside></section>`;
}

function hrFeedbackView() {
  return `<div class="view-title"><div><span class="eyebrow">Employee feedback intelligence</span><h1>What landed, and what did not.</h1><p>Aggregate comprehension, recurring questions and confidence signals from the whistleblowing policy briefing.</p></div><button class="btn secondary" data-hr-action="export-assurance">Export assurance report</button></div><section class="understanding-band"><div><span>Understand how to report</span><strong>85%</strong><small>52 of 61 completed briefings</small></div><div><span>Know they can bypass a manager</span><strong>74%</strong><small>9 people needed clarification</small></div><div><span>Feel confident speaking up</span><strong>68%</strong><small>Primary gap is fear of identification</small></div><div><span>Know what happens next</span><strong>79%</strong><small>7 asked about investigation updates</small></div></section><section class="feedback-layout"><div class="feedback-themes"><div class="section-head"><div><span class="eyebrow">Recurring themes</span><h2>Questions and concerns</h2></div><span class="count-label">De-identified</span></div>${hrSeed.feedback.map((item, index) => `<article><b>${String(index + 1).padStart(2,"0")}</b><span><strong>${item.theme}</strong><p>${item.detail}</p></span><div><strong>${item.count}</strong><small>mentions</small></div><em>${item.sentiment}</em></article>`).join("")}</div><aside class="hr-insight"><span class="eyebrow on-dark">Fielded synthesis</span><h2>Employees understand the route, but trust is lagging comprehension.</h2><p>The most important intervention is not another policy reminder. It is a concrete explanation of who can see a report, how identifying details are restricted and what protection looks like in practice.</p><div><span>Evidence strength</span><strong>High · 30 independent signals</strong></div><button class="btn light" data-hr-action="send-clarification">Send targeted clarification</button></aside></section>`;
}

function hrActionsView() {
  return `<div class="view-title"><div><span class="eyebrow">Close the loop</span><h1>Turn employee feedback into accountable action.</h1><p>Every response is linked to the permitted aggregate evidence that prompted it, creating a defensible policy assurance trail.</p></div><button class="btn accent" data-hr-action="assign-action">Add action</button></div><section class="action-register"><div class="action-register-head"><span>Action</span><span>Owner</span><span>Cohort</span><span>Evidence source</span><span>Due</span><span>Status</span></div>${hrSeed.actions.map((item) => `<div class="action-register-row"><span><strong>${item.title}</strong><small>Whistleblowing policy · v3.2</small></span><span>${item.owner}</span><span>${item.cohort}</span><span>${item.source}</span><span>${item.due}</span><span class="mission-status ${item.status === "Draft ready" ? "green" : "blue"}">${item.status}</span></div>`).join("")}</section><section class="assurance-chain"><div><span>Source memo</span><strong>Approved content</strong></div><i>→</i><div><span>Employee dialogue</span><strong>61 completed</strong></div><i>→</i><div><span>Understanding</span><strong>52 confirmed</strong></div><i>→</i><div><span>Feedback</span><strong>30 signals</strong></div><i>→</i><div><span>HR action</span><strong>3 owned</strong></div></section>`;
}
