---
title: "Run the workflow"
description: "Choose the Azure delivery workflow or a standalone WAF assessment with scoped evidence, independent reviews, and human approval gates."
---

<span id="agent-and-skill-workflow"></span>

## Overview

APEX supports two distinct workflow profiles inside the VS Code **Copilot** session target:

1. **Infrastructure delivery workflow.** Moves a workload from requirements through Well-Architected evaluation, Azure Policy discovery, IaC planning, Bicep or Terraform generation, deployment, and as-built documentation.
2. **Standalone WAF assessment (`workflow_mode=assessment`).** Evaluates an existing Azure workload, local IaC, or both, producing a five-pillar WAF report, an existing-state architecture diagram, a Cost Management report with visual charts, and a prioritized action register without generating IaC or deploying resources.

New projects default to the `practical-v1` workflow contract, which binds material user inputs to request receipts, scopes complete stage work packages, and enforces independent `challenger-review-subagent` reviews before human stage approvals. Existing projects keep their recorded workflow contract until the owner explicitly adopts `practical-v1`.

Start with the [quickstart](/getting-started/quickstart/) if you have not created a workload repository from `apex-accelerator`, or go directly to the [WAF assessment guide](/guides/waf-assessment/) to audit an existing workload.

### Runtime and approval boundaries

APEX targets the **Copilot** session target in VS Code. Active agent definitions omit fixed model pins and UI `handoffs:` buttons so model selection stays runtime-managed and `01-Orchestrator` coordinates approved steps through native tasks.

Keep these safety boundaries in mind:

- A form response or `ask_user` result records captured answers, not independent human authorization when Autopilot is active. Consequential scope, cost, policy-exception, and deployment approvals remain human-controlled.
- Runtime `.github/hooks/` chat hooks remain retired. Do not restore them during setup. Deterministic protection runs through `apex-recall` gates, validation scripts, Git Lefthook pre-commit and pre-push checks, `gitleaks`, and CI workflows. See [Copilot hooks](/concepts/how-it-works/workflow-engine/#copilot-hooks).

### Formalized workflow engine

The machine-readable [workflow graph](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills/apex-workflow-engine/templates/workflow-graph.json) defines step order, required artifacts, return edges, and review lenses for both delivery and standalone assessment runs. `apex-recall` persists session state, material decisions, review audits, and gate readiness under `agent-output/<project>/`. Neither a graph edge nor a completed step record authorizes cloud writes on its own.

## Standalone WAF assessment

For copy-paste starter prompts and variable presets, follow the [WAF assessment guide](/guides/waf-assessment/) or inspect the [WAF assessment showcase](/showcases/waf-assessment/).

Select `workflow_mode=assessment` (via `/waf-assess-existing` in `01-Orchestrator`) when you want an evidence-backed review of an existing workload without entering the delivery pipeline:

- **`evidence_only`** starts directly from scoped code, diagrams, or read-only Azure inventory with no business interview and no synthetic `01-requirements.md`.
- **`requirements_led`** runs a focused seven-question `02-Requirements` intake (with an `Unknown` choice on every field) to score the workload against explicit availability, recovery, performance, compliance, and budget targets.

The evidence source is chosen independently: `iac` (local Bicep, Terraform, `azure.yaml`, and diagrams with no Azure sign-in), `azure` (authorized read-only subscriptions), or `combined` (both, surfacing deployment drift). Static IaC represents declared intent rather than verified runtime state; unverified properties remain `unknown` or `Not assessed`.

### Start and resume an assessment

Run `apex-recall` commands inside an APEX workload repository, not `apex-docs`. Initialize only a new project; recover existing projects with `show` and `handoff` first.

After capturing the owner's upfront scope approval in `agent-output/example/_meta/assessment-scope.json` (matching [`assessmentRequest`](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/tools/schemas/session-state.schema.json)), `01-Orchestrator` starts the assessment lifecycle:

```bash
apex-recall init example --json
apex-recall assessment example --action start \
  --request agent-output/example/_meta/assessment-scope.json --json
apex-recall show example --json
apex-recall handoff example --json
```

In `show --json`, `.session.assessment_run` tracks the active assessment phase (`scope`, optional `requirements`, `evidence`, `analysis`, `diagram`, `review`, `acceptance`, `terminal`), `.session.assessment_readiness` reports current validation, and `.session.assessment_cost_plan` reflects captured Cost Management periods. Never call numeric delivery `complete-step` commands on a standalone assessment.

Within the approved scope, `01-Orchestrator` runs evidence collection (`collect-assessment-evidence.py` with secret and tag-value redaction), `03-Architect` WAF and Cost Management analysis, visual chart rendering (`render-assessment-charts.py` when `visual_charts: true`, setting `assessment-bundle-v3`), `04-Design` existing-state diagram generation, and both mandatory `challenger-review-subagent` lenses (`comprehensive` WAF and `cost-feasibility`) before presenting one final acceptance prompt.

### Assessment bundle and Action Register

Paths below are relative to `agent-output/example/`:

| Output | Purpose |
| --- | --- |
| `README.md` and `00-handoff.md` | Executive bundle index, current phase, and resume or terminal status |
| `01-assessment-brief.md` | Upfront scope receipt, scenario, source, and reporting periods |
| `01-requirements.md` | Captured business objectives and NFR targets (`requirements_led` only) |
| `contracts/assessment-evidence.json` | Coverage inventory and redacted evidence locators |
| `02-architecture-assessment.md` and `assets/02-waf-posture.svg` | Five-pillar WAF findings, posture chart, confidence labels, and gaps |
| `assets/03-des-diagram.{py,png,svg}` | Reproducible Python source plus 4K PNG and editable SVG topology diagrams |
| `03-cost-management-report.md`, `assets/03-cost-trends.svg`, `assets/03-cost-drivers.svg`, and `contracts/03-cost-management.json` | Actual/Amortized Cost history and forecast (separate views and currencies), or labelled IaC retail estimates |
| `contracts/assessment-action-register.json` | Canonical remediation actions, financial bases, and target windows |
| `04-assessment-action-register.md` and `assets/04-assessment-action-register.xlsx` | Synchronized Markdown and three-sheet Excel workbook (`Action Register`, `Financial Summary`, `Basis & Evidence`) |
| `reviews/challenge-findings-*.json` | Independent `comprehensive` WAF and `cost-feasibility` review receipts |

The `04-` prefix on the Action Register does not indicate delivery Step 4. New `azure` and `combined` runs include the register automatically; `iac` runs include it when `"action_register": true` is set in scope. See [assessment costs and proposed recurring changes](/reference/cost-governance/#assessment-costs-and-proposed-recurring-changes).

### Offline register CLI

The [action-register contract](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills/apex-azure-artifacts/references/assessment-action-register.md) validates evidence links, calculates recurring additions, savings, and net monthly change, and renders synchronized Markdown and Excel outputs offline:

```bash
node tools/scripts/assessment-action-register.mjs validate \
  --root agent-output/example \
  --input agent-output/example/contracts/assessment-action-register.json \
  --as-of '<current-ISO-timestamp>'
node tools/scripts/assessment-action-register.mjs calculate \
  --root agent-output/example \
  --input agent-output/example/contracts/assessment-action-register.json \
  --as-of '<current-ISO-timestamp>'
node tools/scripts/assessment-action-register.mjs render \
  --root agent-output/example \
  --input agent-output/example/contracts/assessment-action-register.json \
  --as-of '<current-ISO-timestamp>'
node tools/scripts/assessment-action-register.mjs validate-export \
  --root agent-output/example \
  --input agent-output/example/contracts/assessment-action-register.json \
  --as-of '<current-ISO-timestamp>'
```

Always edit `contracts/assessment-action-register.json` and regenerate both views through the Node CLI rather than hand-editing spreadsheet cells.

### Original runs and explicit adoption

Earlier runs remain on their recorded `bundle_contract` until explicitly adopted. Preview adoption first with `--dry-run`:

```bash
apex-recall assessment example --action adopt \
  --request agent-output/example/_meta/assessment-adoption.json --dry-run --json
```

Actual adoption requires a new positive owner receipt, preserves prior step history and consumed review allowances, and authorizes no new Azure reads.

### Acceptance is terminal

At final review, the owner selects **Accept assessment bundle**, **Revise reports**, or **Stop without accepting**. Accepting the bundle sets the assessment to `terminal` and never triggers Governance, IaC planning, code generation, or deployment. To remediate findings later, start a separate delivery project and pass `02-architecture-assessment.md` and `04-assessment-action-register.md` as input context.

## Agent architecture

### Select policy evidence before Architecture

New delivery projects use `corp-policy-v1` to separate early architecture assumptions from private tenant snapshots. After Step 1 approval, the owner chooses either target-verified Azure Policy discovery or explicit acceptance of the pinned Azure Landing Zones Corp baseline (`.github/data/alz-corp-policy-baseline.json.gz`).

Accepting shared Corp assumptions allows Step 2 Architecture approval without target tenant or subscription IDs (`assumed_corp_not_tenant_verified`). Completing Step 4 IaC planning, running Step 5 CodeGen, and executing Step 6 deployment require `current` target-verified policy evidence. See [Step 2 policy selection](/concepts/workflow/step-2/#choose-policy-evidence-before-architecture) and [Step 3.5 private capture](/concepts/workflow/step-3-5/#private-scope-and-evidence).

### Requirements capture and revision

`02-Requirements` captures workload goals, compliance frameworks, regional residency, budget, IaC track (`bicep` or `terraform`), and initial SKU pins or `observed-current` SKUs. When directly selected, `02-Requirements` asks missing material questions through native `ask_user`. When delegated by `01-Orchestrator`, it returns a validated `USER_INPUT_REQUIRED` payload and receives the full captured-answer ledger on continuation so settled inputs are never asked twice.

### Review finalization and recovery

Automatic workflow gates and optional manual `10-Challenger` runs share the read-only `challenger-review-subagent` leaf under [`one-shot-review.md`](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills/apex-azure-defaults/references/one-shot-review.md):

1. The interactive parent freezes immutable inputs with `validate-challenger-findings.mjs --metadata`, runs `record-review.mjs --preflight`, and logs `apex-recall review-audit ... --attempt-outcome started`.
2. The parent dispatches `challenger-review-subagent` synchronously with no model or reasoning-effort overrides, passing either inline `APEX_REVIEW` JSON or a hash-bound `APEX_REVIEW_FILE` envelope (`request_path` plus `request_sha256`) when a request carries large `supporting_inputs` lists.
3. The leaf reads only supplied artifacts and checklists, runs no shell commands or writes, and returns raw schema-conforming JSON findings.
4. `record-review.mjs` stamps finding IDs, severity counts, and verified input hashes into `challenge-findings-*.json`, and `apex-recall` blocks `complete-step` or `transition --complete` if required reviews are missing, stale, or hold unresolved `must_fix` findings.

Under `practical-v1`, each required artifact and lens has an ordinary budget of one initial dispatch and at most one closure dispatch after batched owned repairs. If a delegated step worker lacks nested task access, it returns `REVIEW_REQUIRED` and `01-Orchestrator` runs `challenger-review-subagent` automatically as a sibling task. If state or lock files block recovery, follow [session debugging](/guides/session-debugging/).

### Governance closure

`04g-Governance` discovers effective Azure Policy assignments, definitions, and exemptions across subscription and inherited management-group scopes using `discover.py --retain-rule-evidence`. An empty policy array can skip the `governance-reconciliation` review, whereas a failed or unauthorized query blocks progress.

### Planning feasibility

`05-IaC Planner` reconciles the approved architecture, `sku-manifest.json`, and `04-governance-constraints.json` into `04-implementation-plan.md`, `04-iac-contract.json`, `04-policy-property-map.json`, and `04-environment-manifest.json`. Module and SKU incompatibilities are resolved during planning rather than substituted silently during deployment.

### The orchestrator pattern

Select `01-Orchestrator` to drive the multi-step pipeline, or select an interactive step owner directly. Before each transition, `01-Orchestrator` updates `00-handoff.md` and `apex-recall` checkpoints so any interrupted run can resume deterministically via `apex-recall handoff <project> --json`.

<span id="agent-delegation-graph"></span>

`01-Orchestrator` dispatches main step workers; step workers call only their authorized leaf subagents (`challenger-review-subagent`, `cost-estimate-subagent`, `bicep-validate-subagent`, `bicep-whatif-subagent`, `terraform-validate-subagent`, `terraform-plan-subagent`, and `policy-precheck-subagent`). Leaf subagents never delegate further or prompt the user.

## Agent roster

### Primary orchestrator

`01-Orchestrator` is human-selected (`disable-model-invocation: true`) and coordinates step routing, question presentation for delegated workers, sibling Challenger reviews, and atomic `apex-recall transition` updates.

### Core agents by workflow step

| Step | Owner | Primary outputs |
|---|---|---|
| [1: Requirements](/concepts/workflow/step-1/) | `02-Requirements` | `01-requirements.md` and `sku-manifest.{json,md}` (rev 1) |
| [2: Architecture](/concepts/workflow/step-2/) | `03-Architect` | `02-architecture-assessment.md`, `03-des-cost-estimate.md`, and `sku-manifest.{json,md}` (rev 2) |
| [3: Design, optional](/concepts/workflow/step-3/) | `04-Design` | `03-des-diagram.{py,png,svg}` and `03-des-adr-*.md` |
| [3.5: Governance](/concepts/workflow/step-3-5/) | `04g-Governance` | `04-governance-constraints.{md,json}` (and private snapshots when configured) |
| [4: IaC plan](/concepts/workflow/step-4/) | `05-IaC Planner` | `04-implementation-plan.md`, `04-iac-contract.json`, `04-policy-property-map.json`, `04-environment-manifest.json`, and diagrams |
| [5: IaC code](/concepts/workflow/step-5/) | `06b-Bicep CodeGen` or `06t-Terraform CodeGen` | `infra/bicep/{project}/` or `infra/terraform/{project}/` plus `05-iac-handoff.json` |
| [6: Deploy](/concepts/workflow/step-6/) | `07b-Bicep Deploy` or `07t-Terraform Deploy` | `06-deployment-summary.md` and `06-policy-precheck.json` |
| [7: As-built](/concepts/workflow/step-7/) | `08-As-Built` | `07-*.md` operational, inventory, cost, compliance, and DR suite |

### Validation subagents

Leaf subagents execute bounded pricing, lint, preview, policy-precheck, or structured review tasks for their parent agent. Inspect the full relationship graph in the [Architecture Explorer](/reference/architecture-explorer/).

### Standalone agents

`09-Diagnose` investigates live Azure workload health using KQL and AppLens diagnostics, `10-Challenger` supports optional manual review sessions, and `11-Context Optimizer` audits Copilot debug logs and prompt token budgets without modifying agent files directly.

## Approval gates

Every delivery stage gate requires clean or explicitly exception-authorized review evidence and human approval before advancing. For non-production labs at Step 4, APEX supports signed Ed25519 `risk-envelope-v1` risk authorizations paired with separate human `risk-gate-approval-v1` files while preserving the original `NEEDS_REVISION` findings unchanged.

Step 6 deployment always requires explicit authorization for the exact tenant, subscription, environment, and previewed change set. Validation or what-if previews never authorize `az` or `terraform apply`.

## Workflow steps

<span id="step-1-requirements--scribe"></span>

### Step 1: requirements

Capture workload scope, NFR targets, residency, budget, IaC choice, and initial SKU pins or `observed-current` SKUs in `01-requirements.md` and `sku-manifest.{json,md}`.

<span id="step-2-architecture-️-oracle"></span>

### Step 2: architecture

Evaluate the design against all five Azure WAF pillars, select policy source (`corp-policy-v1`), produce evidence-backed retail pricing via `cost-estimate-subagent`, and pass separate `comprehensive` and `cost-feasibility` reviews.

<span id="step-3-design-artifacts--artisan--optional"></span>

### Step 3: design

Generate reproducible Python architecture diagrams and WAF-mapped Architecture Decision Records when visual or ADR artifacts are needed before Governance.

<span id="step-35-governance-️-warden"></span>

### Step 3.5: governance

Discover effective subscription and management-group Azure Policy assignments (`discover.py --retain-rule-evidence`), project SKU allowlists, and pass `governance-reconciliation` review when policies apply.

<span id="step-4-planning--strategist"></span>

### Step 4: planning

Produce the phased implementation plan, AVM module pins, CAF naming checks, policy-property map, and environment manifest against current target-verified policy evidence.

<span id="step-5-implementation-️-forge"></span>

### Step 5: code generation

Generate AVM-first Bicep or Terraform modules, pass lint and security-baseline validators, and seal `05-iac-handoff.json`.

<span id="step-6-deployment--envoy"></span>

### Step 6: deployment

Verify phase scope, run `policy-precheck-subagent` and `what-if` or `terraform plan`, obtain explicit apply approval, deploy in ordered phases, and verify resource and application health separately.

<span id="step-7-documentation--chronicler"></span>

### Step 7: as-built documentation

Generate the `07-*.md` operational suite from deployed state, calculate bidirectional SKU and cost drift against `sku-manifest.json`, and optionally record [Post-Lessons](/concepts/workflow/post-lessons/).

## Complexity classification

Workload complexity informs architecture trade-offs, not review depth. Multi-pass rotating Challenger reviews run only when the owner explicitly sets `decisions.review_depth = "deep"` or invokes `10-Challenger` directly.

### Adversarial review matrix

| Step | Mandatory `challenger-review-subagent` review |
|---|---|
| Step 1: Requirements | 1x `comprehensive` |
| Step 2: Architecture | 1x `comprehensive` plus 1x separate `cost-feasibility` (`deep` opt-in adds rotating passes) |
| Step 3: Design | Opt-in (`comprehensive` on ADRs; skipped when Step 3 is skipped) |
| Step 3.5: Governance | 1x `governance-reconciliation` (skipped only when the verified policy list is empty) |
| Step 4: IaC plan | 1x `comprehensive` (`deep` opt-in) |
| Step 5: IaC code | Opt-in (deterministic lint, contract, and security validators always run) |
| Step 6: Deploy | None (`policy-precheck-subagent` and deployment preview gate apply) |

## Agents vs skills

Main agents own interactive conversations, domain deliverables, and phase checkpoints. Skills under `.github/skills/apex-*/SKILL.md` provide on-demand procedures, scripts, and templates without granting extra tool or cloud permissions. Leaf subagents run isolated, stateless checks or pricing queries on behalf of their parent agent.

## Quick reference

<span id="using-the-orchestrator-recommended"></span>

### Using the orchestrator

Select `01-Orchestrator` in VS Code Copilot Chat to start a delivery project, run `/waf-assess-existing`, or send `resume <project>` to continue from the last recorded `apex-recall` checkpoint.

### Direct agent invocation

Select `02-Requirements`, `03-Architect`, `04-Design`, `04g-Governance`, `05-IaC Planner`, `06b-Bicep CodeGen`, `06t-Terraform CodeGen`, `07b-Bicep Deploy`, `07t-Terraform Deploy`, or `08-As-Built` directly when working on a single step whose upstream prerequisites are already satisfied.

### Skill invocation

Invoke user-invocable workflow skills such as `/apex-workflow-start`, `/apex-github-operations`, or `/apex-debug-log-export` inside Copilot Chat. Invoking a skill loads its instructions into the current chat without bypassing step gates or cloud authorization.

## Artifact naming convention

Project deliverables live in `agent-output/{project}/`, while generated IaC lives under `infra/bicep/{project}/` or `infra/terraform/{project}/`. Numeric filename prefixes (`01-` through `09-`) follow historical artifact slots. For example, Step 2 writes `03-des-cost-estimate.md`, Step 3.5 writes `04-governance-constraints.{md,json}`, and standalone assessments write `04-assessment-action-register.md`. Check each step page for exact filenames.

## Next steps

Read the [workflow deep dive](/concepts/workflow-deep-dive/) for context surfaces and Azure Landing Zones integration, or inspect completed deliverables in the [showcases](/showcases/).
