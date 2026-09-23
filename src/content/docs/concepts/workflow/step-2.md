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
