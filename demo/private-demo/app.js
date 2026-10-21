const now = new Date("2026-09-01T09:15:00+01:00");

const state = {
  route: "login",
  role: "manager",
  user: null,
  selectedMissionId: "mission-margin",
  selectedFindingId: "finding-approval",
  selectedEngagementId: "eng-northstar",
  selectedInterviewId: "int-maya",
  selectedPolicyId: "policy-whistleblowing",
  selectedMarketTab: "profile",
  consultingView: "consulting",
  selectedConfidentiality: "CONTRIBUTE",
  askAnswer: "",
  adminMode: false,
  dialogueCompleted: false,
  dialogueMessages: [],
  summaryItems: [
    "Weekly reporting requires significant duplicate entry across Salesforce, Excel and the project tracker.",
    "Approval delays affect project delivery, but incomplete submissions appear to create repeated rework.",
    "Centralised procurement and unclear thresholds slow low-risk project purchases.",
    "Scope changes after commercial handover are reducing margins without a single accountable owner."
  ],
  missionDraft: null
};

const seed = {
  organization: {
    id: "org-acme",
    name: "Acme Engineering Ltd",
    employees: 80
  },
  users: [
    { id: "u-ceo", name: "Harriet Cole", email: "harriet@acme.example", role: "manager", department: "Executive", jobTitle: "CEO" },
    { id: "u-cfo", name: "Daniel Mercer", email: "daniel@acme.example", role: "manager", department: "Finance", jobTitle: "CFO" },
    { id: "u-ops", name: "Meera Shah", email: "meera@acme.example", role: "participant", department: "Operations", jobTitle: "Operations Director" },
    { id: "u-finance", name: "Owen Price", email: "owen@acme.example", role: "participant", department: "Finance", jobTitle: "Finance Manager" },
    { id: "u-sales", name: "Amelia Grant", email: "amelia@acme.example", role: "participant", department: "Sales", jobTitle: "Sales Director" },
    { id: "u-pm-a", name: "Priya Nair", email: "priya@acme.example", role: "participant", department: "Operations", jobTitle: "Project Manager" },
    { id: "u-pm-b", name: "Marcus Bell", email: "marcus@acme.example", role: "participant", department: "Projects", jobTitle: "Project Manager" },
    { id: "u-proc", name: "Jules Ward", email: "jules@acme.example", role: "participant", department: "Procurement", jobTitle: "Procurement Lead" },
    { id: "u-eng-a", name: "Eva Morris", email: "eva@acme.example", role: "participant", department: "Engineering", jobTitle: "Senior Engineer" },
    { id: "u-eng-b", name: "Theo Lin", email: "theo@acme.example", role: "participant", department: "Engineering", jobTitle: "Design Engineer" },
    { id: "u-consultant", name: "Lydia Hart", email: "lydia@avery-stone.example", role: "consultant", department: "Transformation", jobTitle: "Engagement Partner" },
    { id: "u-hr", name: "Aisha Rahman", email: "aisha@acme.example", role: "hr", department: "People & Culture", jobTitle: "People & Safety Director" }
  ],
  missions: [
    {
      id: "mission-margin",
      slug: "acme-margin-review",
      title: "Project Margin Review",
      objective: "Why have our project margins declined?",
      context: "Leadership believes margins have fallen by 7 points across complex client projects. Fielded is gathering operational evidence across Finance, Operations, Procurement, Sales and Engineering.",
      status: "active",
      createdBy: "Harriet Cole",
      departments: ["Finance", "Operations", "Procurement", "Sales", "Engineering"],
      invited: 10,
      completed: 8,
      observations: 42,
      themes: 6,
      contradictions: 4,
      findings: 3,
      createdAt: "2026-08-29"
    },
    {
      id: "mission-cost",
      slug: "acme-cost-review",
      title: "Operating Cost Review",
      objective: "Where could Acme reduce costs without harming customers?",
      context: "A targeted review of duplicated work, unnecessary spend and approval friction.",
      status: "active",
      createdBy: "Daniel Mercer",
      departments: ["Finance", "Operations", "Technology"],
      invited: 20,
      completed: 12,
      observations: 74,
      themes: 9,
      contradictions: 4,
      findings: 3,
      createdAt: "2026-08-24"
    },
    {
      id: "mission-retention",
      slug: "acme-retention",
      title: "Customer Retention Review",
      objective: "Why are strategic accounts expanding more slowly?",
      context: "Fielded is comparing sales, delivery and support evidence around account expansion blockers.",
      status: "completed",
      createdBy: "Harriet Cole",
      departments: ["Sales", "Customer Success", "Operations"],
      invited: 25,
      completed: 18,
      observations: 61,
      themes: 4,
      contradictions: 2,
      findings: 4,
      createdAt: "2026-08-10"
    }
  ],
  observations: [
    { id: "obs-1", missionId: "mission-margin", userId: "u-pm-a", category: "PROCESS", summary: "Manual weekly reporting consumes around five hours per week.", detail: "Project data is entered in Salesforce, Excel and a separate tracker because no system is trusted as the source of truth.", confidentiality: "CONTRIBUTE", confidence: 0.91, sourceType: "DIRECT EXPERIENCE", department: "Operations" },
    { id: "obs-2", missionId: "mission-margin", userId: "u-finance", category: "ROLE_CLARITY", summary: "Finance receives incomplete approval packs.", detail: "Finance rejects or queries requests because threshold rules and required evidence are interpreted inconsistently by project teams.", confidentiality: "CONTRIBUTE", confidence: 0.86, sourceType: "DIRECT EXPERIENCE", department: "Finance" },
    { id: "obs-3", missionId: "mission-margin", userId: "u-ops", category: "DEPENDENCY", summary: "Centralised approvals delay delivery decisions.", detail: "Operations waits several days for approvals on low-risk changes that could be delegated under clearer thresholds.", confidentiality: "SHARE", confidence: 0.84, sourceType: "OPINION", department: "Operations" },
    { id: "obs-4", missionId: "mission-margin", userId: "u-sales", category: "REVENUE", summary: "Discounting pressure is set before delivery complexity is clear.", detail: "Sales sometimes prices work before engineering has confirmed scope risk, creating margin exposure after handover.", confidentiality: "CONTRIBUTE", confidence: 0.79, sourceType: "DIRECT EXPERIENCE", department: "Sales" },
    { id: "obs-5", missionId: "mission-margin", userId: "u-eng-b", category: "CUSTOMER", summary: "Repeated customer scope changes arrive after commercial handover.", detail: "Engineering sees late changes treated as delivery issues rather than commercial variations.", confidentiality: "CONTRIBUTE", confidence: 0.82, sourceType: "DIRECT EXPERIENCE", department: "Engineering" },
    { id: "obs-6", missionId: "mission-margin", userId: "u-proc", category: "POLICY", summary: "Procurement authority is more centralised than risk requires.", detail: "Low-value repeat purchases follow the same path as larger supplier decisions.", confidentiality: "CONTRIBUTE", confidence: 0.8, sourceType: "DIRECT EXPERIENCE", department: "Procurement" }
  ],
  themes: [
    { id: "theme-reporting", missionId: "mission-margin", title: "Manual Reporting Load", description: "Project teams duplicate project status, margin and milestone data across tools because no system is treated as authoritative.", participantCount: 6, evidenceCount: 11, departments: ["Operations", "Finance", "Engineering"], confidence: "High" },
    { id: "theme-approval", missionId: "mission-margin", title: "Approval Bottleneck With Shared Causes", description: "Approvals are slow, but evidence points to both centralised authority and inconsistent submission quality.", participantCount: 8, evidenceCount: 14, departments: ["Operations", "Finance", "Procurement"], confidence: "High" },
    { id: "theme-scope", missionId: "mission-margin", title: "Scope Change Leakage", description: "Late scope changes are not consistently priced, owned or escalated, creating delivery effort that is not visible commercially.", participantCount: 5, evidenceCount: 8, departments: ["Sales", "Engineering", "Operations"], confidence: "Medium" },
    { id: "theme-discounting", missionId: "mission-margin", title: "Early Discounting Risk", description: "Sales incentives and pre-sales estimation gaps may be committing Acme to work before project complexity is understood.", participantCount: 3, evidenceCount: 5, departments: ["Sales", "Engineering"], confidence: "Medium" }
  ],
  hypotheses: [
    { id: "hyp-approval", missionId: "mission-margin", title: "Finance approval time is a symptom, not the single root cause", description: "Repeated rework before Finance approval may explain more delay than Finance capacity alone.", status: "Active", evidenceFor: 9, evidenceAgainst: 3, confidence: "Medium", nextEvidence: "2 Project Managers, 2 Finance Controllers, 1 Procurement Manager" },
    { id: "hyp-scope", missionId: "mission-margin", title: "Unpriced scope change is materially depressing margins", description: "Engineering and Operations evidence suggests effort grows after handover without commercial recovery.", status: "Investigating", evidenceFor: 6, evidenceAgainst: 2, confidence: "Medium", nextEvidence: "Sales Director, Project Controls, Engineering Leads" }
  ],
  findings: [
    {
      id: "finding-approval",
      missionId: "mission-margin",
      title: "Project Approval Bottleneck",
      impact: "High",
      confidence: "High",
      raisedBy: 11,
      departments: ["Operations", "Finance", "Procurement"],
      summary: "Approval delays are materially affecting project delivery. However, the root cause is not Finance capacity alone.",
      evidenceSummary: "Operations reports waiting several days for approvals. Finance reports repeated missing evidence and inconsistent thresholds. Procurement reports centralised authority for low-risk purchases.",
      recommendedAction: "Standardise submission requirements and test delegated approval thresholds for low-risk project changes."
    },
    {
      id: "finding-reporting",
      missionId: "mission-margin",
      title: "Duplicated Project Reporting",
      impact: "Medium",
      confidence: "High",
      raisedBy: 9,
      departments: ["Operations", "Finance", "Engineering"],
      summary: "Project teams are spending avoidable time reconciling multiple reporting tools.",
      evidenceSummary: "Participants independently described Salesforce, Excel and project tracker duplication. Finance depends on reconciled exports for margin review.",
      recommendedAction: "Nominate a single project data owner and remove one manual weekly reporting path."
    },
    {
      id: "finding-scope",
      missionId: "mission-margin",
      title: "Scope Change Leakage",
      impact: "High",
      confidence: "Medium",
      raisedBy: 7,
      departments: ["Sales", "Engineering", "Operations"],
      summary: "Late scope changes are being absorbed into delivery effort without consistent commercial escalation.",
      evidenceSummary: "Engineering reports repeated late changes. Sales reports pricing pressure before delivery risk is fully known.",
      recommendedAction: "Investigate quotation handover quality and introduce a margin impact check for post-handover changes."
    }
  ],
  conversations: [
    { participant: "Priya Nair", role: "Project Manager", department: "Operations", status: "completed", extracted: 7 },
    { participant: "Owen Price", role: "Finance Manager", department: "Finance", status: "completed", extracted: 5 },
    { participant: "Jules Ward", role: "Procurement Lead", department: "Procurement", status: "completed", extracted: 4 },
    { participant: "Eva Morris", role: "Senior Engineer", department: "Engineering", status: "in_progress", extracted: 3 }
  ]
};

const consultingSeed = {
  firm: {
    name: "Avery & Stone Advisory",
    activeEngagements: 4,
    consultants: 18,
    deployedAgents: 11
  },
  engagements: [
    { id: "eng-northstar", client: "Northstar Foods", initials: "NF", type: "Operating Model Review", lead: "Lydia Hart", sponsor: "Chief Transformation Officer", participants: 60, completed: 42, dataCoverage: 83, themes: 12, gaps: 4, findings: 7, phase: "Fieldwork", lastActivity: "6 min ago", value: "£2.4m", industry: "Food manufacturing" },
    { id: "eng-helix", client: "Helix Mobility", initials: "HM", type: "Commercial Due Diligence", lead: "Jon Bell", sponsor: "Investment Committee", participants: 44, completed: 39, dataCoverage: 91, themes: 9, gaps: 2, findings: 11, phase: "Synthesis", lastActivity: "18 min ago", value: "£18m", industry: "Mobility software" },
    { id: "eng-meridian", client: "Meridian Care Group", initials: "MC", type: "AI Opportunity X-Ray", lead: "Safiya Noor", sponsor: "COO", participants: 80, completed: 47, dataCoverage: 68, themes: 15, gaps: 7, findings: 6, phase: "Discovery", lastActivity: "34 min ago", value: "£3.1m", industry: "Healthcare services" },
    { id: "eng-acme", client: "Acme Engineering", initials: "AE", type: "Margin Improvement", lead: "Lydia Hart", sponsor: "CEO", participants: 25, completed: 18, dataCoverage: 78, themes: 10, gaps: 3, findings: 5, phase: "Validation", lastActivity: "1 hr ago", value: "£760k", industry: "Engineering services" }
  ],
  requirements: [
    { requirement: "Current sales process", workstream: "Commercial", status: "Complete", confidence: "High", sources: 8, owner: "Jon Bell" },
    { requirement: "Customer onboarding workflow", workstream: "Operations", status: "Partial", confidence: "Medium", sources: 4, owner: "Lydia Hart" },
    { requirement: "Main operational bottlenecks", workstream: "Operations", status: "Complete", confidence: "High", sources: 17, owner: "Lydia Hart" },
    { requirement: "Gross-margin leakage", workstream: "Finance", status: "Missing", confidence: "—", sources: 0, owner: "Amir Patel" },
    { requirement: "AI automation opportunities", workstream: "Technology", status: "Partial", confidence: "Medium", sources: 11, owner: "Safiya Noor" },
    { requirement: "Founder dependency", workstream: "Leadership", status: "Complete", confidence: "High", sources: 9, owner: "Lydia Hart" },
    { requirement: "Customer churn causes", workstream: "Commercial", status: "Missing", confidence: "—", sources: 0, owner: "Jon Bell" },
    { requirement: "Decision rights by function", workstream: "Organisation", status: "Partial", confidence: "Low", sources: 5, owner: "Lydia Hart" }
  ],
  interviews: [
    { id: "int-maya", participant: "Maya Thompson", role: "Head of Customer Operations", department: "Operations", status: "Completed", duration: "31 min", topics: ["Onboarding", "Handover", "Systems"], dataPoints: 9, claims: 6, confidence: "High", lastActivity: "6 min ago" },
    { id: "int-david", participant: "David Okafor", role: "Regional Sales Director", department: "Sales", status: "Completed", duration: "27 min", topics: ["Pipeline", "Handover", "Churn"], dataPoints: 7, claims: 5, confidence: "High", lastActivity: "22 min ago" },
    { id: "int-elena", participant: "Elena Rossi", role: "Finance Business Partner", department: "Finance", status: "In review", duration: "24 min", topics: ["Margin", "Forecasting"], dataPoints: 5, claims: 4, confidence: "Medium", lastActivity: "48 min ago" },
    { id: "int-tom", participant: "Tom Weaver", role: "Plant Manager", department: "Operations", status: "In progress", duration: "18 min", topics: ["Scheduling", "Waste"], dataPoints: 3, claims: 2, confidence: "Medium", lastActivity: "Live now" },
    { id: "int-rachel", participant: "Rachel Kim", role: "Chief Financial Officer", department: "Leadership", status: "Outstanding", duration: "—", topics: ["Margin", "Investment case"], dataPoints: 0, claims: 0, confidence: "—", lastActivity: "Invited yesterday" }
  ],
  findings: [
    { id: "cf-1", title: "Sales-to-Operations Handoff Failure", confidence: "High", sources: 14, departments: 3, impact: "High", status: "Proposed", summary: "Commercial teams believe handover is standardised, while Operations and Customer Success describe repeated gaps that surface only after onboarding begins.", value: "£540k" },
    { id: "cf-2", title: "Manual Onboarding Data Re-entry", confidence: "High", sources: 11, departments: 4, impact: "Medium", status: "Accepted", summary: "Customer data is copied between CRM, implementation workbooks and plant scheduling tools, adding delay and avoidable error risk.", value: "£310k" },
    { id: "cf-3", title: "Gross-margin Governance Gap", confidence: "Medium", sources: 6, departments: 2, impact: "High", status: "Investigating", summary: "Margin ownership changes after contract signature and no single role reconciles commercial assumptions with delivery reality.", value: "£1.2m" }
  ],
  transcript: [
    { sender: "Fielded", text: "Walk me through what happens after Sales marks a new account as won." },
    { sender: "Maya Thompson", text: "We receive a handover pack, but it is rarely complete. Site constraints, integration details and promised timelines are often in separate email threads." },
    { sender: "Fielded", text: "How often does missing information change the onboarding plan, rather than simply delay administration?" },
    { sender: "Maya Thompson", text: "On roughly one in three larger accounts. We discover a dependency after kickoff, then Customer Success has to reset expectations while Operations rebuilds the plan." },
    { sender: "Fielded", text: "What evidence would help distinguish a process problem from isolated execution mistakes?" },
    { sender: "Maya Thompson", text: "Compare the original sales handover with the implementation plan. You would see the same missing fields across regions, especially technical owner, data readiness and launch constraints." }
  ]
};

const demoDialogue = [
  {
    user: "I manage delivery across four client projects. The main thing is keeping scope, dates and approvals moving.",
    ai: "When approvals slow down, what usually has to wait, and who is affected first?"
  },
  {
    user: "Purchase orders, subcontractor changes and sometimes small design variations. Engineers wait, then delivery slips.",
    ai: "Is the delay mostly because Finance is slow to respond, or because the approval request has to be reworked before Finance can act?"
  },
  {
    user: "Honestly both. Finance can take days, but we also get requests bounced back because the threshold or supporting evidence is unclear.",
    ai: "That distinction matters. If Acme changed one thing about the approval process, what would remove the most wasted time without losing control?"
  }
];

function mission() {
  return seed.missions.find((item) => item.id === state.selectedMissionId) || seed.missions[0];
}

function finding() {
  return seed.findings.find((item) => item.id === state.selectedFindingId) || seed.findings[0];
}

function brandLogo(context = "") {
  return `<div class="brand-mark"><img class="brand-logo" src="/assets/fielded-logo.png" alt="Fielded.ai" />${context ? `<span class="brand-context">${context}</span>` : ""}</div>`;
}

function el(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function mount(html) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(el(html));
  mountExperienceNavigation();
  bindEvents();
  bindExperienceEvents();
  bindEngineEvents();
  bindEnterpriseEvents();
}

function startApp() {
  const path = window.location.pathname;
  if (startExperience(path)) return;
  if (path.startsWith("/hr")) {
    state.role = "hr";
    state.user = seed.users.find((user) => user.role === "hr");
    state.route = path.includes("followups") ? "hr-followups" : path.includes("communications") ? "hr-communications" : path.includes("whistleblowing") ? "hr-communication" : "engine-hr";
  } else if (path.startsWith("/consulting")) {
    state.role = "consultant";
    state.user = seed.users.find((user) => user.role === "consultant");
    state.route = path.includes("market-intelligence") ? "consulting-market" : "engine-consulting";
  } else if (path === "/participant") {
    state.role = "participant";
    state.user = seed.users.find((user) => user.id === "u-pm-a");
    state.route = "participant-home";
  } else if (path.startsWith("/m/") || path.startsWith("/participant/")) {
    state.role = "participant";
    state.user = seed.users.find((user) => user.id === "u-pm-a");
    state.route = "participant";
    initDialogue();
  } else if (path === "/admin") {
    state.role = "manager";
    state.user = seed.users[0];
    state.route = "admin";
    state.adminMode = true;
  }
  render();
}

function render() {
  if (renderExperience()) return;
  if (!state.user && state.route === "login") return renderLogin();
  if (state.route === "participant") return renderParticipant();
  if (state.role === "participant") return renderParticipantDashboard();
  if (state.role === "hr") return renderHR();
  if (state.role === "consultant") return renderConsultant();
  return renderManager();
}

function renderLogin() {
  mount(`
    <main class="login-page">
      <section class="login-art">
        <div class="login-topline">
          ${brandLogo()}
          <span class="demo-badge">Large organisation · Acme Engineering</span>
        </div>
        <div class="login-story">
          <span class="eyebrow on-dark">Organisational intelligence, continuously</span>
          <h1>Give the organisation a way to talk to itself.</h1>
          <p>Fielded engages people in adaptive conversations, converts distributed knowledge into structured intelligence, and helps management investigate, decide and act.</p>
          <div class="system-flow" aria-label="Fielded product model">
            <div><small>Push</small><strong>Explain & align</strong></div>
            <span>→</span>
            <div><small>Pull</small><strong>Listen & question</strong></div>
            <span>→</span>
            <div><small>Understand</small><strong>Connect evidence</strong></div>
          </div>
        </div>
        <div class="login-proof">
          <div><strong>£760k</strong><span>Opportunity surfaced</span></div>
          <div><strong>38</strong><span>People engaged</span></div>
          <div><strong>177</strong><span>Structured observations</span></div>
          <div><strong>10</strong><span>Management findings</span></div>
        </div>
      </section>
      <section class="login-panel">
        <div class="auth-card">
          <span class="eyebrow">Acme Engineering · Enterprise workspace</span>
          <h2>Enter the Fielded workspace</h2>
          <p>Select a role to see the same organisation through the work each person needs to do.</p>
          <div class="role-grid">
            <button class="role-card active" data-role="manager"><span class="role-kicker">Management</span><strong>Harriet Cole, CEO</strong><span>Create Missions, monitor intelligence and interrogate the evidence.</span></button>
            <button class="role-card" data-role="participant"><span class="role-kicker">Participant</span><strong>Priya Nair, PM</strong><span>Join privately, control confidentiality and approve the extracted summary.</span></button>
            <button class="role-card" data-role="hr"><span class="role-kicker">HR & People</span><strong>Aisha Rahman, Director</strong><span>Push critical policy communications, confirm understanding and act on employee feedback.</span></button>
          </div>
          <div class="demo-access">
            <div><span>Workspace</span><strong>Acme Engineering</strong></div>
            <div><span>Demo data</span><strong>Fully seeded · fictional</strong></div>
          </div>
          <div class="button-row">
            <button class="btn accent btn-wide" data-action="signin">Continue to Acme</button>
          </div>
          <p class="auth-note">Public preview with fictional Acme data. Production workspaces require tenant-scoped identity, permissions and approved integrations.</p>
        </div>
      </section>
    </main>
  `);
}

function navItems() {
  const items = [
    ["engine-manager", "My Fielded engineer", "F"],
    ["live-overview", "Fielded Live Overview", "00"],
    ["dashboard", "Mission Overview", "01"],
    ["create", "Create Mission", "02"],
    ["intelligence", "Mission Intelligence", "03"],
    ["findings", "Findings", "04"],
    ["ask", "Ask Fielded", "05"],
    ["admin", "Admin", "···"]
  ];
  return items
    .map(([route, label, index]) => `<button class="nav-item ${state.route === route ? "active" : ""}" data-nav="${route}"><span>${index}</span>${label}</button>`)
    .join("");
}

function renderManager() {
  const m = mission();
  const isEngineer = state.route === "engine-manager";
  mount(`
    <div class="layout">
      <aside class="sidebar">
        ${brandLogo()}
        <div class="workspace-switch"><span>Organisation</span><strong>${seed.organization.name}</strong><small>Continuous organisational dialogue</small></div>
        <nav class="nav-list">${navItems()}</nav>
        <div class="sidebar-foot">
          <span class="system-status"><i></i> Intelligence layer active</span>
          <small>${seed.organization.employees} employees · 5 departments<br />Last synthesis: 8 minutes ago</small>
        </div>
      </aside>
      <section>
        <div class="mobile-nav">${navItems()}</div>
        <header class="topbar">
          <div>
            <span class="topbar-label">${isEngineer ? "Your Fielded workspace" : state.route === "live-overview" ? "Organisation-wide intelligence" : "Active Mission"}</span>
            <strong>${isEngineer ? "Acme Engineering" : state.route === "live-overview" ? "Fielded engine · Acme Engineering" : m.title}</strong>
          </div>
          <div class="topbar-center"><span class="live-dot"></span>${isEngineer ? "Your perspective, in context" : state.route === "live-overview" ? "Permission-aware intelligence · Simulated activity" : `${m.completed} of ${m.invited} conversations complete`}</div>
          <div class="identity">
            <div class="avatar">${state.user.name.split(" ").map((part) => part[0]).join("")}</div>
            <div><strong>${state.user.name}</strong><br /><span class="muted">${state.user.jobTitle}</span></div>
          </div>
        </header>
        <main class="main">${managerView()}</main>
      </section>
    </div>
  `);
}

function managerView() {
  if (state.route === "engine-manager") return engineView("manager");
  if (state.route === "live-overview") return liveOverviewView();
  if (state.route === "create") return createMissionView();
  if (state.route === "intelligence") return intelligenceView();
  if (state.route === "findings") return findingsView();
  if (state.route === "ask") return askView();
  if (state.route === "admin") return adminView();
  return dashboardView();
}

function dashboardView() {
  const active = seed.missions.filter((item) => item.status === "active");
  return `
    <div class="view-title">
      <div>
        <span class="eyebrow">Acme organisational intelligence</span>
        <h1>Good morning, Harriet.</h1>
        <p>Three Missions are converting 38 distributed perspectives into a decision-ready view of how Acme actually works.</p>
      </div>
      <div class="title-actions"><span class="updated-label">Updated 8 min ago</span><button class="btn accent" data-nav="create">Create a Mission</button></div>
    </div>
    <section class="executive-strip">
      <div class="exec-lead"><span>Potential annual value identified</span><strong>£760k</strong><small>Across margin recovery, process time and customer expansion</small></div>
      <div class="exec-stat"><span>Active Missions</span><strong>${active.length}</strong><small>1 awaiting follow-up</small></div>
      <div class="exec-stat"><span>Participation</span><strong>76%</strong><small>38 of 50 invited</small></div>
      <div class="exec-stat"><span>Evidence base</span><strong>177</strong><small>Permitted observations</small></div>
      <div class="exec-stat"><span>Decision signals</span><strong>10</strong><small>6 high confidence</small></div>
    </section>
    <section class="dashboard-grid">
      <div class="mission-list surface-section">
        <div class="section-head"><div><span class="eyebrow">Mission portfolio</span><h2>What Acme is investigating</h2></div><span class="count-label">${seed.missions.length} Missions</span></div>
        ${seed.missions.map(missionCard).join("")}
      </div>
      <aside class="dashboard-rail">
        <section class="pulse-panel">
          <div class="section-head"><div><span class="eyebrow">Organisational pulse</span><h3>Evidence is converging</h3></div><span class="pulse-score">82</span></div>
          <p class="muted">Cross-functional agreement is strengthening around approval rework and scope-change leakage.</p>
          <div class="coverage-row"><span>Finance</span><div><i style="width:88%"></i></div><strong>88%</strong></div>
          <div class="coverage-row"><span>Operations</span><div><i style="width:91%"></i></div><strong>91%</strong></div>
          <div class="coverage-row"><span>Engineering</span><div><i style="width:72%"></i></div><strong>72%</strong></div>
          <div class="coverage-row"><span>Sales</span><div><i style="width:64%"></i></div><strong>64%</strong></div>
          <div class="coverage-row"><span>Procurement</span><div><i style="width:79%"></i></div><strong>79%</strong></div>
        </section>
        <section class="activity">
          <div class="section-head"><h3>Intelligence feed</h3><span class="pill contribute">Live</span></div>
          <div class="activity-item"><span class="activity-type contradiction">Contradiction</span><strong>Approval delay has two causes</strong><p>Operations reports waiting; Finance reports repeated rework.</p><small>4 minutes ago · Margin Review</small></div>
          <div class="activity-item"><span class="activity-type finding">Finding</span><strong>Scope leakage promoted</strong><p>Independent Sales and Engineering evidence now meets the review threshold.</p><small>18 minutes ago · Margin Review</small></div>
          <div class="activity-item"><span class="activity-type evidence">Evidence</span><strong>6 observations synthesised</strong><p>New Operations conversations strengthened the reporting-load theme.</p><small>32 minutes ago · Cost Review</small></div>
        </section>
      </aside>
    </section>
    <section class="interface-model">
      <div><span class="eyebrow">Fielded intelligence layer</span><h2>One interface, two directions, cumulative understanding</h2></div>
      <div class="interface-steps">
        <article><span>01 · Push</span><strong>Communicate & verify</strong><p>Explain strategy, policy and decisions. Confirm understanding and action.</p></article>
        <article><span>02 · Pull</span><strong>Listen & investigate</strong><p>Ask adaptive questions, surface risks and gather operational knowledge.</p></article>
        <article><span>03 · Understand</span><strong>Connect & recommend</strong><p>Identify consensus, contradiction, dependencies and the next best question.</p></article>
      </div>
    </section>
  `;
}

function missionCard(item) {
  const pct = Math.round((item.completed / item.invited) * 100);
  const signal = {
    "mission-margin": { value: "£420k", label: "margin opportunity", confidence: "High", phase: "Synthesising", color: "teal" },
    "mission-cost": { value: "£190k", label: "annual efficiency", confidence: "Medium", phase: "Discovering", color: "blue" },
    "mission-retention": { value: "£150k", label: "revenue opportunity", confidence: "High", phase: "Action ready", color: "green" }
  }[item.id];
  return `
    <article class="mission-card">
      <header>
        <div class="mission-title"><span class="mission-status ${signal.color}">${signal.phase}</span><h3>${item.title}</h3><p>${item.objective}</p></div>
        <div class="mission-value"><strong>${signal.value}</strong><span>${signal.label}</span></div>
      </header>
      <div class="mission-progress-row">
        <div class="progress-copy"><span>Participation</span><strong>${pct}%</strong></div>
        <div class="progress-bar"><span style="width:${pct}%"></span></div>
      </div>
      <div class="mission-footer">
        <div class="mission-metrics"><span><strong>${item.completed}/${item.invited}</strong> conversations</span><span><strong>${item.observations}</strong> observations</span><span><strong>${item.themes}</strong> themes</span><span><strong>${item.contradictions}</strong> contradictions</span></div>
        <button class="btn secondary" data-open-mission="${item.id}">Open intelligence</button>
      </div>
    </article>
  `;
}

function createMissionView() {
  const brief = state.missionDraft || {
    title: "Project Margin Review",
    objective: "Why have our project margins declined?",
    understanding: "Identify recurring delivery, pricing, approval and scope-management factors that may be reducing project margins, while distinguishing executive assumptions from operational evidence.",
    departments: ["Finance", "Operations", "Procurement", "Sales", "Engineering"],
    participants: ["CFO", "Operations Director", "Finance Manager", "Sales Director", "Project Managers", "Procurement Lead", "Engineers"]
  };
  return `
    <div class="view-title">
      <div>
        <span class="eyebrow">Mission design</span>
        <h1>Create a Mission</h1>
        <p>Turn a management objective into a distributed investigation with adaptive questioning, explicit permissions and decision-ready outputs.</p>
      </div>
    </div>
    <section class="mission-templates">
      <button type="button"><span>Margin</span><strong>Recover project margin</strong><small>Pricing · Scope · Delivery</small></button>
      <button type="button"><span>Operations</span><strong>Find process bottlenecks</strong><small>Time · Rework · Dependencies</small></button>
      <button type="button"><span>AI opportunity</span><strong>Map automation value</strong><small>Workflows · Risk · Readiness</small></button>
      <button type="button"><span>People</span><strong>Verify policy understanding</strong><small>Alignment · Trust · Action</small></button>
    </section>
    <section class="mission-form">
      <form class="panel-box" data-form="mission">
        <div class="form-section-title"><span>01</span><div><strong>Define the decision</strong><small>Start with what management needs to understand, not a list of survey questions.</small></div></div>
        <div class="form-row"><label>Mission title</label><input name="title" value="${brief.title}" /></div>
        <div class="form-row"><label>What do you want Fielded to understand?</label><textarea name="objective">${brief.objective}</textarea></div>
        <div class="form-split"><div class="form-row"><label>Why does this matter?</label><textarea name="why">Margins have declined across complex projects and leadership needs evidence before acting.</textarea></div><div class="form-row"><label>What outcome are you looking for?</label><textarea name="outcome">A credible view of root causes, contradictions and practical next actions.</textarea></div></div>
        <div class="form-section-title"><span>02</span><div><strong>Define the evidence field</strong><small>Fielded will adapt questions as agreement, contradiction and evidence gaps emerge.</small></div></div>
        <div class="form-row"><label>Which departments should Fielded engage?</label><input name="departments" value="${brief.departments.join(", ")}" /></div>
        <div class="form-row"><label>Who should participate?</label><input name="participants" value="${brief.participants.join(", ")}" /></div>
        <div class="form-row"><label>Any context Fielded should know?</label><textarea name="context">The CEO believes procurement prices increased. Finance suspects project overruns. Operations believes approvals are the issue.</textarea></div>
        <div class="button-row">
          <button class="btn secondary" type="button" data-action="generate-brief">Generate Mission Brief</button>
          <button class="btn accent" type="button" data-action="launch-mission">Launch Mission</button>
        </div>
      </form>
      <aside class="mission-brief">
        <div class="brief-state"><span class="live-dot"></span>Mission brief ready for review</div>
        <span class="eyebrow">Fielded-generated brief</span>
        <h2>${brief.title}</h2>
        <div class="brief-card"><strong>Fielded understands the objective as:</strong>${brief.understanding}</div>
        <div class="brief-card"><strong>Evidence strategy</strong><div class="brief-flow"><span>Discover</span><i></i><span>Corroborate</span><i></i><span>Challenge</span><i></i><span>Synthesise</span></div></div>
        <div class="brief-card"><strong>Proposed participant cohort</strong>${brief.participants.join(" · ")}</div>
        <div class="brief-card governance-card"><strong>Trust policy</strong><span>PRIVATE remains personal</span><span>CONTRIBUTE enters anonymous synthesis</span><span>SHARE may be attributed</span></div>
        <div class="brief-card link-card"><strong>Shareable participant URL</strong><code>${participantUrl()}</code></div>
        <div class="button-row"><button class="btn secondary" data-action="copy-link">Copy Mission Link</button><button class="btn ghost" data-nav="participant">Preview Participant Flow</button></div>
      </aside>
    </section>
  `;
}

function participantUrl() {
  return `${window.location.origin}/m/${mission().slug}`;
}

function intelligenceView() {
  const m = mission();
  return `
    <div class="view-title">
      <div>
        <span class="eyebrow">Live Mission intelligence</span>
        <h1>${m.title}</h1>
        <p>${m.context}</p>
      </div>
      <div class="title-actions"><span class="mission-status teal">Synthesising</span><button class="btn accent" data-action="investigate">Investigate further</button></div>
    </div>
    <section class="mission-command">
      <div class="command-progress"><div class="progress-ring" style="--progress:80"><strong>80%</strong><span>participation</span></div><div><span class="eyebrow">Evidence sufficiency</span><h2>Strong enough to act on two findings</h2><p>Coverage is broad across Operations and Finance. Fielded is still testing the commercial impact of scope-change leakage.</p></div></div>
      <div class="command-metric"><span>Potential value</span><strong>£420k</strong><small>Annual margin recovery</small></div>
      <div class="command-metric"><span>Evidence</span><strong>${m.observations}</strong><small>${m.completed} independent voices</small></div>
      <div class="command-metric"><span>Signals</span><strong>${m.themes + m.contradictions}</strong><small>${m.themes} themes · ${m.contradictions} tensions</small></div>
      <div class="command-metric"><span>Confidence</span><strong>78%</strong><small>Up 12 points this week</small></div>
    </section>
    <section class="decision-brief">
      <div><span class="eyebrow">What Fielded currently understands</span><h2>Margin decline is not one problem. It is a chain of preventable leakage.</h2><p>Evidence points to four connected conditions: duplicated reporting obscures early warning signs, approval rework delays delivery, scope changes escape commercial control, and pricing decisions happen before delivery complexity is fully understood.</p></div>
      <aside><span>Management implication</span><strong>Fix decision quality before adding capacity.</strong><p>Current evidence does not support the initial assumption that procurement pricing is the primary cause.</p></aside>
    </section>
    <section class="coverage-panel">
      <div class="section-head"><div><span class="eyebrow">Evidence coverage</span><h2>Where the organisation agrees, differs and remains silent</h2></div><span class="count-label">5 departments</span></div>
      <div class="coverage-matrix">
        <div><span>Department</span><span>Voices</span><span>Coverage</span><span>Dominant signal</span><span>Confidence</span></div>
        <div><strong>Operations</strong><span>4 / 4</span><span><i style="width:96%"></i></span><span>Approval and reporting friction</span><b>High</b></div>
        <div><strong>Finance</strong><span>2 / 2</span><span><i style="width:91%"></i></span><span>Submission quality and control</span><b>High</b></div>
        <div><strong>Engineering</strong><span>2 / 2</span><span><i style="width:78%"></i></span><span>Late scope change</span><b>Medium</b></div>
        <div><strong>Sales</strong><span>1 / 1</span><span><i style="width:64%"></i></span><span>Pre-sales estimation risk</span><b>Medium</b></div>
        <div><strong>Procurement</strong><span>1 / 1</span><span><i style="width:83%"></i></span><span>Over-centralised authority</span><b>High</b></div>
      </div>
    </section>
    <section class="intelligence-grid">
      <div class="stack intelligence-column">
        <div class="column-title"><div><span class="eyebrow">Themes</span><h2>Patterns across permitted evidence</h2></div><span>${seed.themes.length}</span></div>
        ${seed.themes.map(themeCard).join("")}
      </div>
      <div class="stack intelligence-column">
        <div class="column-title"><div><span class="eyebrow">Hypotheses</span><h2>What Fielded is actively testing</h2></div><span>${seed.hypotheses.length}</span></div>
        ${seed.hypotheses.map(hypothesisCard).join("")}
        <div class="panel-box" id="investigationPlan">
          <div class="section-head"><div><span class="eyebrow">Recommended investigation</span><h3>Resolve the approval contradiction</h3></div><span class="pill">5 conversations</span></div>
          <p class="muted">Fielded recommends a targeted follow-up with 2 Project Managers, 2 Finance Controllers and 1 Procurement Manager.</p>
          <div class="investigation-steps"><span><b>01</b>What evidence is missing before Finance can approve?</span><span><b>02</b>Which thresholds create low-value delay?</span><span><b>03</b>Where does request rework begin?</span></div>
          <button class="btn accent" data-action="rerun">Launch follow-up Mission</button>
        </div>
      </div>
    </section>
  `;
}

function themeCard(item) {
  return `
    <article class="theme-card">
      <header><div><span class="theme-index">Theme ${String(seed.themes.indexOf(item) + 1).padStart(2, "0")}</span><h3>${item.title}</h3></div><span class="confidence-label ${item.confidence.toLowerCase()}">${item.confidence}</span></header>
      <p class="muted">${item.description}</p>
      <div class="theme-meter">
        <div><span>Independent corroboration</span><div class="progress-bar"><i style="width:${Math.min(100, item.participantCount * 11)}%"></i></div></div>
        <strong>${item.participantCount}<small>voices</small></strong>
      </div>
      <div class="meta-row">
        ${item.departments.map((dept) => `<span class="pill">${dept}</span>`).join("")}
        <span class="evidence-count">${item.evidenceCount} observations</span>
      </div>
    </article>
  `;
}

function hypothesisCard(item) {
  return `
    <article class="hypothesis-card">
      <header><div><span class="theme-index">Active hypothesis</span><h3>${item.title}</h3></div><span class="mission-status blue">${item.status}</span></header>
      <p class="muted">${item.description}</p>
      <div class="evidence-balance">
        <div><span>Supporting</span><strong>${item.evidenceFor}</strong></div>
        <div><span>Challenging</span><strong>${item.evidenceAgainst}</strong></div>
        <div><span>Confidence</span><strong>${item.confidence}</strong></div>
      </div>
      <div class="next-evidence"><span>Next best evidence</span><strong>${item.nextEvidence}</strong></div>
    </article>
  `;
}

function findingsView() {
  const selected = finding();
  return `
    <div class="view-title">
      <div>
        <span class="eyebrow">Decision intelligence</span>
        <h1>Findings management can interrogate.</h1>
        <p>Every conclusion is grounded in permitted observations, independent corroboration and a visible confidence rationale.</p>
      </div>
      <button class="btn secondary" data-nav="ask">Ask Fielded</button>
    </div>
    <section class="finding-layout">
      <aside class="finding-index">
        <div class="section-head"><div><span class="eyebrow">Mission findings</span><h2>Project Margin Review</h2></div><span class="count-label">3</span></div>
        ${seed.findings.map(findingCard).join("")}
      </aside>
      <div class="finding-main">
        <div class="finding-topline"><span class="mission-status green">Action ready</span><span>Finding ${seed.findings.indexOf(selected) + 1} of ${seed.findings.length}</span></div>
        <h2>${selected.title}</h2>
        <p class="finding-summary">${selected.summary}</p>
        <div class="finding-scorecard">
          <div><span>Confidence</span><strong>${selected.confidence}</strong><small>14 permitted observations</small></div>
          <div><span>Business impact</span><strong>${selected.impact}</strong><small>Delivery and margin</small></div>
          <div><span>Corroboration</span><strong>${selected.raisedBy}</strong><small>Independent participants</small></div>
          <div><span>Departments</span><strong>${selected.departments.length}</strong><small>${selected.departments.join(" · ")}</small></div>
        </div>
        <section class="reasoning-block">
          <span class="eyebrow">Why Fielded believes this</span>
          <h3>The delay is real, but Finance capacity is not the sole cause.</h3>
          <p>${selected.evidenceSummary}</p>
          <div class="evidence-trail">
            <div><span class="evidence-source operations">Operations</span><p>Approvals routinely take several days and hold delivery decisions.</p><small>6 observations · direct experience</small></div>
            <div><span class="evidence-source finance">Finance</span><p>Requests often arrive with missing evidence or inconsistent threshold interpretation.</p><small>5 observations · direct experience</small></div>
            <div><span class="evidence-source procurement">Procurement</span><p>Low-risk changes follow the same authority path as material supplier decisions.</p><small>3 observations · shared evidence</small></div>
          </div>
        </section>
        <section class="contradiction-block">
          <div><span class="eyebrow">Contradiction retained</span><h3>Where responsibility for delay begins</h3></div>
          <p>Operations experiences Finance as the bottleneck. Finance sees incomplete requests as the cause. Fielded preserves both perspectives and recommends measuring rework before reallocating capacity.</p>
        </section>
        <section class="action-block">
          <div><span class="eyebrow">Recommended action</span><h3>${selected.recommendedAction}</h3></div>
          <div class="action-value"><span>Indicative value</span><strong>£180k</strong><small>annual margin and time recovery</small></div>
        </section>
        <div class="button-row"><button class="btn accent" data-nav="ask">Ask Fielded about this finding</button><button class="btn secondary" data-action="investigate">Investigate further</button></div>
        <div class="governance-note"><strong>Governance note</strong>This finding uses CONTRIBUTED and SHARED observations only. PRIVATE content and participant identities are excluded from management retrieval.</div>
      </div>
    </section>
  `;
}

function findingCard(item) {
  return `
    <button class="finding-card ${state.selectedFindingId === item.id ? "selected" : ""}" data-open-finding="${item.id}">
      <span class="finding-card-meta"><b>${item.impact} impact</b><i>${item.confidence} confidence</i></span>
      <strong>${item.title}</strong>
      <p>${item.summary}</p>
      <span class="finding-card-foot">${item.raisedBy} voices · ${item.departments.length} departments <b>→</b></span>
    </button>
  `;
}

function askView() {
  const selected = finding();
  const answer =
    state.askAnswer ||
    "Fielded is ready to explain how this conclusion was formed, where the evidence is weak, which departments disagree, or what management should investigate next.";
  return `
    <div class="view-title">
      <div>
        <span class="eyebrow">Management interrogation</span>
        <h1>Ask Fielded.</h1>
        <p>Reason across organisational evidence without exposing private participant conversations.</p>
      </div>
      <div class="permission-state"><span class="live-dot"></span>Permitted evidence only</div>
    </div>
    <section class="ask-layout">
      <aside class="ask-context">
        <span class="eyebrow">Current evidence context</span>
        <h2>${selected.title}</h2>
        <p>${selected.summary}</p>
        <div class="context-metrics"><div><span>Observations</span><strong>14</strong></div><div><span>Departments</span><strong>3</strong></div><div><span>Confidence</span><strong>High</strong></div></div>
        <div class="context-policy"><strong>Retrieval policy</strong><span><i class="private-dot"></i> PRIVATE excluded</span><span><i class="contribute-dot"></i> CONTRIBUTED anonymised</span><span><i class="share-dot"></i> SHARED attributable</span></div>
      </aside>
      <section class="ask-panel">
        <div class="fielded-answer">
          <div class="answer-avatar">F</div>
          <div><span>Fielded · Evidence analyst</span><p>${answer}</p>${state.askAnswer ? `<div class="answer-sources"><span>Operations · 6 observations</span><span>Finance · 5 observations</span><span>Procurement · 3 observations</span></div>` : ""}</div>
        </div>
      <div class="examples">
        ${["Why did you reach this conclusion?", "Which departments disagree?", "What evidence is weakest?", "What should we investigate next?", "What might save the most money?"].map((q) => `<button class="example-btn" data-question="${q}">${q}</button>`).join("")}
      </div>
      <div class="composer">
        <input id="askInput" value="Why did you reach this conclusion?" aria-label="Ask Fielded" />
        <button class="btn accent" data-action="ask">Ask Fielded</button>
      </div>
      <small class="composer-note">Answers cite permitted evidence and retain unresolved contradictions.</small>
      </section>
    </section>
  `;
}

function adminView() {
  return `
    <div class="view-title">
      <div>
        <span class="eyebrow">Hidden admin layer</span>
        <h1>Intelligence operations</h1>
        <p>This layer keeps a human inside the reasoning loop for pilots: inspect, rerun, merge, approve and request follow-up.</p>
      </div>
      <button class="btn warn" data-action="rerun">Re-run analysis</button>
    </div>
    <section class="admin-summary">
      <div><span>Analysis run</span><strong>v14.8</strong><small>Completed 8 minutes ago</small></div><div><span>Human review</span><strong>3</strong><small>Items awaiting approval</small></div><div><span>Private records</span><strong>17</strong><small>Excluded from synthesis</small></div><div><span>Model gateway</span><strong>Healthy</strong><small>Minimum-context policy active</small></div>
    </section>
    <section class="admin-grid">
      ${["Missions", "Participants", "Conversations", "Observations", "Themes", "Hypotheses", "Findings", "Follow-up requests", "Approvals"].map((title, index) => `<article class="admin-card"><span class="admin-index">${String(index + 1).padStart(2, "0")}</span><h3>${title}</h3><p class="muted">Review and edit ${title.toLowerCase()} before customer-visible synthesis changes.</p><button class="btn secondary">Open</button></article>`).join("")}
    </section>
    <section class="panel-box" style="margin-top:18px">
      <div class="section-head"><h3>Extracted observations</h3><span class="pill contribute">PRIVATE excluded</span></div>
      <table class="table">
        <thead><tr><th>Category</th><th>Summary</th><th>Source</th><th>Confidentiality</th><th>Confidence</th></tr></thead>
        <tbody>
          ${seed.observations.map((obs) => `<tr><td>${obs.category}</td><td>${obs.summary}</td><td>${obs.department} · ${obs.sourceType}</td><td><span class="pill ${obs.confidentiality.toLowerCase()}">${obs.confidentiality}</span></td><td>${Math.round(obs.confidence * 100)}%</td></tr>`).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function initDialogue() {
  if (state.dialogueMessages.length) return;
  state.dialogueMessages = [
    {
      sender: "ai",
      content:
        "I'd like to understand how work actually happens from your perspective. There are no right answers. I'll ask follow-up questions where something seems important. Tell me briefly what you are responsible for."
    }
  ];
}

function renderParticipantDashboard() {
  mount(renderEnterpriseParticipantDashboard());
}

function renderParticipant() {
  initDialogue();
  const m = mission();
  mount(`
    <main class="participant-page">
      <header class="participant-hero">
        <div class="participant-wrap">
          <div class="participant-topline">${brandLogo()}<div class="participant-hero-actions"><span>Acme Engineering · Secure Mission</span><button class="btn participant-back" data-action="participant-home">Back to my dashboard</button></div></div>
          <div class="participant-intro"><span class="eyebrow on-dark">Your operational knowledge matters</span><h1>Help Acme understand why project margins have declined.</h1><p>This is an adaptive conversation, not a survey. Fielded will follow the evidence and ask where your experience can clarify how work actually happens.</p></div>
          <div class="participant-progress"><span class="active">1 · Choose privacy</span><i></i><span class="active">2 · Conversation</span><i></i><span>3 · Review summary</span></div>
        </div>
      </header>
      <section class="participant-wrap participant-card">
        <aside class="participant-trust">
          <span class="eyebrow">You remain in control</span>
          <h2>Choose how this conversation can be used.</h2>
          <p class="muted">Your choice can be changed during the conversation. Private content never enters management synthesis.</p>
          <div class="confidentiality-grid">
            ${confOption("PRIVATE", "Just for you. Used only to support your own Fielded experience.")}
            ${confOption("CONTRIBUTE", "Help improve Acme. Insights may be aggregated without identifying you.")}
            ${confOption("SHARE", "Explicitly visible. Your words may be attributed where appropriate.")}
          </div>
          <div class="trust-assurance"><strong>Fielded analyses organisations before individuals.</strong><span>No employee scoring</span><span>Private content excluded</span><span>Human review for material decisions</span></div>
          <div class="participant-profile"><div class="avatar">PN</div><div><strong>${state.user.name}</strong><span>${state.user.jobTitle} · ${state.user.department}</span></div></div>
          <button class="btn ghost" data-action="manager-demo">Manager demo</button>
        </aside>
        <section class="dialogue-panel">
          ${state.dialogueCompleted ? summaryView() : dialogueView()}
        </section>
      </section>
    </main>
  `);
}

function confOption(key, copy) {
  const labels = { PRIVATE: "Just for me", CONTRIBUTE: "Contribute confidentially", SHARE: "Share with attribution" };
  return `<button class="conf-option ${key.toLowerCase()} ${state.selectedConfidentiality === key ? "active" : ""}" data-conf="${key}"><span class="conf-indicator"></span><div><small>${key}</small><strong>${labels[key]}</strong><span>${copy}</span></div></button>`;
}

function dialogueView() {
  return `
    <div class="dialogue-head">
      <div class="dialogue-identity"><span class="answer-avatar">F</span><div><strong>Fielded</strong><span>Adaptive Mission dialogue</span></div></div>
      <span class="pill ${state.selectedConfidentiality.toLowerCase()}">${state.selectedConfidentiality === "PRIVATE" ? "Private to you" : state.selectedConfidentiality === "SHARE" ? "Sharing with attribution" : "Contributing confidentially"}</span>
    </div>
    <div class="mission-prompt"><span>Mission objective</span><strong>${mission().objective}</strong></div>
    <div class="messages">
      ${state.dialogueMessages.map((msg) => `<div class="message-row ${msg.sender}">${msg.sender === "ai" ? `<span class="message-avatar">F</span>` : ""}<div class="message ${msg.sender}">${xEscape(msg.content)}${msg.attachments?.length ? `<div class="d-message-files">${msg.attachments.map(file => engineFileCard(file, "mission")).join("")}</div>` : ""}</div></div>`).join("")}
    </div>
    <div class="composer">
      <input id="messageInput" value="${xEscape(engineDraft("mission", nextDemoAnswer()))}" aria-label="Message Fielded" />
      <div class="composer-actions">
        ${engineMediaControls("mission")}
        <button class="btn accent" data-action="send-message">${state.dialogueMessages.filter((msg) => msg.sender === "user").length >= 3 ? "Finish" : "Send"}</button>
      </div>
    </div>
    ${engineMediaTray("mission")}
    <p class="d-notice" role="status">${xEscape(engineThread("mission").notice)}</p>
    <div class="dialogue-foot"><span>Fielded may ask follow-up questions to corroborate or challenge emerging evidence.</span><span>About 4 minutes remaining</span></div>
  `;
}

function nextDemoAnswer() {
  const count = state.dialogueMessages.filter((msg) => msg.sender === "user").length;
  return demoDialogue[count]?.user || "Yes, that summary is accurate.";
}

function summaryView() {
  return `
    <div class="dialogue-head">
      <div class="dialogue-identity"><span class="answer-avatar">F</span><div><strong>Review what Fielded understood</strong><span>You approve the summary before observations are extracted</span></div></div>
      <span class="pill ${state.selectedConfidentiality.toLowerCase()}">${state.selectedConfidentiality}</span>
    </div>
    <div class="summary-intro"><span class="eyebrow">Your conversation summary</span><h2>Does this accurately represent your experience?</h2><p>You can remove or edit any point. Only the approved summary is used according to your selected confidentiality state.</p></div>
    <div class="summary-list">
      ${state.summaryItems.map((item, index) => `<div class="summary-item"><span class="summary-number">${String(index + 1).padStart(2, "0")}</span><span>${item}</span><button class="btn ghost" data-remove-summary="${index}">Remove</button></div>`).join("")}
    </div>
    <div class="summary-policy"><strong>On approval</strong><span>Fielded will extract structured observations, remove identifying details for CONTRIBUTED evidence, and retain a traceable link to this approved summary for audit.</span></div>
    <div class="button-row" style="margin-top:18px">
      <button class="btn accent" data-action="approve-summary">Yes, extract observations</button>
      <button class="btn secondary" data-action="edit-summary">Edit</button>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => {
      state.role = button.dataset.role;
      document.querySelectorAll("[data-role]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      state.route = button.dataset.nav;
      if (state.route === "participant") {
        state.role = "participant";
        state.user = seed.users.find((user) => user.id === "u-pm-a");
      }
      render();
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll("[data-open-mission]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMissionId = button.dataset.openMission;
      state.route = "intelligence";
      render();
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll("[data-open-participant-mission]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMissionId = button.dataset.openParticipantMission;
      state.route = "participant";
      initDialogue();
      render();
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll("[data-open-finding]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedFindingId = button.dataset.openFinding;
      render();
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll("[data-consult-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      state.route = button.dataset.consultNav;
      render();
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll("[data-open-engagement]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedEngagementId = button.dataset.openEngagement;
      state.route = "consulting-engagement";
      render();
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll("[data-open-interview]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedInterviewId = button.dataset.openInterview;
      state.route = "consulting-interviews";
      render();
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll("[data-consult-action]").forEach((button) => {
    button.addEventListener("click", () => handleConsultingAction(button.dataset.consultAction));
  });

  document.querySelectorAll("[data-market-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMarketTab = button.dataset.marketTab;
      render();
    });
  });

  document.querySelectorAll("[data-hr-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      state.route = button.dataset.hrNav;
      render();
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll("[data-open-policy]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPolicyId = button.dataset.openPolicy;
      state.route = "hr-communication";
      render();
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll("[data-hr-action]").forEach((button) => {
    button.addEventListener("click", () => handleHRAction(button.dataset.hrAction));
  });

  document.querySelectorAll("[data-conf]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedConfidentiality = button.dataset.conf;
      render();
    });
  });

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById("askInput");
      if (input) input.value = button.dataset.question;
    });
  });

  document.querySelectorAll("[data-remove-summary]").forEach((button) => {
    button.addEventListener("click", () => {
      state.summaryItems.splice(Number(button.dataset.removeSummary), 1);
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action));
  });
}

function handleAction(action) {
  if (action === "signin" || action === "signup") {
    if (state.role === "participant") {
      state.user = seed.users.find((user) => user.id === "u-pm-a");
      state.route = "participant-home";
    } else if (state.role === "consultant") {
      state.user = seed.users.find((user) => user.role === "consultant");
      state.route = "engine-consulting";
    } else if (state.role === "hr") {
      state.user = seed.users.find((user) => user.role === "hr");
      state.route = "engine-hr";
    } else {
      state.user = seed.users[0];
      state.route = "engine-manager";
    }
    render();
    window.scrollTo(0, 0);
  }

  if (action === "manager-demo") {
    state.role = "manager";
    state.user = seed.users[0];
    state.route = "dashboard";
    render();
    window.scrollTo(0, 0);
  }

  if (action === "participant-home") {
    state.role = "participant";
    state.user = seed.users.find((user) => user.id === "u-pm-a");
    state.route = "participant-home";
    render();
    window.scrollTo(0, 0);
  }

  if (action === "participant-policy-preview") {
    enterpriseOpenTask("followup-reporting-route");
  }

  if (action === "record-voice") {
    buttonToast("Voice note ready to record");
  }

  if (action === "upload-file") {
    buttonToast("Upload project files, documents or data");
  }

  if (action === "open-camera") {
    buttonToast("Camera ready for visual evidence");
  }

  if (action === "generate-brief") {
    const form = document.querySelector("[data-form='mission']");
    const data = new FormData(form);
    state.missionDraft = {
      title: data.get("title") || "New Mission",
      objective: data.get("objective") || "Understand an organisational question.",
      understanding:
        "Identify recurring operational evidence, contradictions, unresolved hypotheses and practical next steps related to the mission objective, while excluding private participant content from synthesis.",
      departments: String(data.get("departments") || "Finance, Operations").split(",").map((item) => item.trim()),
      participants: String(data.get("participants") || "Managers, Participants").split(",").map((item) => item.trim())
    };
    render();
  }

  if (action === "launch-mission") {
    state.route = "intelligence";
    render();
  }

  if (action === "copy-link") {
    navigator.clipboard?.writeText(participantUrl());
    buttonToast("Participant URL copied");
  }

  if (action === "send-message") {
    const input = document.getElementById("messageInput");
    const answer = input?.value?.trim() || nextDemoAnswer();
    const userCount = state.dialogueMessages.filter((msg) => msg.sender === "user").length;
    state.dialogueMessages.push({ sender: "user", content: answer, attachments: engineTakeAttachments("mission") });
    if (userCount >= 2) {
      state.dialogueCompleted = true;
    } else {
      state.dialogueMessages.push({ sender: "ai", content: demoDialogue[userCount]?.ai || demoDialogue.at(-1).ai });
    }
    render();
  }

  if (action === "approve-summary") {
    state.role = "manager";
    state.user = seed.users[0];
    state.route = "intelligence";
    seed.missions[0].completed = Math.min(seed.missions[0].invited, seed.missions[0].completed + 1);
    seed.missions[0].observations += 4;
    render();
    window.scrollTo(0, 0);
  }

  if (action === "edit-summary") {
    state.summaryItems[0] = "Weekly reporting requires duplicate entry across Salesforce, Excel and the project tracker, taking around five hours per week.";
    render();
  }

  if (action === "ask") {
    const q = document.getElementById("askInput")?.value || "";
    state.askAnswer = answerQuestion(q);
    render();
  }

  if (action === "investigate") {
    state.route = "intelligence";
    render();
    setTimeout(() => document.getElementById("investigationPlan")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  if (action === "rerun") {
    buttonToast("Analysis queued for review");
  }
}

function handleConsultingAction(action) {
  const messages = {
    "new-engagement": "New engagement workspace ready",
    "approve-plan": "Digital fieldwork plan approved",
    "add-requirement": "Data requirement added to draft",
    "flag-interview": "Interview flagged for consultant review",
    "accept-finding": "Finding accepted into the engagement",
    "investigate-finding": "Targeted follow-up queued",
    "dismiss-finding": "Finding moved out of active analysis",
    "export-brief": "Client evidence brief generated",
    "approve-recommendation": "Recommendation added to the client brief",
    "edit-recommendation": "Recommendation opened for editing",
    "export-market-report": "Evidence-backed company dossier generated",
    "approve-market-finding": "Finding approved for the consultant evidence base",
    "reject-market-finding": "Finding excluded from the report",
    "source-jump": "Verified source passage highlighted in the transcript"
  };
  buttonToast(messages[action] || "Consulting workspace updated");
}

function handleHRAction(action) {
  if (enterpriseHandleHRAction(action)) return;
  const messages = {
    "new-communication": "New policy communication ready to configure",
    "publish-policy": "Policy briefing published to 80 employees",
    "copy-policy-link": "Employee briefing URL copied",
    "send-clarification": "Clarification queued for the affected cohort",
    "assign-action": "HR follow-up assigned",
    "export-assurance": "Policy assurance report generated",
    "acknowledge-feedback": "Employee feedback acknowledged",
    "preview-dialogue": "Employee dialogue preview opened"
  };
  if (action === "copy-policy-link") {
    navigator.clipboard?.writeText(`${window.location.origin}/hr/whistleblowing`);
  }
  if (action === "preview-dialogue") {
    state.route = "hr-dialogue";
    render();
    window.scrollTo(0, 0);
    return;
  }
  buttonToast(messages[action] || "HR workspace updated");
}

function answerQuestion(question) {
  const text = question.toLowerCase();
  if (text.includes("disagree")) {
    return "The main disagreement is between Operations and Finance. Operations experiences approval waiting time as the blocker. Finance agrees delays exist, but says many requests arrive without consistent evidence or threshold clarity. Fielded treats this as a contradiction to investigate, not as one department being wrong.";
  }
  if (text.includes("weakest")) {
    return "The weakest evidence concerns the size of financial impact from scope change leakage. The pattern appears in Engineering and Sales observations, but Fielded would request project margin data and two more commercial handover conversations before promoting it to high confidence.";
  }
  if (text.includes("next")) {
    return "Investigate approval thresholds first. Fielded recommends speaking with two Project Managers, two Finance Controllers and one Procurement Manager, then comparing request rework rates against approval cycle time.";
  }
  if (text.includes("money") || text.includes("save")) {
    return "The most immediate savings likely come from reducing duplicated reporting and approval rework. The margin upside may be larger in scope-change control, but that finding needs stronger commercial evidence before Fielded would prioritise it.";
  }
  return "Fielded reached this conclusion from 14 permitted observations across Operations, Finance and Procurement. Independent sources agree approvals slow delivery, but the evidence also shows request rework and unclear thresholds. That is why Fielded concludes the bottleneck is shared across process design, not simply Finance capacity.";
}

function buttonToast(message) {
  const toast = el(`<div class="pill contribute" style="position:fixed;right:20px;bottom:20px;box-shadow:var(--shadow);background:white">${message}</div>`);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
}
