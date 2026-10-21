const marketIntelligenceSeed = {
  company: {
    name: "Redwood Fabrication",
    initials: "RF",
    industry: "Specialist manufacturing",
    location: "West Midlands, UK",
    employees: 145,
    model: "Engineer-to-order components for energy and transport clients",
    interviewee: "James Holloway",
    role: "Founder & Managing Director",
    opportunityScore: 91,
    confidence: "Confirmed"
  },
  transcript: [
    { time: "03:14", speaker: "Lydia", text: "Could you walk me through what happens from a customer asking for a quote to work reaching the factory floor?" },
    { time: "03:26", speaker: "James Holloway", text: "Sales emails the drawings to estimating. We price in Excel, then the quote is copied into the ERP. If the customer changes anything, the latest version can be in someone's inbox rather than the job pack." },
    { time: "08:41", speaker: "Lydia", text: "Where does that create the most commercial risk?" },
    { time: "08:48", speaker: "James Holloway", text: "Variations. We often do the work because production needs an answer, but the commercial approval catches up later. On a complicated job we can give away several days of engineering." },
    { time: "16:05", speaker: "Lydia", text: "Which decisions still depend on you personally?" },
    { time: "16:12", speaker: "James Holloway", text: "Anything over fifty thousand, unusual material buys, and most customer disputes. The team can technically decide, but they wait because the context lives with me." },
    { time: "24:37", speaker: "Lydia", text: "If you had a reliable operating picture tomorrow, where would you act first?" },
    { time: "24:45", speaker: "James Holloway", text: "I'd connect quote assumptions to the job record. I want to see when scope changes, who approved it and whether we charged for it before the margin has already disappeared." }
  ],
  tabs: {
    profile: [
      { label: "Company profile", title: "Founder-led specialist manufacturer", detail: "Redwood serves regulated infrastructure clients through complex, low-volume engineer-to-order work.", basis: "Stated", confidence: "Confirmed", source: "03:26" },
      { label: "Operating complexity", title: "Commercial truth changes between quote and production", detail: "Drawings, assumptions and customer variations move through email, spreadsheets and the ERP without a consistent version chain.", basis: "AI inference", confidence: "High", source: "03:26 + 08:48" },
      { label: "Decision structure", title: "Founder remains the context holder", detail: "High-value purchases, disputes and exceptions escalate to James even where formal authority exists elsewhere.", basis: "Stated", confidence: "Confirmed", source: "16:12" }
    ],
    bottlenecks: [
      { label: "Bottleneck", title: "Engineering variations are actioned before commercial approval", detail: "Production urgency causes teams to proceed while price recovery and customer approval lag behind.", basis: "Stated", confidence: "Confirmed", source: "08:48" },
      { label: "Information flow", title: "Latest scope may live in an individual's inbox", detail: "The job pack does not reliably inherit the latest customer change, creating rework and version ambiguity.", basis: "Stated", confidence: "Confirmed", source: "03:26" },
      { label: "Organisational risk", title: "Decision rights exist without distributed context", detail: "Teams have nominal authority but defer to the founder because the reasoning behind prior decisions is not accessible.", basis: "AI inference", confidence: "High", source: "16:12" }
    ],
    opportunities: [
      { label: "Opportunity", title: "Quote-to-job assumption ledger", detail: "Carry priced assumptions, drawing versions and exclusions into delivery, then flag every material change before work proceeds.", basis: "AI inference", confidence: "High", source: "24:45" },
      { label: "Opportunity", title: "Variation recovery workflow", detail: "Give Engineering a rapid route to document scope impact and obtain commercial ownership without stopping production.", basis: "AI inference", confidence: "High", source: "08:48 + 24:45" },
      { label: "Opportunity", title: "Founder-context decision library", detail: "Capture the thresholds and contextual rules James uses so more exceptions can be resolved without escalation.", basis: "AI inference", confidence: "Medium", source: "16:12" }
    ],
    systems: [
      { label: "Technology", title: "ERP", detail: "System of record for accepted work, but quote detail is manually copied and change context is incomplete.", basis: "Stated", confidence: "Confirmed", source: "03:26" },
      { label: "Technology", title: "Excel estimating model", detail: "Primary environment for pricing specialist work and maintaining quote assumptions.", basis: "Stated", confidence: "Confirmed", source: "03:26" },
      { label: "Information source", title: "Email and individual inboxes", detail: "Informal source for revised drawings and customer variations, with weak organisational visibility.", basis: "Stated", confidence: "Confirmed", source: "03:26" }
    ]
  }
};

function consultingEngagement() {
  return consultingSeed.engagements.find((item) => item.id === state.selectedEngagementId) || consultingSeed.engagements[0];
}

function consultingInterview() {
  return consultingSeed.interviews.find((item) => item.id === state.selectedInterviewId) || consultingSeed.interviews[0];
}

function consultingNavItems() {
  const items = [
    ["engine-consulting", "My Fielded engineer", "F"],
    ["consulting", "Portfolio", "01"],
    ["consulting-engagement", "Engagement", "02"],
    ["consulting-requirements", "Data requirements", "03"],
    ["consulting-interviews", "AI interviews", "04"],
    ["consulting-findings", "Findings & evidence", "05"],
    ["consulting-recommendations", "Recommendations", "06"],
    ["consulting-market", "Market intelligence", "07"],
    ["consulting-diligence", "Due diligence", "08"]
  ];
  return items
    .map(([route, label, index]) => `<button class="nav-item ${state.route === route ? "active" : ""}" data-consult-nav="${route}"><span>${index}</span>${label}</button>`)
    .join("");
}

function renderConsultant() {
  const engagement = consultingEngagement();
  const isMarketView = state.route === "consulting-market";
  const isDiligenceView = state.route === "consulting-diligence";
  const isEngineer = state.route === "engine-consulting";
  mount(`
    <div class="layout consultant-layout">
      <aside class="sidebar consultant-sidebar">
        ${brandLogo()}
        <div class="workspace-switch"><span>Consulting workspace</span><strong>${consultingSeed.firm.name}</strong><small>Digital fieldwork portfolio</small></div>
        <nav class="nav-list">${consultingNavItems()}</nav>
        <div class="sidebar-foot">
          <span class="system-status"><i></i> ${consultingSeed.firm.deployedAgents} agents deployed</span>
          <small>${consultingSeed.firm.activeEngagements} active engagements<br />Last evidence sync: 3 minutes ago</small>
        </div>
      </aside>
      <section>
        <div class="mobile-nav">${consultingNavItems()}</div>
        <header class="topbar">
          <div><span class="topbar-label">${isEngineer ? "Your Fielded workspace" : isDiligenceView ? "Supplier assurance review" : isMarketView ? "Market intelligence" : "Client engagement"}</span><strong>${isEngineer ? "Avery & Stone advisory" : isDiligenceView ? "Redwood Fabrication" : isMarketView ? marketIntelligenceSeed.company.name : engagement.client}</strong></div>
          <div class="topbar-center"><span class="live-dot"></span>${isEngineer ? "Your client work, in context" : isDiligenceView ? "Controlled evidence collection · Simulated" : isMarketView ? "Executive transcript analysed · 8 sources verified" : `Digital fieldwork active across ${engagement.completed} participants`}</div>
          <div class="identity"><div class="avatar">LH</div><div><strong>${state.user.name}</strong><br /><span class="muted">${state.user.jobTitle}</span></div></div>
        </header>
        <main class="main consultant-main">${consultingView()}</main>
      </section>
    </div>
  `);
}

function consultingView() {
  if (state.route === "engine-consulting") return engineView("consulting");
  if (state.route === "consulting-diligence") return diligenceView();
  if (state.route === "consulting-engagement") return consultingEngagementView();
  if (state.route === "consulting-requirements") return consultingRequirementsView();
  if (state.route === "consulting-interviews") return consultingInterviewsView();
  if (state.route === "consulting-findings") return consultingFindingsView();
  if (state.route === "consulting-recommendations") return consultingRecommendationsView();
  if (state.route === "consulting-market") return consultingMarketIntelligenceView();
  return consultingPortfolioView();
}

function consultingPortfolioView() {
  const interviews = consultingSeed.engagements.reduce((total, item) => total + item.completed, 0);
  const participants = consultingSeed.engagements.reduce((total, item) => total + item.participants, 0);
  return `
    <div class="view-title consulting-title">
      <div><span class="eyebrow">Avery & Stone advisory portfolio</span><h1>Good morning, Lydia.</h1><p>Fielded is running the discovery infrastructure beneath four client engagements, turning 146 conversations into a structured and traceable evidence base.</p></div>
      <button class="btn accent" data-consult-action="new-engagement">New engagement</button>
    </div>
    ${engineContributionFeed("consulting", "Reviewed fieldwork notes")}
    <section class="consulting-proposition">
      <div><span class="eyebrow on-dark">Digital forward-deployed engineering</span><h2>Deploy software to collect organisational intelligence.</h2><p>Your teams define what the engagement needs to learn. Fielded identifies who to ask, conducts adaptive conversations, closes evidence gaps and maintains traceability from recommendation back to transcript.</p></div>
      <div class="consulting-boundary"><span>Fielded compresses</span><strong>Interviews → notes → tagging → comparison → synthesis</strong><span>Consultants retain</span><strong>Judgement → strategy → client relationship → implementation</strong></div>
    </section>
    <section class="consulting-kpis">
      <div class="consulting-kpi-lead"><span>Active client value cases</span><strong>£24.3m</strong><small>Indicative opportunity under investigation</small></div>
      <div><span>Engagements</span><strong>${consultingSeed.firm.activeEngagements}</strong><small>Across 4 sectors</small></div>
      <div><span>Interviews complete</span><strong>${interviews}</strong><small>of ${participants} invited</small></div>
      <div><span>Data coverage</span><strong>80%</strong><small>Across 31 requirements</small></div>
      <div><span>Consultant hours saved</span><strong>624</strong><small>Estimated fieldwork capacity</small></div>
    </section>
    <section class="consulting-process">
      <div class="section-head"><div><span class="eyebrow">Fielded engagement architecture</span><h2>From research question to defensible recommendation</h2></div><span class="count-label">Always traceable</span></div>
      <div class="consulting-process-track">
        <span class="active"><b>01</b>Scope</span><i></i><span class="active"><b>02</b>Deploy</span><i></i><span class="active"><b>03</b>Interview</span><i></i><span class="active"><b>04</b>Evidence</span><i></i><span><b>05</b>Findings</span><i></i><span><b>06</b>Recommend</span>
      </div>
    </section>
    <section class="engagement-section">
      <div class="section-head"><div><span class="eyebrow">Live portfolio</span><h2>Client engagements collecting data now</h2></div><div class="portfolio-filter"><span class="active">All 4</span><span>Needs attention 2</span></div></div>
      <div class="engagement-grid">${consultingSeed.engagements.map(consultingEngagementCard).join("")}</div>
    </section>
    <section class="market-entry-band">
      <div><span class="eyebrow on-dark">Fielded Market Intelligence Engine</span><h2>Turn founder and executive calls into a structured commercial picture.</h2><p>Upload a transcript and Fielded maps the company, processes, systems, bottlenecks, decision makers and opportunities, with every claim attached to its supporting passage.</p></div>
      <div class="market-entry-proof"><span><strong>27</strong> evidence points</span><span><strong>8</strong> verified passages</span><span><strong>91</strong> opportunity score</span><button class="btn light" data-consult-nav="consulting-market">Explore demo analysis</button></div>
    </section>
  `;
}

function consultingEngagementCard(item) {
  const progress = Math.round((item.completed / item.participants) * 100);
  return `
    <article class="engagement-card">
      <header><div class="client-mark">${item.initials}</div><div class="engagement-heading"><span>${item.industry}</span><h3>${item.client}</h3><p>${item.type}</p></div><span class="mission-status ${item.phase === "Synthesis" ? "green" : item.phase === "Discovery" ? "blue" : "teal"}">${item.phase}</span></header>
      <div class="engagement-lead"><span>Lead consultant</span><strong>${item.lead}</strong><small>Client sponsor · ${item.sponsor}</small></div>
      <div class="engagement-progress"><div><span>Interview completion</span><strong>${item.completed} / ${item.participants}</strong></div><div class="progress-bar"><span style="width:${progress}%"></span></div></div>
      <div class="engagement-signals"><div><span>Data coverage</span><strong>${item.dataCoverage}%</strong></div><div><span>Themes</span><strong>${item.themes}</strong></div><div><span>Critical gaps</span><strong class="${item.gaps > 4 ? "attention" : ""}">${item.gaps}</strong></div><div><span>Value case</span><strong>${item.value}</strong></div></div>
      <footer><span><i class="live-dot"></i> ${item.lastActivity}</span><button class="btn secondary" data-open-engagement="${item.id}">Open engagement</button></footer>
    </article>
  `;
}

function consultingEngagementView() {
  const item = consultingEngagement();
  return `
    <div class="view-title"><div><span class="eyebrow">${item.type}</span><h1>${item.client}</h1><p>Fielded is actively filling the engagement dataset across Commercial, Operations, Finance, Technology and Leadership.</p></div><div class="title-actions"><span class="mission-status teal">${item.phase}</span><button class="btn accent" data-consult-nav="consulting-requirements">View data matrix</button></div></div>
    <section class="engagement-command">
      <div class="command-progress"><div class="progress-ring" style="--progress:${item.dataCoverage}"><strong>${item.dataCoverage}%</strong><span>data collected</span></div><div><span class="eyebrow">Discovery health</span><h2>Evidence is broad, with four decision-critical gaps.</h2><p>Fielded is adapting the remaining interview plan to validate margin structure, churn causes and cross-functional handover.</p></div></div>
      <div><span>Interviews</span><strong>${item.completed}/${item.participants}</strong><small>12 outstanding</small></div>
      <div><span>Evidence points</span><strong>286</strong><small>Across 5 functions</small></div>
      <div><span>Findings</span><strong>${item.findings}</strong><small>3 action ready</small></div>
      <div><span>Consultant review</span><strong>8</strong><small>Items queued</small></div>
    </section>
    <section class="engagement-workspace-grid">
      <div class="coverage-workspace">
        <div class="section-head"><div><span class="eyebrow">Research coverage by function</span><h2>Where the evidence base is strong</h2></div><span class="count-label">Target 85%</span></div>
        ${[["Leadership",100],["Sales",92],["Technology",88],["Operations",78],["Finance",65]].map(([name,value]) => `<div class="consulting-coverage-row"><span>${name}</span><div><i style="width:${value}%"></i><b style="left:${value}%"></b></div><strong>${value}%</strong></div>`).join("")}
      </div>
      <aside class="intelligence-gaps">
        <div class="section-head"><div><span class="eyebrow">Outstanding intelligence</span><h2>What Fielded still needs</h2></div><span class="attention-count">4</span></div>
        <div><b>01</b><span><strong>CFO interview incomplete</strong><small>Required for margin structure validation</small></span><em>Critical</em></div>
        <div><b>02</b><span><strong>No evidence for churn causes</strong><small>Commercial workstream remains ungrounded</small></span><em>Critical</em></div>
        <div><b>03</b><span><strong>Margin structure needs validation</strong><small>6 sources, medium confidence</small></span><em>Follow up</em></div>
        <div><b>04</b><span><strong>Onboarding accounts contradict</strong><small>Management and frontline evidence diverge</small></span><em>Test</em></div>
      </aside>
    </section>
    <section class="engagement-lower-grid">
      <div class="requirement-preview"><div class="section-head"><div><span class="eyebrow">Data requirement matrix</span><h2>Engagement questions being filled</h2></div><button class="text-link" data-consult-nav="consulting-requirements">Open full matrix →</button></div>${consultingSeed.requirements.slice(0,5).map(requirementRow).join("")}</div>
      <div class="agent-plan"><span class="eyebrow">Next-best fieldwork</span><h2>Fielded has adapted the interview plan.</h2><p>The digital field team will prioritise Finance leadership, two recently churned account owners and three implementation managers.</p><div class="agent-plan-stats"><div><strong>6</strong><span>interviews queued</span></div><div><strong>14</strong><span>targeted follow-ups</span></div><div><strong>3</strong><span>hypotheses tested</span></div></div><button class="btn accent" data-consult-action="approve-plan">Approve fieldwork plan</button></div>
    </section>
  `;
}

function requirementRow(item) {
  return `<div class="requirement-row"><span><strong>${item.requirement}</strong><small>${item.workstream}</small></span><span class="requirement-status ${item.status.toLowerCase()}">${item.status}</span><span>${item.confidence}</span><span>${item.sources ? item.sources + " interviews" : "No evidence"}</span></div>`;
}

function consultingRequirementsView() {
  return `
    <div class="view-title"><div><span class="eyebrow">Engagement dataset</span><h1>Data requirement matrix</h1><p>The consulting team defines what it needs to learn. Fielded deploys adaptive conversations to fill, challenge and validate that dataset.</p></div><button class="btn accent" data-consult-action="add-requirement">Add requirement</button></div>
    <section class="matrix-summary"><div><span>Required data points</span><strong>31</strong></div><div><span>Complete</span><strong>19</strong></div><div><span>Partial</span><strong>8</strong></div><div class="attention"><span>Missing</span><strong>4</strong></div><div><span>Weighted coverage</span><strong>83%</strong></div></section>
    <section class="data-matrix">
      <div class="data-matrix-head"><span>Required intelligence</span><span>Workstream</span><span>Status</span><span>Confidence</span><span>Sources</span><span>Owner</span></div>
      ${consultingSeed.requirements.map((item) => `<div class="data-matrix-row"><span><strong>${item.requirement}</strong><small>Fielded actively collecting evidence</small></span><span>${item.workstream}</span><span><i class="requirement-status ${item.status.toLowerCase()}">${item.status}</i></span><span>${item.confidence}</span><span>${item.sources ? item.sources + " interviews" : "—"}</span><span>${item.owner}</span></div>`).join("")}
    </section>
    <section class="matrix-explainer"><div><span class="eyebrow on-dark">A different unit of fieldwork</span><h2>Do not ask Fielded to interview 60 people. Tell it what the engagement needs to know.</h2></div><div><strong>Fielded decides</strong><span>Who to ask</span><span>What to ask next</span><span>Where to corroborate</span><span>When evidence is sufficient</span></div></section>
  `;
}

function consultingInterviewsView() {
  const selected = consultingInterview();
  return `
    <div class="view-title"><div><span class="eyebrow">AI interview centre</span><h1>Every conversation, fully traceable.</h1><p>Review live fieldwork, extracted claims and the chain from transcript to dataset field.</p></div><span class="permission-state"><span class="live-dot"></span>42 completed · 1 live</span></div>
    <section class="interview-layout">
      <aside class="interview-list"><div class="section-head"><div><span class="eyebrow">Participant conversations</span><h2>Northstar Foods</h2></div><span class="count-label">60 invited</span></div>${consultingSeed.interviews.map(interviewCard).join("")}</aside>
      <div class="interview-detail">
        <header><div class="participant-profile"><div class="client-mark">${selected.participant.split(" ").map((part) => part[0]).join("")}</div><div><span class="eyebrow">${selected.department}</span><h2>${selected.participant}</h2><p>${selected.role} · ${selected.duration}</p></div></div><span class="mission-status green">${selected.status}</span></header>
        <div class="interview-metadata"><div><span>Topics covered</span><strong>${selected.topics.join(" · ")}</strong></div><div><span>Data points</span><strong>${selected.dataPoints}</strong></div><div><span>Key claims</span><strong>${selected.claims}</strong></div><div><span>Confidence</span><strong>${selected.confidence}</strong></div></div>
        <section class="transcript-panel"><div class="section-head"><div><span class="eyebrow">AI-generated transcript</span><h2>Customer onboarding and handover</h2></div><span class="count-label">Consent · CONTRIBUTE</span></div>${consultingSeed.transcript.map((line) => `<div class="transcript-line ${line.sender === "Fielded" ? "fielded" : ""}"><strong>${line.sender}</strong><p>${line.text}</p></div>`).join("")}</section>
      </div>
      <aside class="extraction-rail">
        <div class="extraction-block"><span class="eyebrow">Extracted finding</span><h3>Customer onboarding requires significant manual intervention.</h3><span class="confidence-label high">High confidence</span></div>
        <div class="extraction-block"><span class="eyebrow">Corroborating evidence</span><p>3 separate participants independently described duplicated spreadsheet entry and incomplete commercial handover.</p></div>
        <div class="extraction-block"><span class="eyebrow">Related dataset fields</span><div class="dataset-path"><span>Operational inefficiencies</span><b>Customer onboarding</b><span>Technology</span><b>CRM utilisation</b><span>Automation opportunities</span><b>Data entry</b></div></div>
        <button class="btn secondary" data-consult-action="flag-interview">Flag for consultant review</button>
      </aside>
    </section>
  `;
}

function interviewCard(item) {
  return `<button class="interview-card ${state.selectedInterviewId === item.id ? "selected" : ""}" data-open-interview="${item.id}"><span class="interview-status ${item.status.toLowerCase().replace(" ", "-")}"></span><div><strong>${item.participant}</strong><span>${item.role}</span><small>${item.department} · ${item.duration}</small></div><b>${item.dataPoints}</b></button>`;
}

function consultingFindingsView() {
  return `
    <div class="view-title"><div><span class="eyebrow">Continuous synthesis</span><h1>Findings with an evidence chain.</h1><p>Consultants can challenge Fielded, inspect underlying interviews and decide what belongs in the client recommendation.</p></div><span class="permission-state"><span class="live-dot"></span>7 active findings</span></div>
    <section class="consulting-finding-hero"><div><span class="eyebrow on-dark">Highest-impact finding</span><h2>Sales-to-Operations Handoff Failure</h2><p>Management describes a standardised handover. Frontline evidence shows that critical implementation information is routinely absent.</p></div><div><span>Potential impact</span><strong>£540k</strong><small>Onboarding time, rework and churn risk</small></div></section>
    <section class="consulting-findings-grid">${consultingSeed.findings.map(consultingFindingCard).join("")}</section>
    <section class="contradiction-register"><div class="section-head"><div><span class="eyebrow">Contradiction register</span><h2>Where stakeholder accounts materially diverge</h2></div><span class="attention-count">3</span></div><div class="contradiction-comparison"><div><span>Management claim</span><strong>“Our sales-to-delivery handover is highly standardised.”</strong><small>Leadership interviews · 4 sources</small></div><i>≠</i><div><span>Employee evidence</span><strong>11 of 15 operational employees describe the process as inconsistent.</strong><small>Operations and Customer Success · direct experience</small></div></div></section>
  `;
}

function consultingFindingCard(item) {
  return `<article class="consulting-finding-card"><header><span class="mission-status ${item.status === "Accepted" ? "green" : item.status === "Investigating" ? "blue" : "teal"}">${item.status}</span><strong>${item.value}</strong></header><h2>${item.title}</h2><p>${item.summary}</p><div class="finding-evidence-stats"><span><b>${item.sources}</b> sources</span><span><b>${item.departments}</b> departments</span><span><b>${item.confidence}</b> confidence</span></div><footer><button class="btn accent" data-consult-action="accept-finding">Accept</button><button class="btn secondary" data-consult-action="investigate-finding">Investigate further</button><button class="btn ghost" data-consult-action="dismiss-finding">Dismiss</button></footer></article>`;
}

function consultingRecommendationsView() {
  return `
    <div class="view-title"><div><span class="eyebrow">Consultant-owned output</span><h1>Turn validated evidence into advice.</h1><p>Fielded carries the evidence chain forward. Avery & Stone retains judgement, language and accountability for the client recommendation.</p></div><button class="btn accent" data-consult-action="export-brief">Generate client brief</button></div>
    <section class="recommendation-layout">
      <div class="recommendation-builder"><div class="section-head"><div><span class="eyebrow">Draft recommendation</span><h2>Standardise the commercial-to-delivery handover</h2></div><span class="mission-status blue">Consultant draft</span></div><p>Introduce a mandatory digital handover with named ownership, required implementation fields and an exception path for complex accounts. Measure completeness before kickoff and link missing data to onboarding delay.</p><div class="recommendation-rationale"><strong>Consultant rationale</strong><span>This targets the repeated failure point without adding management layers. It should be piloted in one region before wider operating-model changes.</span></div><div class="button-row"><button class="btn accent" data-consult-action="approve-recommendation">Add to client recommendation</button><button class="btn secondary" data-consult-action="edit-recommendation">Edit</button></div></div>
      <aside class="attached-evidence"><span class="eyebrow">Evidence automatically attached</span><h2>Defensible from finding to source</h2><div><span>Finding</span><strong>Sales-to-Operations Handoff Failure</strong></div><div><span>Evidence base</span><strong>14 participants · 3 departments</strong></div><div><span>Direct transcripts</span><strong>9 linked passages</strong></div><div><span>Contradiction retained</span><strong>Management vs operational account</strong></div><button class="text-link" data-consult-nav="consulting-findings">Inspect full evidence chain →</button></aside>
    </section>
    <section class="consultant-value-chain"><div><span>Fielded provides</span><strong>Structured evidence</strong><strong>Coverage confidence</strong><strong>Traceability</strong></div><i>+</i><div><span>Avery & Stone provides</span><strong>Judgement</strong><strong>Strategic recommendation</strong><strong>Client accountability</strong></div><i>=</i><div class="outcome"><span>Client outcome</span><strong>Faster, deeper and more defensible consulting</strong></div></section>
  `;
}

function consultingMarketIntelligenceView() {
  const company = marketIntelligenceSeed.company;
  const selectedItems = marketIntelligenceSeed.tabs[state.selectedMarketTab] || marketIntelligenceSeed.tabs.profile;
  const tabs = [["profile", "Company profile"], ["bottlenecks", "Bottlenecks"], ["opportunities", "Opportunities"], ["systems", "Systems & information"]];
  return `
    <div class="view-title"><div><span class="eyebrow">Market Intelligence Engine · Executive interview</span><h1>Transcript in. Evidence-backed company picture out.</h1><p>A worked example adapted from Fielded's original research engine, now available inside a consultancy engagement.</p></div><button class="btn accent" data-consult-action="export-market-report">Export evidence report</button></div>
    <section class="market-command">
      <div class="market-company"><div class="client-mark">${company.initials}</div><div><span class="eyebrow">Analysed company</span><h2>${company.name}</h2><p>${company.industry} · ${company.location} · ${company.employees} employees</p></div></div>
      <div><span>Interview</span><strong>31 min</strong><small>${company.interviewee}, ${company.role}</small></div>
      <div><span>Structured findings</span><strong>27</strong><small>8 categories extracted</small></div>
      <div><span>Verified quotes</span><strong>8 / 8</strong><small>Located in transcript</small></div>
      <div class="score"><span>Opportunity score</span><strong>${company.opportunityScore}</strong><small>${company.confidence} fit</small></div>
    </section>
    <section class="market-engine-flow"><span><b>01</b>Founder call</span><i>→</i><span><b>02</b>Transcript</span><i>→</i><span><b>03</b>Structured extraction</span><i>→</i><span><b>04</b>Evidence review</span><i>→</i><span><b>05</b>Client-ready report</span></section>
    <section class="market-workspace">
      <div class="market-transcript">
        <div class="section-head"><div><span class="eyebrow">Source transcript</span><h2>Founder discovery call</h2></div><span class="count-label">Recorded 29 Aug · consented</span></div>
        <div class="transcript-search">Search transcript <span>8 evidence passages linked</span></div>
        ${marketIntelligenceSeed.transcript.map((line) => `<div class="market-transcript-line"><time>${line.time}</time><span><strong>${line.speaker}</strong><p>${line.text}</p></span></div>`).join("")}
      </div>
      <div class="market-extraction">
        <div class="section-head"><div><span class="eyebrow">Structured intelligence</span><h2>What Fielded extracted</h2></div><span class="mission-status green">Analysis complete</span></div>
        <div class="market-tabs">${tabs.map(([key,label]) => `<button class="${state.selectedMarketTab === key ? "active" : ""}" data-market-tab="${key}">${label}</button>`).join("")}</div>
        <div class="market-finding-list">${selectedItems.map((item) => `<article class="market-finding"><header><span>${item.label}</span><span class="confidence-label ${item.confidence === "Medium" ? "medium" : "high"}">${item.confidence}</span></header><h3>${item.title}</h3><p>${item.detail}</p><footer><span class="basis ${item.basis === "Stated" ? "stated" : "inferred"}">${item.basis === "Stated" ? "Stated by interviewee" : "AI inference"}</span><button class="source-jump" data-consult-action="source-jump">Verified source · ${item.source}</button><div><button data-consult-action="approve-market-finding">Approve</button><button data-consult-action="reject-market-finding">Reject</button></div></footer></article>`).join("")}</div>
      </div>
    </section>
    <section class="market-report">
      <header><div><span class="eyebrow">Consultant-ready report</span><h2>${company.name} · Organisational Intelligence Profile</h2></div><span>Generated from 1 executive interview · 27 structured findings</span></header>
      <div class="market-report-grid"><div><span>Company profile</span><p>${company.model}. Commercial risk accumulates where scope and decision context move between personal inboxes, Excel and the ERP.</p></div><div><span>Highest-value bottleneck</span><p>Engineering variations proceed before commercial approval, creating unrecovered work and margin leakage on complex jobs.</p></div><div><span>Strongest opportunity</span><p>Link quote assumptions to the live job record and trigger a variation workflow whenever drawings, requirements or delivery constraints change.</p></div><div><span>Questions to validate</span><p>Quantify unrecovered variation value; compare margin by project complexity; test whether estimators and project managers describe the same handover.</p></div></div>
      <footer><div><span class="basis stated">8 stated findings</span><span class="basis inferred">19 AI inferences</span><span class="basis verified">All quoted evidence verified</span></div><button class="btn secondary" data-consult-action="export-market-report">Generate client dossier</button></footer>
    </section>
  `;
}
