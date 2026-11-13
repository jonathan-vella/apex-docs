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

<span id="standards-both-tracks"></span>

## Standards for both tracks

- Current target-verified policy evidence (`corp-policy-v1` status `current`) and recorded Step 5 phase scope covering every target environment before entry.
- AVM-first composition (`br/public:avm/res/...` or `Azure/avm-res-*/azurerm`); raw resources require documented Step 4 exceptions.
- Deterministic unique-suffix naming for globally scoped Azure resources and `.bicepparam` LF line-ending preservation across platforms.
- Required tags enforced by `tag_contract` from Step 3.5 (with the lowercase 9-tag greenfield fallback when no tag policy exists).
- Full [security baseline](/reference/security-baseline/) and `04-policy-property-map.json` wiring across all generated modules.

## Preflight validation

| Bicep subagent | Terraform subagent | Validation |
| --- | --- | --- |
| `bicep-validate-subagent` | `terraform-validate-subagent` | Build/validate, lint, AVM compliance, security baseline, and governance property checks |

## Review

Challenger review at Step 5 is opt-in via `challenger-review-subagent` (or manual `10-Challenger`). Deterministic build, format, lint, IaC contract consistency (`validate:iac-contract-consistency`), SKU coverage (`validate:sku-iac-coverage`), and security-baseline (`validate:iac-security-baseline`) checks always apply before `05-iac-handoff.json` is sealed.

:::note[Approval gate]
Human approval of the generated IaC and preflight validation results is required before advancing to Step 6.
:::

## Hand-off

After reviewing the validation results and `05-iac-handoff.json`, transition to the track-specific deployment agent for [Step 6: Deploy](/concepts/workflow/step-6/). Passing CodeGen validation never authorizes cloud deployment.
