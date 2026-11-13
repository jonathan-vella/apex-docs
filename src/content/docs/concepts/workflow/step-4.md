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

- Current, target-verified `04-governance-constraints.{md,json}` from completed Step 3.5 discovery (`assumed_corp_not_tenant_verified` assumptions from Step 2 cannot complete Step 4 planning).
- `sku-manifest.json` revised through Step 2 and reconciled against `sku_allowlist_snapshot`.

`05-IaC Planner` halts and requests target-verified governance discovery if either precondition is missing or stale.

## What gets produced

- Pinned module selections from Bicep AVM (`br/public:avm/res/...`) or Terraform AVM (`Azure/avm-res-*/azurerm`), with explicit `### Raw Resource Exceptions` rows when no AVM module exists.
- CAF naming validation and resource dependency graph.
- Ordered deployment phases with explicit `phase` parameters (no default `phase` values).
- Editable Python source and PNG outputs for `04-dependency-diagram` and `04-runtime-diagram`.
- Machine-readable `04-iac-contract.json`, `04-policy-property-map.json`, and `04-environment-manifest.json` validated by `validate:iac-contract`, `validate:policy-property-map`, and `validate:environment-manifest`.

## Review

One `comprehensive` review via `challenger-review-subagent` is mandatory before Step 4 completion (`decisions.review_depth = "deep"` adds rotating passes when explicitly opted in). Each Plan review freezes `04-iac-contract.json`, `04-policy-property-map.json`, `04-environment-manifest.json`, and both governance constraint artifacts as supporting inputs.

### Explicit lab risk authorization

For non-production labs where an unresolved default-mode Step 4 finding is intentionally accepted, APEX supports externally signed Ed25519 `risk-envelope-v1` (`risk-authorization-v1`) envelopes verified against an operator-pinned `APEX_RISK_TRUST_CONFIG` and paired with a separate human `risk-gate-approval-v1`:

```bash
apex-recall check-gate example-lab --action plan-complete --authorization-only \
  --risk-authorization agent-output/example-lab/risk-authorization.json --json
```

Risk acceptance never alters the original `NEEDS_REVISION` review verdict or findings, never overrides failed contract or security validators, and is prohibited for production scopes. Kit-maintainer authorizations cover only `plan-complete`, `codegen`, and `code-complete`; lab deployment requires a separate adopter deployment-risk-owner authorization with teardown obligations. See [explicit lab risk acceptance](/concepts/workflow-deep-dive/#explicit-lab-risk-acceptance).

:::note[Approval gate]
Human approval of `04-implementation-plan.md` and its contracts is required before Step 5 code generation.
:::

## Hand-off

After approving the plan and contracts, transition to the track-specific CodeGen agent for [Step 5: IaC code](/concepts/workflow/step-5/).
