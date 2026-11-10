---
title: "Step 2: Architecture"
description: "Evaluate requirements against the Azure Well-Architected Framework and pick SKUs with the 03-Architect agent."
sidebar:
  order: 2
  label: "Step 2: Architecture"
---

## Purpose

Assess the proposed architecture against the Azure Well-Architected Framework.
Compare service and SKU choices with the workload, policy constraints, and budget.
Record the source and date of pricing evidence.

## Agent

[`03-Architect`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/03-architect.agent.md)
uses
[`cost-estimate-subagent`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/_subagents/cost-estimate-subagent.agent.md)
for pricing work permitted by the agent definition.

Pillar evidence starts from the Well-Architected service guide for each in-scope service,
found through the Azure MCP server and cited as the Microsoft Learn page. The agent also
reads `apex-azure-kubernetes` when AKS is a candidate, and `apex-azure-upgrade` when the
workload keeps an existing Functions Consumption app or Azure Cache for Redis instance.

## Choose policy evidence before Architecture

Delivery projects using `corp-policy-v1` select a policy source after Requirements approval.
The interactive owner reuses a captured choice or asks you to choose target-verified evidence
or the standard Azure Landing Zones Corp assumptions.

The shared file is `.github/data/alz-corp-policy-baseline.json.gz`. It describes the pinned
`root`, `landing_zones` and `corp` archetypes. It does not describe your tenant's custom assignments,
parameters or exemptions. Accepting it does not require a tenant ID, subscription ID or prepared JSON file.

The owner records your actual acceptance with `apex-recall policy-source --assumed-corp`.
Recall binds the shared file hash and reports `assumed_corp_not_tenant_verified`.
Architecture may reach approval with that qualification. Both independent reviews still apply.
Changed or missing baseline data requires a new source decision.

If you select tenant evidence, Governance collects it within your explicitly authorized scope.
The [Governance guide](/concepts/workflow/step-3-5/#private-scope-and-evidence) explains private capture.
Assumptions cannot satisfy IaC planning completion, CodeGen or deployment. Those actions need current,
target-verified policy evidence and their separate approvals.

Existing projects keep their recorded contract until an explicit policy-source choice adopts this one.
Adoption does not reset review attempts, rewrite completed steps or approve Azure operations.
The source and guidance pins remain separate from this contract's rollout.

## Invocation

```text
Select: 03-Architect in Copilot Chat
Output: agent-output/{project}/02-architecture-assessment.md
        agent-output/{project}/03-des-cost-estimate.md
        agent-output/{project}/03-des-sku-comparison.md
        agent-output/{project}/sku-manifest.{json,md} (rev 2)
```

## What gets produced

- An assessment of reliability, security, cost optimization, operational excellence,
  and performance efficiency.
- SKU recommendations and pricing evidence recorded in the manifest.
- Architecture decisions with alternatives and trade-offs.
- Risks, assumptions, and proposed mitigations.

## Review

The default is one `comprehensive` architecture review and a separate
`cost-feasibility` review of the cost estimate. Both are mandatory and independent.
Use the `10-Challenger` handoff for each required scope.

Deep review needs explicit owner opt-in. It changes the architecture review plan,
not the requirement for the independent cost-estimate review.

## Hand-off

After resolving findings and approving the architecture, select
[optional design](/concepts/workflow/step-3/) or go directly to
[Governance](/concepts/workflow/step-3-5/). Skipping design does not skip governance.

## See also

- [Azure WAF pillars](https://learn.microsoft.com/azure/well-architected/)
- [Well-Architected service guides](https://learn.microsoft.com/azure/well-architected/service-guides/)
- [Cost estimate
  subagent](https://github.com/jonathan-vella/apex/blob/main/.github/agents/_subagents/cost-estimate-subagent.agent.md)
  for the pricing workflow.
