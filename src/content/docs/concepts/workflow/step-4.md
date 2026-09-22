---
title: "Step 4: IaC plan"
description: "Translate the architecture into a machine-readable Bicep or Terraform implementation plan."
sidebar:
  order: 5
  label: "Step 4: IaC plan"
---

## Purpose

Turn approved architecture and governance evidence into an implementation plan.
Select compatible modules, pin their versions, map policy requirements to inputs,
and define the deployment sequence.

## Agent

[`05-IaC
Planner`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/05-iac-planner.agent.md)
is shared by both IaC tracks. The project's IaC selection determines its output contract.

## Invocation

```text
Select: 05-IaC Planner in Copilot Chat
Output: agent-output/{project}/04-implementation-plan.md
        agent-output/{project}/04-iac-contract.json
        agent-output/{project}/04-policy-property-map.json
        agent-output/{project}/04-environment-manifest.json
        agent-output/{project}/04-dependency-diagram.py and .png
        agent-output/{project}/04-runtime-diagram.py and .png
```

## Prerequisites

- `04-governance-constraints.{md,json}` from completed Step 3.5 discovery, with a
  valid policy array and the required review outcome.
- `sku-manifest.json` revised through Step 2.

The planner halts and asks the user to refresh governance if those preconditions fail.

## What gets produced

- Module selection from Bicep AVM or the Terraform AVM registry.
- Resource dependency map.
- CAF naming validation.
- A deployment sequence based on resource dependencies.
- Dependency and runtime diagrams with editable source.
- The IaC contract, policy-property map, and environment manifest that CodeGen
  and deployment use to check consistency.

## Review

One `comprehensive` review is the default. Select `10-Challenger` through its
handoff and resolve required findings. Deep review requires explicit owner opt-in;
complexity alone does not enable it.

:::note[Approval gate]
The user must approve the implementation plan before code generation.
:::

## Hand-off

After approving the plan and its contracts, select the appropriate CodeGen agent
for [Step 5](/concepts/workflow/step-5/).
