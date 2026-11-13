---
title: "Step 1: Requirements"
description: "Capture functional, non-functional, compliance, budget, and initial SKU inputs with the 02-Requirements agent."
sidebar:
  order: 1
  label: "Step 1: Requirements"
---

## Purpose

Capture the functional, non-functional, compliance, regional, and budget requirements for an Azure workload through guided discovery. Step 1 writes `01-requirements.md` and initializes `sku-manifest.{json,md}` (revision 1).

## Agent

[`02-Requirements`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/02-requirements.agent.md)

## Invocation

```text
Select: 01-Orchestrator or 02-Requirements in Copilot Chat
Output: agent-output/{project}/01-requirements.md
        agent-output/{project}/sku-manifest.{json,md} (rev 1)
```

## What gets captured

- Business objectives, critical user flows, and IaC track (`bicep` or `terraform`).
- Availability, recovery (`RTO` and `RPO`), performance, and scale targets.
- Regulatory frameworks, organizational guardrails, and data residency (`swedencentral` by default).
- Monthly budget ceiling or cost optimization priorities.
- Partial or complete user SKU pins, plus `observed-current` SKUs when modernizing an existing workload (`services[]` may remain empty after preference capture when `03-Architect` will select SKUs in Step 2).

<span id="guided-discovery-candidate"></span>

## Guided discovery and question batching

`02-Requirements` uses `tools/scripts/requirements-discovery.mjs` to group intake into `business`, `migration`, `workload`, and `access` stages (or `--stage business --assessment-mode requirements_led` during a standalone WAF assessment):

```bash
node tools/scripts/requirements-discovery.mjs --stage business --answers captured-answers.json
```

Key discovery rules under `practical-v1`:

- Only missing material inputs appear in `ask_user`. Native fields accept custom text directly, so separate companion `*_other` or unconditional note fields are prohibited (`validate_question_batching.py`).
- Migration follow-ups appear only when the workload involves migration or modernization; greenfield runs skip them.
- Each form carries an APEX-local `request_id` recorded in `agent-output/{project}/_meta/` and bound to returned answers via `apex-recall decide --input-record`.
- When `01-Orchestrator` delegates to `02-Requirements`, the worker returns `USER_INPUT_REQUIRED` (`message` plus `requestedSchema.properties` only) and receives the complete captured-answer ledger on continuation so settled answers and explicit `Unknown` choices are preserved.

## Review

One independent `comprehensive` review via `challenger-review-subagent` is mandatory before Step 1 completion (standalone `requirements_led` assessments skip this intermediate gate and review the final bundle instead).

`02-Requirements` or `01-Orchestrator` captures metadata, runs `record-review.mjs --preflight`, dispatches `challenger-review-subagent` synchronously, and records `challenge-findings-requirements.json`. Requirements review evaluates business intent, measurable targets, and security constraints without treating open downstream architecture details as defects.

Resolve any `must_fix` findings and obtain human approval before advancing to Step 2.

## Hand-off

After approving `01-requirements.md`, transition via `apex-recall transition` to [Step 2: Architecture](/concepts/workflow/step-2/).

## See also

- [Workflow overview](/concepts/workflow/)
- [SKU manifest lifecycle](/concepts/how-it-works/sku-manifest/)
- [Agents and delegation](/concepts/how-it-works/agents/)
