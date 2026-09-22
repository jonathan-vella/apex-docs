---
title: "Step 3.5: Governance"
description: "Discover Azure Policy assignments and emit a machine-readable governance constraint set."
sidebar:
  order: 4
  label: "Step 3.5: Governance"
---

## Purpose

Discover **effective** Azure Policy assignments (including management-group-inherited ones),
classify their effects, and emit the `04-governance-constraints.{md,json}` artifacts that gate
downstream IaC planning and deployment.

## Agent

[`04g-Governance`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/04g-governance.agent.md)
uses the
[`apex-azure-governance-discovery`](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-governance-discovery/SKILL.md)
skill.

## Invocation

```text
Select: 04g-Governance in Copilot Chat
Output: agent-output/{project}/04-governance-constraints.md
        agent-output/{project}/04-governance-constraints.json
```

## What gets discovered

- Policy assignments at subscription + management-group scope.
- Policy definitions and exemptions referenced by assignments.
- Effect classification (`Deny`, `Audit`, `Modify`, `DeployIfNotExists`).
- Property mapping through `bicepPropertyPath` and `azurePropertyPath` for downstream validation.
- SKU allowlist projection via `derive-sku-allowlist.mjs`, written into
  `sku-manifest.sku_allowlist_snapshot`.

## Review

One `governance-reconciliation` review is mandatory when constraints exist. Use
the `10-Challenger` handoff. An empty policy array can skip this review, but failed
or incomplete discovery does not establish that the scope has no constraints.

:::note[Approval gate]
The user must approve governance constraints before proceeding to Step 4 planning.
:::

## Hand-off

After approving the constraints, select [Step 4: IaC plan](/concepts/workflow/step-4/).
