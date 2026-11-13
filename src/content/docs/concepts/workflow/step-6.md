---
title: "Step 6: Deploy"
description: "Authorize deployment only after current IaC validation, a plan or what-if preview, and policy precheck."
sidebar:
  order: 7
  label: "Step 6: Deploy"
---

## Purpose

Deploy the generated IaC to the approved Azure scope. Validate the current inputs,
review the proposed changes, and obtain explicit authorization before apply.
A request for a plan or validation does not authorize deployment.

## Agents

- [`07b-Bicep Deploy`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/07b-bicep-deploy.agent.md) owns Bicep deployment and dispatches `bicep-whatif-subagent` for `what-if` previews.
- [`07t-Terraform Deploy`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/07t-terraform-deploy.agent.md) owns Terraform deployment and dispatches `terraform-plan-subagent` for plan previews.
- `policy-precheck-subagent` cross-checks live Azure Policy state against `04-governance-constraints.json` and returns a deterministic `deploy_gate` (`PROCEED` or `BLOCK`). A `PROCEED` gate is readiness evidence, not human deployment approval.

## Pre-deploy gates

Before any cloud write, the deploy agent verifies:

- Recorded Step 6 phase scope from granted owner authorization, confirming tenant ID, subscription ID, target environment, `policy_source` (`current`), and `azure_read_scope`.
- Intact tree and contract hashes across `04-environment-manifest.json`, `05-iac-handoff.json`, and generated IaC files.
- Fresh `policy-precheck-subagent` (`PROCEED`) and `bicep-whatif-subagent` or `terraform-plan-subagent` preview results covering the exact current inputs.
- When deploying a lab workload under an explicit `risk-envelope-v1` exception, verified `--risk-authorization`, `--risk-approval`, and `--deployment-context` (`non-production-lab` only, with cleanup owner and teardown deadline).

See the [shared deployment workflow](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills/apex-iac-common/references/deploy-shared-workflow.md) for phased execution and circuit-breaker rules. If Azure reports a SKU quota or regional capacity conflict during deployment, the agent halts under the block-with-escalation rule rather than substituting a SKU silently.

## Invocation

Select the main agent for the chosen track in Copilot Chat:

```text
Bicep:     07b-Bicep Deploy
Terraform: 07t-Terraform Deploy
Outputs:   agent-output/{project}/06-deployment-summary.md
           agent-output/{project}/06-policy-precheck.json
```

Review the proposed changes and costs before authorizing apply. Do not approve an
unexpected service or SKU substitution merely to get past a deployment failure.

## Review

Step 6 does not require a Challenger review. That does not remove deterministic
validation, policy precheck, deployment approval, or post-deployment verification.

Check resource provisioning and application health separately. Record failed
endpoints, unresolved configuration, and any checks that could not run.

## Hand-off

After reviewing the observed results, select
[Step 7: As-built](/concepts/workflow/step-7/). Include unresolved issues in the
handoff; do not describe an unhealthy application as a successful delivery.
