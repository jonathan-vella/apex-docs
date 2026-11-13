---
title: "Step 7: As-built documentation"
description: "Assemble the post-deployment documentation suite from the previous artifacts and the deployed resource state."
sidebar:
  order: 8
  label: "Step 7: As-built"
---

## Purpose

Document the observed deployment for the people who will operate it. Include
the design, runbook, cost estimate, compliance evidence, recovery procedures,
resource inventory, and an index. Keep unresolved issues visible.

## Agent

[`08-As-Built`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/08-as-built.agent.md) loads [`apex-azure-artifacts`](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-artifacts/SKILL.md), queries live deployed resource state, and invokes [`cost-estimate-subagent`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/_subagents/cost-estimate-subagent.agent.md) for deployed-SKU retail cost comparison.

## Invocation

```text
Select: 01-Orchestrator or 08-As-Built in Copilot Chat
Output: agent-output/{project}/07-*.md
        agent-output/{project}/sku-manifest.{json,md} (actual_sku populated)
```

## Document suite

| File | Purpose |
| --- | --- |
| `07-documentation-index.md` | Master index linking the full suite, SKU drift summary, and unresolved gaps |
| `07-design-document.md` | Technical design combining planned decisions and deployed configurations |
| `07-operations-runbook.md` | Day-2 operational checks, alert runbooks, and maintenance procedures |
| `07-resource-inventory.md` | Complete deployed resource inventory with resource IDs, regions, and tags |
| `07-ab-cost-estimate.md` | Evidence-backed as-built monthly retail cost analysis vs. Step 2 design |
| `07-compliance-matrix.md` | Mapping of deployed resource properties to Step 3.5 governance constraints |
| `07-backup-dr-plan.md` | Backup schedules, restore verification steps, and regional failover procedures |

## Drift detection

`08-As-Built` compares deployed Azure resources against `sku-manifest.json` in both directions (`actual_sku` by environment and region vs. planned `sku`), recording unexpected, missing, or substituted SKUs without modifying live infrastructure.

Provisioning state and application health remain distinct: `08-As-Built` reports which health checks passed, which failed, and which could not run. Retail cost estimates are not Azure invoices, and compliance matrices are operational evidence rather than external audit certifications.

## Hand-off

Review the documentation against the deployment evidence. Continue with
[lessons learned](/concepts/workflow/post-lessons/) when the run exposed a problem
worth addressing in the agents, skills, or validators.
