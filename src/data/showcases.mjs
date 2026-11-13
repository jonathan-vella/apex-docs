import { SITE_BASE } from "./siteConfig.mjs";

const withBase = (route) => `${SITE_BASE}${route}`;

export const showcasesHub = {
  slug: "showcases",
  href: withBase("/showcases/"),
  title: "Enterprise showcases",
  summary:
    "Inspect two verified APEX artifact bundles: a read-only four-subscription brownfield WAF and cost assessment, and a policy-bound Bicep platform archetype for a vended Azure Landing Zone spoke.",
};

const trackDefinitions = [
  {
    id: "waf-assessment",
    label: "Brownfield WAF and cost assessment",
    shortTitle: "WAF and cost assessment",
    slug: "showcases/waf-assessment",
    workflowMode: "Standalone assessment (workflow_mode=assessment)",
    contractBadge: "assessment-bundle-v3",
    summary:
      "Read-only existing-state assessment across one tenant and four Azure subscriptions, covering five WAF pillars, ActualCost and AmortizedCost reconciliation, eight topology and inventory views, and an 18-item nonbinding action register.",
    stats: [
      { label: "Authorized scope", value: "4 subscriptions · 22 RGs" },
      { label: "Reconciled inventory", value: "211 resources · 59 types" },
      { label: "October returned spend", value: "$1,050.07 USD" },
      { label: "Action register", value: "18 nonbinding actions" },
    ],
    pages: [
      {
        id: "overview",
        label: "Overview and authorized scope",
        shortTitle: "Overview and authorized scope",
        slug: "showcases/waf-assessment",
        stepLabel: "Assessment brief",
        chipLabel: "Scope",
        agent: "02-Requirements · 03-Architect",
        artifact: "01-assessment-brief.md · 01-requirements.md",
        summary:
          "Read-only scope authorization across four subscriptions, seven scalar inspection categories, explicit secret and tag-value exclusions, and terminal bundle rules.",
        focus:
          "How APEX bounds brownfield discovery without reading secrets, keys, connection strings, or tag values.",
        sections: [
          "Authorized subscriptions",
          "Scalar read categories",
          "Non-read boundaries",
          "Terminal lifecycle",
        ],
      },
      {
        id: "waf-posture",
        label: "Five-pillar WAF posture",
        shortTitle: "Five-pillar WAF posture",
        slug: "showcases/waf-assessment/waf-posture",
        stepLabel: "WAF posture",
        chipLabel: "WAF",
        agent: "03-Architect",
        artifact: "02-architecture-assessment.md · 02-waf-posture.svg",
        summary:
          "Bounded WAF pillar scores on observed controls only, keeping unverified runtime behavior out of the denominator and leaving Cost Optimization unassessed below the two-check threshold.",
        focus:
          "Why Security scores 7.3 while Cost Optimization stays unassessed when budgets and reservations are not observed.",
        sections: [
          "Scoring method",
          "Pillar breakdown",
          "Policy compliance rows",
          "Observed strengths and risks",
        ],
      },
      {
        id: "cost-analysis",
        label: "Actual and amortized cost analysis",
        shortTitle: "Actual and amortized cost analysis",
        slug: "showcases/waf-assessment/cost-analysis",
        stepLabel: "Cost evidence",
        chipLabel: "Cost",
        agent: "03-Architect",
        artifact: "03-cost-management-report.md · 03-amortized-cost-supplement.md",
        summary:
          "Closed-month ActualCost and AmortizedCost series across all four subscriptions, separate Forecast API projections, top service drivers, and resource-group reconciliation.",
        focus:
          "How empty billing slices, inferred currencies, and Forecast API totals are separated from closed-month actuals.",
        sections: [
          "Subscription spend",
          "Amortized comparison",
          "Forecast split",
          "Service and RG drivers",
        ],
      },
      {
        id: "topology-and-inventory",
        label: "Existing-state topology and inventory",
        shortTitle: "Existing-state topology and inventory",
        slug: "showcases/waf-assessment/topology-and-inventory",
        stepLabel: "Topology and inventory",
        chipLabel: "Inventory",
        agent: "04-Design · apex-python-diagrams",
        artifact: "03-des-diagram.svg · 03-des-network-01.svg · 6 inventory SVGs",
        summary:
          "Family-complete inventory across 22 resource groups, 211 resources, 59 ARM resource types, 5 virtual networks, and 10 subnets.",
        focus:
          "Cross-resource-group subnet placement in Member 01, absent shared Bastion, and unattributed lab resource groups in Member 02.",
        sections: [
          "Estate reconciliation",
          "Spoke network configuration",
          "Subscription inventory views",
          "Observed drift",
        ],
      },
      {
        id: "reviews-and-register",
        label: "Challenger closures and action register",
        shortTitle: "Challenger closures and action register",
        slug: "showcases/waf-assessment/reviews-and-register",
        stepLabel: "Reviews and register",
        chipLabel: "Reviews",
        agent: "challenger-review-subagent · 03-Architect",
        artifact: "challenge-findings-*.json · 04-assessment-action-register.md",
        summary:
          "Independent architecture and cost-feasibility review closures, retained advisory findings, and the 18-item nonbinding remediation register.",
        focus:
          "How Challenger review caught workbook formula mismatches and empty-slice currency labels before bundle acceptance.",
        sections: [
          "WAF review closure",
          "Cost review closure",
          "Retained advisory findings",
          "18-item action register",
        ],
      },
    ],
  },
  {
    id: "regulated-delivery",
    label: "Regulated landing-zone delivery",
    shortTitle: "Regulated delivery",
    slug: "showcases/regulated-delivery",
    workflowMode: "Delivery workflow (Steps 1 to 5 CoE archetype)",
    contractBadge: "practical-v1 · risk-envelope-v1",
    summary:
      "Reusable Bicep modernization platform archetype for a vended Corp spoke, pairing Azure Retail Prices API estimates, eight ADRs, live Azure Policy Deny reconciliation, lab risk-authorization envelopes, and ten AVM-first Bicep modules.",
    stats: [
      { label: "Verified retail estimate", value: "$1,320.95/mo ($1.81/hr)" },
      { label: "Governance reconciled", value: "25 policies · 19 Deny" },
      { label: "Design decisions", value: "8 ADRs · 7 SVG diagrams" },
      { label: "IaC implementation", value: "10 Bicep modules · 36 resources" },
    ],
    pages: [
      {
        id: "overview",
        label: "Overview and vended spoke brief",
        shortTitle: "Overview and vended spoke brief",
        slug: "showcases/regulated-delivery",
        stepLabel: "Step 1 · Requirements",
        chipLabel: "Step 1",
        agent: "02-Requirements",
        artifact: "01-requirements.md · sku-manifest.md (rev 3)",
        summary:
          "Center of Excellence platform kit for Contoso University inside an existing vended spoke, requiring three adopter inputs and zero duplicate VNet or Private DNS deployments.",
        focus:
          "How CoE authoring (Steps 1 to 5) separates platform kit validation from member subscription deployment (Steps 6 and 7).",
        sections: [
          "CoE and adopter split",
          "Vended spoke contract",
          "Three-input interface",
          "Pinned SKU manifest",
        ],
      },
      {
        id: "architecture-and-pricing",
        label: "Architecture and retail pricing",
        shortTitle: "Architecture and retail pricing",
        slug: "showcases/regulated-delivery/architecture-and-pricing",
        stepLabel: "Step 2 · Architecture",
        chipLabel: "Step 2",
        agent: "03-Architect · cost-estimate-subagent",
        artifact: "02-architecture-assessment.md · 03-des-cost-estimate.md",
        summary:
          "WAF trade-off scoring for a lab SLA target and retail pricing verification at $1,320.95 per month ($1.81 per hour), 1.1% under the $1.83 hourly ceiling.",
        focus:
          "Why private-endpoint policy mandates drive over half of monthly run cost, and how the weekday SQL MI schedule saves $314.32 per month after cutover.",
        sections: [
          "WAF pillar scores",
          "Retail pricing breakdown",
          "Hybrid Benefit comparison",
          "Post-cutover schedule savings",
        ],
      },
      {
        id: "design-and-adrs",
        label: "Architecture decisions and network design",
        shortTitle: "Architecture decisions and network design",
        slug: "showcases/regulated-delivery/design-and-adrs",
        stepLabel: "Step 3 · Design",
        chipLabel: "Step 3",
        agent: "04-Design",
        artifact: "03-des-adr-0001..0008.md · 03-des-network-diagram.svg",
        summary:
          "Service and network topology across snet-app, snet-pe, and snet-sqlmi, backed by eight Architecture Decision Records covering compute, SQL MI Link, Premium PaaS tiers, ACR import bypass, and cost controls.",
        focus:
          "How each ADR maps a live landing-zone constraint or migration requirement to a concrete Bicep configuration.",
        sections: [
          "Service topology",
          "Spoke network paths",
          "ADR-0001 to ADR-0004",
          "ADR-0005 to ADR-0008",
        ],
      },
      {
        id: "governance-and-risk",
        label: "Policy reconciliation and lab risk contract",
        shortTitle: "Policy reconciliation and lab risk contract",
        slug: "showcases/regulated-delivery/governance-and-risk",
        stepLabel: "Step 3.5 · Governance",
        chipLabel: "Step 3.5",
        agent: "04g-Governance · challenger-review-subagent",
        artifact: "04-governance-constraints.md · risk/risk-authorization.r2.json",
        summary:
          "Live Azure Policy discovery retaining 25 assignments and 19 Deny blockers, paired with hash-bound lab risk-authorization records that preserve unresolved Challenger findings without authorizing deployment.",
        focus:
          "How risk-envelope-v1 authorizes reusable lab kit authoring while keeping adopter deployment gates and teardown obligations intact.",
        sections: [
          "Live policy scan",
          "19 Deny blockers",
          "Tag fallback contract",
          "Hash-bound lab risk envelope",
        ],
      },
      {
        id: "plan-and-bicep",
        label: "Implementation plan and AVM Bicep modules",
        shortTitle: "Implementation plan and AVM Bicep modules",
        slug: "showcases/regulated-delivery/plan-and-bicep",
        stepLabel: "Steps 4 and 5 · Plan and Bicep",
        chipLabel: "Steps 4-5",
        agent: "05-IaC Planner · 06b-Bicep CodeGen · bicep-validate-subagent",
        artifact: "04-implementation-plan.md · infra/bicep/university/",
        summary:
          "Subscription-scope Bicep orchestration across 10 modules and 36 planned resources, ordering RBAC and private endpoints ahead of container startup and verifying templates with ARM Provider preflight.",
        focus:
          "ID-free main.bicepparam environment inputs, DINE-safe private endpoints, web-app.bicep baseline scanner isolation, and PowerShell 7 azd hooks.",
        sections: [
          "Module dependency graph",
          "Runtime authentication flow",
          "10 Bicep modules",
          "Hooks and ARM validation",
        ],
      },
    ],
  },
];

export const showcaseTracks = trackDefinitions.map((track) => ({
  ...track,
  href: withBase(`/${track.slug}/`),
  pages: track.pages.map((page) => ({
    ...page,
    trackId: track.id,
    trackLabel: track.label,
    trackShortTitle: track.shortTitle,
    trackHref: withBase(`/${track.slug}/`),
    href: withBase(`/${page.slug}/`),
  })),
}));

export const showcasesSidebarItems = [
  { label: "Showcases overview", slug: "showcases" },
  ...showcaseTracks.map((track) => ({
    label: track.label,
    collapsed: true,
    items: track.pages.map((page) => ({
      label: page.label,
      slug: page.slug,
    })),
  })),
];

export const legacyDemoRedirects = {
  "/demo/": "/showcases/",
  "/demo/01-requirements/": "/showcases/regulated-delivery/",
  "/demo/01-requirements/functional/": "/showcases/regulated-delivery/",
  "/demo/01-requirements/compliance-security/":
    "/showcases/regulated-delivery/governance-and-risk/",
  "/demo/01-requirements/budget-scaling/":
    "/showcases/regulated-delivery/architecture-and-pricing/",
  "/demo/02-architecture/":
    "/showcases/regulated-delivery/architecture-and-pricing/",
  "/demo/02-architecture/waf-assessment/":
    "/showcases/waf-assessment/waf-posture/",
  "/demo/02-architecture/sizing-pricing/":
    "/showcases/regulated-delivery/architecture-and-pricing/",
  "/demo/03-design/": "/showcases/regulated-delivery/design-and-adrs/",
  "/demo/03-design/adrs/": "/showcases/regulated-delivery/design-and-adrs/",
  "/demo/03-design/cost/": "/showcases/waf-assessment/cost-analysis/",
  "/demo/04-governance/": "/showcases/regulated-delivery/governance-and-risk/",
  "/demo/04-governance/tags/":
    "/showcases/regulated-delivery/governance-and-risk/",
  "/demo/04-governance/security/":
    "/showcases/regulated-delivery/governance-and-risk/",
  "/demo/05-plan/": "/showcases/regulated-delivery/plan-and-bicep/",
  "/demo/05-plan/modules/": "/showcases/regulated-delivery/plan-and-bicep/",
  "/demo/05-plan/phases/": "/showcases/regulated-delivery/plan-and-bicep/",
  "/demo/06-code/": "/showcases/regulated-delivery/plan-and-bicep/",
  "/demo/06-code/artifacts/": "/showcases/regulated-delivery/plan-and-bicep/",
  "/demo/06-code/validation/": "/showcases/regulated-delivery/plan-and-bicep/",
  "/demo/07-deploy/": "/showcases/regulated-delivery/plan-and-bicep/",
  "/demo/07-deploy/phases/": "/showcases/regulated-delivery/plan-and-bicep/",
  "/demo/07-deploy/outputs/": "/showcases/regulated-delivery/plan-and-bicep/",
  "/demo/08-as-built/": "/showcases/waf-assessment/topology-and-inventory/",
  "/demo/08-as-built/design/":
    "/showcases/waf-assessment/topology-and-inventory/",
  "/demo/08-as-built/runbook/":
    "/showcases/waf-assessment/reviews-and-register/",
  "/demo/08-as-built/compliance/": "/showcases/waf-assessment/cost-analysis/",
  "/demo/09-reviews/": "/showcases/waf-assessment/reviews-and-register/",
  "/demo/09-reviews/requirements/": "/showcases/regulated-delivery/",
  "/demo/09-reviews/architecture/":
    "/showcases/waf-assessment/reviews-and-register/",
  "/demo/09-reviews/governance/":
    "/showcases/regulated-delivery/governance-and-risk/",
  "/demo/09-reviews/implementation/":
    "/showcases/regulated-delivery/governance-and-risk/",
};

function normalizePathname(pathname) {
  if (!pathname) return "/";
  const stripped = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
  return stripped || "/";
}

export function getShowcaseTrackById(id) {
  return showcaseTracks.find((track) => track.id === id) || null;
}

export function getShowcaseContext(pathname) {
  const norm = normalizePathname(pathname);
  const hubNorm = normalizePathname(showcasesHub.href);

  if (norm === hubNorm) {
    return {
      inShowcases: true,
      isHub: true,
      isTrackRoot: false,
      hub: showcasesHub,
      track: null,
      page: null,
      previous: null,
      next: null,
    };
  }

  for (const track of showcaseTracks) {
    const pageIndex = track.pages.findIndex(
      (candidate) => normalizePathname(candidate.href) === norm,
    );
    if (pageIndex !== -1) {
      const page = track.pages[pageIndex];
      return {
        inShowcases: true,
        isHub: false,
        isTrackRoot: pageIndex === 0,
        hub: showcasesHub,
        track,
        page,
        previous: pageIndex > 0 ? track.pages[pageIndex - 1] : null,
        next:
          pageIndex < track.pages.length - 1
            ? track.pages[pageIndex + 1]
            : null,
      };
    }
  }

  return {
    inShowcases: norm.startsWith(`${hubNorm}/`),
    isHub: false,
    isTrackRoot: false,
    hub: showcasesHub,
    track: null,
    page: null,
    previous: null,
    next: null,
  };
}

export const getShowcaseContextByPathname = getShowcaseContext;
