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

[`08-As-Built`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/08-as-built.agent.md)
uses the
[`apex-azure-artifacts`](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-artifacts/SKILL.md)
skill and reads every prior artifact in `agent-output/{project}/`.

## Invocation

```text
Select: 08-As-Built in Copilot Chat
Output: agent-output/{project}/07-*.md
```

## Document suite

| File                          | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `07-documentation-index.md`   | Master index linking the whole suite                 |
| `07-design-document.md`       | Technical design (architecture + decisions)          |
| `07-operations-runbook.md`    | Day-2 operational procedures                         |
| `07-resource-inventory.md`    | Complete resource listing with IDs and tags          |
| `07-ab-cost-estimate.md`      | As-built cost analysis                               |
| `07-compliance-matrix.md`     | Mapping of deployed resources to governance constraints |
| `07-backup-dr-plan.md`        | Backup, restore, and DR runbooks                     |

## Drift detection

Compare the deployed resources with `sku-manifest.json` in both directions.
Record unexpected and missing SKUs in the documentation index.

Distinguish provisioning success from application health. State which checks ran,
which failed, and which were not performed. An estimate is not an invoice, and a
compliance matrix is not an independent certification.

## Hand-off

Review the documentation against the deployment evidence. Continue with
[lessons learned](/concepts/workflow/post-lessons/) when the run exposed a problem
worth addressing in the agents, skills, or validators.
