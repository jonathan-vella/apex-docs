---
title: "Step 5: IaC code"
description: "Generate Bicep or Terraform from the approved plan, validate it, and prepare its deployment handoff."
sidebar:
  order: 6
  label: "Step 5: IaC code"
---

## Purpose

Generate IaC from the approved Step 4 plan and machine-readable contracts.
Keep the resource graph, policy-property map, and environment manifest consistent
with the code. Produce `05-iac-handoff.json` for the deployment agent.

## Agents

Select the agent for the project's IaC track:

- [`06b-Bicep
  CodeGen`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/06b-bicep-codegen.agent.md)
- [`06t-Terraform
  CodeGen`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/06t-terraform-codegen.agent.md)

## Invocation

```text
Bicep:     Select 06b-Bicep CodeGen
           Output  infra/bicep/{project}/main.bicep + modules/
Terraform: Select 06t-Terraform CodeGen
           Output  infra/terraform/{project}/main.tf + modules/
Shared:    agent-output/{project}/05-iac-handoff.json
```

## Standards (both tracks)

- AVM-first composition; never re-derive resources by hand when an AVM module exists.
- Unique-suffix pattern for globally-named resources.
- Required tags enforced by `tag_contract` from Step 3.5.
- Apply the [security baseline](/reference/security-baseline/) and effective policy,
  including service-specific requirements and documented exceptions.
- Step 3.5 (governance) compliance mapping wired into module inputs.

## Preflight validation

| Bicep subagent            | Terraform subagent            | Validation                  |
| ------------------------- | ----------------------------- | --------------------------- |
| `bicep-validate-subagent` | `terraform-validate-subagent` | Lint + AVM code review      |

## Review

Adversarial code review is off by default and requires explicit opt-in.
Use the `10-Challenger` handoff when a code review is requested. Deterministic
build, lint, contract, and security checks still apply without that review.

:::note[Approval gate]
The user must approve preflight validation results before deployment.
:::

## Hand-off

After reviewing the validation evidence, select the track-specific deployment
agent for [Step 6](/concepts/workflow/step-6/). Validation alone does not authorize apply.
