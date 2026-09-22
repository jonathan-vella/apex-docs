import { SITE_BASE } from "./siteConfig.mjs";

const stepDefinitions = [
  {
    id: "overview",
    label: "Overview",
    slug: "demo",
    stepLabel: "Overview",
    chipLabel: "Overview",
    shortTitle: "Overview",
    agent: "Multi-agent workflow",
    artifact: "Walkthrough hub",
    summary:
      "A Maltese catering outlet needs an online ordering app on Azure. Start with the business context, architecture snapshot, and full step map.",
    focus:
      "Read the historical scenario, recorded outputs, and deployment limitations before comparing it with the current workflow.",
    sections: ["Scenario", "Recorded steps", "Limitations"],
  },
  {
    id: "requirements",
    label: "Step 1: Requirements",
    slug: "demo/01-requirements",
    stepLabel: "Step 1",
    chipLabel: "1",
    shortTitle: "Requirements",
    agent: "Requirements Agent",
    artifact: "Business and technical requirements",
    summary:
      "The requirements record describes online ordering for pastizzi, Cisk, and Kinnie, GDPR requirements, and a EUR 100-500 monthly budget.",
    focus:
      "Read the workload goals, compliance scope, and budget constraints used in the design.",
    sections: ["Business context", "Functional requirements", "Compliance & security", "Budget & scaling"],
    items: [
      { label: "Overview", slug: "demo/01-requirements" },
      {
        label: "Functional Requirements",
        slug: "demo/01-requirements/functional",
      },
      {
        label: "Compliance & Security",
        slug: "demo/01-requirements/compliance-security",
      },
      {
        label: "Budget & Scaling",
        slug: "demo/01-requirements/budget-scaling",
      },
    ],
  },
  {
    id: "architecture",
    label: "Step 2: Solution architecture",
    slug: "demo/02-architecture",
    items: [
      { label: "Overview", slug: "demo/02-architecture" },
      { label: "WAF Assessment", slug: "demo/02-architecture/waf-assessment" },
      {
        label: "SKU Sizing & Pricing",
        slug: "demo/02-architecture/sizing-pricing",
      },
    ],
    stepLabel: "Step 2",
    chipLabel: "2",
    shortTitle: "Solution Architecture",
    agent: "Architect Agent",
    artifact: "WAF assessment and SKU recommendations",
    summary:
      "App Service S1 with VNet integration and private endpoints. WAF scores: Security 8, Reliability 7, Performance 9, Cost 7, Operations 7. Estimated ~$155/month.",
    focus:
      "See the trade-offs between security posture, cost, and operational complexity before implementation begins.",
    sections: ["Service topology", "WAF assessment", "SKU recommendations"],
  },
  {
    id: "design",
    label: "Step 3: Design artifacts",
    slug: "demo/03-design",
    items: [
      { label: "Overview", slug: "demo/03-design" },
      { label: "Architecture Decision Records", slug: "demo/03-design/adrs" },
      { label: "Cost Estimates", slug: "demo/03-design/cost" },
    ],
    stepLabel: "Step 3",
    chipLabel: "3",
    shortTitle: "Design Artifacts",
    agent: "Design Agent",
    artifact: "ADRs, diagrams, and cost visuals",
    summary:
      "Recorded ADRs cover App Service S1, Table Storage, and the revised private-endpoint design. The design estimate is distinct from the later as-built baseline.",
    focus:
      "Compare the recorded decisions, diagrams, and design-stage cost assumptions.",
    sections: ["Architecture diagram", "Architecture decisions", "Cost estimates"],
  },
  {
    id: "governance",
    label: "Step 3.5: Governance",
    slug: "demo/04-governance",
    items: [
      { label: "Overview", slug: "demo/04-governance" },
      { label: "Tagging Policy", slug: "demo/04-governance/tags" },
      {
        label: "Security & Network Policies",
        slug: "demo/04-governance/security",
      },
    ],
    stepLabel: "Step 3.5",
    chipLabel: "3.5",
    shortTitle: "Governance",
    agent: "Governance Agent",
    artifact: "Azure Policy constraints",
    summary:
      "The April 2026 discovery recorded 21 policy assignments and a 9-tag resource-group blocker. Its audit-only findings describe that scope at that time.",
    focus:
      "Compare the recorded policy scope, required tags, and unresolved constraints.",
    sections: ["Policy effects", "Required tags", "Deployment blockers"],
  },
  {
    id: "plan",
    label: "Step 4: IaC plan",
    slug: "demo/05-plan",
    items: [
      { label: "Overview", slug: "demo/05-plan" },
      { label: "Module Architecture", slug: "demo/05-plan/modules" },
      { label: "Implementation Phases", slug: "demo/05-plan/phases" },
    ],
    stepLabel: "Step 4",
    chipLabel: "4",
    shortTitle: "Infra-as-Code Plan",
    agent: "IaC Planner",
    artifact: "Implementation plan and dependency flow",
    summary:
      "12 resources across 10 AVM Bicep modules deployed in 5 phases. Governance-adapted tag contract expands from 4 to 9 required tags.",
    focus: "Read the recorded module structure and phase dependencies.",
    sections: ["Module structure", "Implementation tasks", "Dependency flow"],
  },
  {
    id: "code",
    label: "Step 5: IaC code",
    slug: "demo/06-code",
    items: [
      { label: "Overview", slug: "demo/06-code" },
      { label: "Generated Artifacts", slug: "demo/06-code/artifacts" },
      { label: "Validation Summary", slug: "demo/06-code/validation" },
    ],
    stepLabel: "Step 5",
    chipLabel: "5",
    shortTitle: "Infra-as-Code Gen",
    agent: "Bicep CodeGen Agent",
    artifact: "Bicep templates and validation results",
    summary:
      "The CodeGen record lists 10 modules and reports build, lint, and source security checks. These are historical results, not a fresh validation.",
    focus: "Compare generated files with the plan and reported check results.",
    sections: ["File structure", "Validation results", "AVM modules"],
  },
  {
    id: "deploy",
    label: "Step 6: Deployment",
    slug: "demo/07-deploy",
    items: [
      { label: "Overview", slug: "demo/07-deploy" },
      { label: "Deployment Phases", slug: "demo/07-deploy/phases" },
      { label: "Resource Outputs", slug: "demo/07-deploy/outputs" },
    ],
    stepLabel: "Step 6",
    chipLabel: "6",
    shortTitle: "Deployment",
    agent: "Deploy Agent",
    artifact: "Deployment execution summary",
    summary:
      "The April 2026 run provisioned 12 resources with azd and replaced unavailable S1 capacity with P0v3. Application checks returned HTTP 503. Current APEX requires approval for such changes.",
    focus: "Compare provisioning results, application-health failures, and the recorded SKU change.",
    sections: ["Preflight checks", "Deployment phases", "Outputs"],
  },
  {
    id: "as-built",
    label: "Step 7: As-built records",
    slug: "demo/08-as-built",
    items: [
      { label: "Overview", slug: "demo/08-as-built" },
      { label: "Design & Inventory", slug: "demo/08-as-built/design" },
      { label: "Operations Runbook", slug: "demo/08-as-built/runbook" },
      { label: "Compliance & Cost", slug: "demo/08-as-built/compliance" },
    ],
    stepLabel: "Step 7",
    chipLabel: "7",
    shortTitle: "As-Built Docs",
    agent: "As-Built Agent",
    artifact: "Operational documentation suite",
    summary:
      "Post-deployment documentation: design document, resource inventory, operations runbook, backup/DR plan, compliance matrix, and cost estimate.",
    focus:
      "Read the observed inventory, cost assumptions, failed health checks, and open operational work.",
    sections: ["Design", "Resources", "Operations", "Compliance", "Cost"],
  },
  {
    id: "reviews",
    label: "Reviews",
    slug: "demo/09-reviews",
    items: [
      { label: "Overview", slug: "demo/09-reviews" },
      { label: "Requirements Review", slug: "demo/09-reviews/requirements" },
      { label: "Architecture Review", slug: "demo/09-reviews/architecture" },
      { label: "Governance Review", slug: "demo/09-reviews/governance" },
      {
        label: "Implementation Review",
        slug: "demo/09-reviews/implementation",
      },
    ],
    stepLabel: "Reviews",
    chipLabel: "R",
    shortTitle: "Adversarial Reviews",
    agent: "Challenger Agent",
    artifact: "Cross-step findings",
    summary:
      "Four review records report 1 critical ACR SKU mismatch, 2 high, 10 medium, and 13 low findings.",
    focus: "Inspect findings, severities, and recorded resolutions without assuming every issue was closed.",
    sections: ["Requirements", "Architecture", "Governance", "Implementation"],
  },
];

export const demoSteps = stepDefinitions.map((step) => ({
  ...step,
  href: `${SITE_BASE}/${step.slug}/`,
}));

export const demoStats = [
  { label: "Workflow steps", value: "7 + governance" },
  { label: "Recorded reviews", value: "4" },
  { label: "IaC track", value: "Bicep + AVM" },
  { label: "Primary region", value: "Sweden Central" },
];

export const demoSidebarItems = demoSteps.map(({ label, slug, items }) => {
  if (items) {
    return {
      label,
      collapsed: true,
      items: items.map((item) => ({
        label: item.label,
        slug: item.slug,
      })),
    };
  }
  return {
    label,
    slug,
  };
});

export function getDemoStepById(id) {
  return demoSteps.find((step) => step.id === id);
}

export function getDemoStepByHref(href) {
  return demoSteps.find((step) => step.href === href);
}

export function getAdjacentDemoSteps(id) {
  const currentIndex = demoSteps.findIndex((step) => step.id === id);

  if (currentIndex === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: demoSteps[currentIndex - 1],
    next: demoSteps[currentIndex + 1],
  };
}
