const responseHeaders = {
  "content-type": "application/json",
  "cache-control": "no-store"
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = request.body || {};
  const task = body.task || "dialogue";

  response.setHeader("cache-control", responseHeaders["cache-control"]);

  if (task === "dialogue") {
    response.status(200).json({
      role: "assistant",
      content:
        "What happened next, and what did that delay change for the project, customer or margin?",
      modelReady: true,
      intendedIntegration: "Vercel AI SDK generateText/streamText with OpenAI"
    });
    return;
  }

  if (task === "extract_observations") {
    response.status(200).json({
      observations: [
        {
          category: "PROCESS",
          summary: "Approval requests are often reworked before Finance can approve them.",
          detail:
            "Participant evidence indicates approval delays include both queue time and missing or inconsistent supporting information.",
          process: "Project approval",
          department: "Operations",
          systems_involved: ["Salesforce", "Excel", "Project tracker"],
          problem_type: "Bottleneck",
          estimated_impact: "Medium to high",
          source_type: "DIRECT EXPERIENCE",
          confidence: 0.84,
          confidentiality: "CONTRIBUTE"
        }
      ]
    });
    return;
  }

  if (task === "synthesise") {
    response.status(200).json({
      themes: [
        {
          title: "Approval Bottleneck With Shared Causes",
          description:
            "Multiple departments report approval friction, with contradictory evidence about whether Finance capacity or submission quality is the primary driver.",
          participant_count: 8,
          departments: ["Operations", "Finance", "Procurement"],
          confidence: "High",
          questions_remaining: [
            "How often are requests returned for missing evidence?",
            "Which thresholds could be delegated safely?"
          ]
        }
      ]
    });
    return;
  }

  if (task === "plan_consulting_fieldwork") {
    response.status(200).json({
      engagement_id: body.engagement_id || "eng-northstar",
      required_intelligence: body.required_intelligence || [
        "Gross-margin leakage",
        "Customer churn causes",
        "Sales-to-Operations handover"
      ],
      recommended_participants: [
        { role: "Chief Financial Officer", reason: "Validate margin structure and ownership" },
        { role: "Implementation Manager", count: 3, reason: "Corroborate onboarding handover gaps" },
        { role: "Account Owner", count: 2, reason: "Test the causes of recent customer churn" }
      ],
      interview_strategy: "Prioritise missing and contradictory evidence, then stop when sufficiency thresholds are met.",
      modelReady: true,
      intendedIntegration: "Vercel AI SDK generateObject with OpenAI structured outputs"
    });
    return;
  }

  if (task === "trace_consulting_evidence") {
    response.status(200).json({
      recommendation: "Standardise the commercial-to-delivery handover",
      finding: "Sales-to-Operations Handoff Failure",
      evidence: {
        observation_count: 14,
        participant_count: 14,
        departments: ["Sales", "Operations", "Customer Success"],
        transcript_passages: 9,
        contradiction_retained: true
      },
      governance: {
        private_content_excluded: true,
        contributed_content_anonymised: true,
        shared_content_attributable: true
      }
    });
    return;
  }

  if (task === "generate_policy_briefing") {
    response.status(200).json({
      communication_id: body.communication_id || "policy-whistleblowing",
      source_reference: "HR-POL-014 · Version 3.2",
      briefing: {
        purpose: "Explain how to raise a concern and the protection available to the reporter.",
        core_points: [
          "Employees may report outside their management line.",
          "Anonymous and independent reporting routes are available.",
          "Retaliation is prohibited and access to identifying information is restricted."
        ],
        comprehension_checks: [
          "Do you know where you could report a concern today?",
          "Do you understand who can access your report?",
          "What remains unclear about protection after reporting?"
        ]
      },
      modelReady: true,
      intendedIntegration: "Vercel AI SDK generateObject with OpenAI structured outputs"
    });
    return;
  }

  if (task === "synthesise_policy_feedback") {
    response.status(200).json({
      communication_id: body.communication_id || "policy-whistleblowing",
      comprehension: {
        reporting_route: 0.85,
        manager_bypass: 0.74,
        confidence_speaking_up: 0.68,
        investigation_next_steps: 0.79
      },
      themes: [
        { title: "Fear of identification", count: 11, type: "concern", confidence: 0.92 },
        { title: "Line-manager bypass", count: 8, type: "misunderstanding", confidence: 0.87 },
        { title: "Contractor coverage", count: 6, type: "policy_gap", confidence: 0.84 }
      ],
      governance: {
        private_content_excluded: true,
        contributed_content_anonymised: true,
        minimum_cohort_size_applied: true
      }
    });
    return;
  }

  if (task === "extract_market_intelligence") {
    response.status(200).json({
      company_profile: {
        name: body.company_name || "Redwood Fabrication",
        industry: "Specialist manufacturing",
        employee_count: 145,
        business_model: "Engineer-to-order components for energy and transport clients"
      },
      findings: [
        {
          kind: "bottleneck",
          title: "Engineering variations are actioned before commercial approval",
          confidence: "confirmed",
          evidence_basis: "stated",
          evidence_quote: "We often do the work because production needs an answer, but the commercial approval catches up later.",
          source_reference: "08:48",
          evidence_verified: true
        },
        {
          kind: "opportunity",
          title: "Quote-to-job assumption ledger",
          confidence: "inferred",
          evidence_basis: "inferred",
          evidence_quote: "I want to see when scope changes, who approved it and whether we charged for it.",
          source_reference: "24:45",
          evidence_verified: true
        }
      ],
      opportunity_score: 91,
      opportunity_confidence: "confirmed",
      modelReady: true,
      intendedIntegration: "Vercel AI SDK generateObject with OpenAI structured outputs"
    });
    return;
  }

  response.status(400).json({ error: "Unknown Fielded AI task" });
}
