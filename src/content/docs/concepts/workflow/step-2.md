---
title: "Step 2: Architecture"
description: "Evaluate requirements against the Azure Well-Architected Framework, select policy source, and produce evidence-backed retail pricing with 03-Architect."
sidebar:
  order: 2
  label: "Step 2: Architecture"
---

## Purpose

Evaluate the proposed architecture against all five Azure Well-Architected Framework pillars, select creative service SKUs in `sku-manifest.{json,md}`, and produce an evidence-backed monthly cost estimate.

## Agent

[`03-Architect`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/03-architect.agent.md) delegates all retail dollar calculations to [`cost-estimate-subagent`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/_subagents/cost-estimate-subagent.agent.md).

Pillar analysis starts from Microsoft Learn Well-Architected service guides retrieved via Azure MCP (`documentation`). `03-Architect` also loads `apex-azure-kubernetes` when AKS is in scope and `apex-azure-upgrade` when assessing Functions Consumption or legacy Azure Cache for Redis workloads.

## Choose policy evidence before Architecture

New delivery projects use `corp-policy-v1` to establish policy context before drafting Step 2:

- **Shared ALZ Corp assumptions (`--assumed-corp`).** Reads `.github/data/alz-corp-policy-baseline.json.gz` (`governance_baseline.py --alz-default`) covering the pinned `root`, `landing_zones`, and `corp` archetypes. Requires no Azure tenant ID, subscription ID, or sign-in, and records `assumed_corp_not_tenant_verified`. Architecture can reach Gate 2 approval with an explicit `Assumed Corp policies` qualification, while Step 4 completion, CodeGen, and deployment still require `current` target-verified policy evidence.
- **Target-verified policy evidence.** Captures non-secret tenant and subscription scope privately outside the repository and collects effective policies via `04g-Governance` (`discover.py --retain-rule-evidence`). See [private scope and evidence](/concepts/workflow/step-3-5/#private-scope-and-evidence).

Existing projects keep their recorded policy contract unless the owner explicitly runs `apex-recall policy-source`.

## Invocation

```text
Select: 01-Orchestrator or 03-Architect in Copilot Chat
Output: agent-output/{project}/02-architecture-assessment.md
        agent-output/{project}/03-des-cost-estimate.md
        agent-output/{project}/02-cost-estimate.json
        agent-output/{project}/03-des-sku-comparison.md
        agent-output/{project}/sku-manifest.{json,md} (rev 2)
```

## What gets produced

- Five-pillar WAF evaluation (`Reliability`, `Security`, `Cost Optimization`, `Operational Excellence`, `Performance Efficiency`) with trade-offs and risk mitigations.
- Authoritative SKU selections and `manifest_writeback[]` updates in `sku-manifest.{json,md}` (revision 2).
- Complete workload monthly estimate (`cost-estimate-v2`) combining manifest services and project-deployed supplemental resources (such as Private Endpoints, Private DNS zones, Key Vault, NAT Gateway, and Log Analytics).

## Pricing inputs and evidence

Every retail figure in user-facing artifacts must come from `cost-estimate-subagent` (Azure MCP `pricing_get` primary, constrained Azure Retail Prices API fallback):

- **Monthly workload estimates (`purpose: "monthly-estimate"`).** Preflight checks required storage, operation, and data-transfer dimensions before querying meters, then verifies raw response hashes, unit conversions, tier bands, and arithmetic in `02-cost-estimate.json`. Step 2 completion rejects residual `*.tmp.md` files or `FAILED` cost outputs in the project root (`step2_residue`).
- **Indicative rate quotes (`purpose: "rate-quote"`).** When the owner asks for unit rates while monthly usage is unknown, `cost-estimate-subagent` emits `retail-rate-quote-v1` with native meter units and tier bands. Rate quotes never write back to `sku-manifest.json` or satisfy Gate 2 cost-feasibility approval.
- **Documentation references vs. raw meter evidence.** Billing inclusions and exemptions use structured source/date references and short original conclusions rather than archiving whole commercial documentation pages in Git. See [cost governance](/reference/cost-governance/#reproducible-retail-pricing).

## Review

Step 2 requires **two** separate, synchronous `challenger-review-subagent` reviews before Gate 2 approval:

1. A `comprehensive` review of `02-architecture-assessment.md`.
2. An independent `cost-feasibility` review of `03-des-cost-estimate.md` and `02-cost-estimate.json`.

Both reviews can run in parallel once their `review-audit ... --attempt-outcome started` records are logged sequentially. Opting into `decisions.review_depth = "deep"` adds rotating multi-pass lenses to architecture while keeping the separate `cost-feasibility` review mandatory.

## Hand-off

After resolving review findings and approving Gate 2, advance to [Step 3: Design](/concepts/workflow/step-3/) when diagrams or ADRs are requested, or transition directly to [Step 3.5: Governance](/concepts/workflow/step-3-5/). Skipping Step 3 never skips Governance.

## See also

- [WAF assessment guide](/guides/waf-assessment/) for standalone existing-workload assessments
- [Regulated delivery showcase: architecture and pricing](/showcases/regulated-delivery/architecture-and-pricing/)
- [Cost governance](/reference/cost-governance/)
