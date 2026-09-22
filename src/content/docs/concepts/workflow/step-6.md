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

- [`07b-Bicep Deploy`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/07b-bicep-deploy.agent.md)
  owns Bicep deployment and its what-if preview.
- [`07t-Terraform Deploy`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/07t-terraform-deploy.agent.md)
  owns Terraform deployment and its plan preview.
- The permitted `policy-precheck-subagent` supplies policy and governance evidence.
  Its `PROCEED` result is evidence for the deployment decision, not user authorization.

## Pre-deploy gates

Confirm the tenant, subscription, target environment, resource scope, and approved
plan. Check `04-environment-manifest.json`, `05-iac-handoff.json`, current code,
and the required governance evidence.

Run the required deterministic checks, preview, and policy precheck. Reuse prior
validation only when its evidence covers the current inputs and meets the
freshness and scope requirements. A stored `security_validation_status: PASSED`
string is not sufficient by itself.

The [shared deployment contract](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/.github/skills/apex-iac-common/references/deploy-shared-workflow.md)
defines the checks. Resolve missing evidence through the owning step rather than
regenerating the project through a generic application-preparation workflow.

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
