---
title: "Workflow prompts"
description: "Copy-paste starter prompts for 01-Orchestrator, /waf-assess-existing, resume, step owners, and user-invocable skills."
---

Confirm the VS Code Copilot session target is **Copilot** and select the named agent in the picker before sending a prompt. Prompts never bypass required Challenger reviews or authorize cloud deployments on their own. See the [workflow overview](/concepts/workflow/) for step gates.

<span id="end-to-end-orchestrator"></span>

## End-to-end with `01-Orchestrator`

Select `01-Orchestrator` to start a new delivery project or resume an existing run:

```text
Start an APEX project named patient-portal.
We have 500 staff, 50,000 patients, and 10,000 daily active users in swedencentral.
Use Bicep. Guide me through missing requirements, policy-source selection, and architecture.
Do not deploy anything.
```

To continue an interrupted delivery project or standalone WAF assessment in a fresh chat, select `01-Orchestrator` and send `resume <project>` (or run `/apex-workflow-start resume <project>`):

```text
resume patient-portal
```

`01-Orchestrator` reads `apex-recall show patient-portal --json` and `apex-recall handoff patient-portal --json` to continue from the recorded checkpoint without repeating settled questions.

<span id="step-1-requirements---scribe"></span>

## Step 1: requirements

Select `02-Requirements` (or let `01-Orchestrator` delegate):

```text
We are migrating a .NET ERP system from 12 VMware VMs and SQL Server 2019.
We expect 300 concurrent users and require 99.9% availability.
Capture our recovery, identity, data residency, budget, and operating requirements.
Ask for missing facts before choosing services. We use Terraform.
```

Step 1 writes `01-requirements.md` and `sku-manifest.{json,md}` (revision 1), then runs a synchronous `challenger-review-subagent` `comprehensive` review before human Gate 1 approval.

<span id="step-2-architecture--️-oracle"></span>

## Step 2: architecture

Select `03-Architect` once Step 1 is approved:

```text
Assess agent-output/patient-portal/01-requirements.md.
Ask me to choose between shared ALZ Corp policy assumptions and target-verified policy evidence if not yet recorded.
Compare service and SKU choices against our availability and budget targets using cost-estimate-subagent.
```

Step 2 requires both a `comprehensive` architecture review and a separate `cost-feasibility` review via `challenger-review-subagent`. Request `decisions.review_depth = "deep"` explicitly when multi-pass rotating reviews are needed.

<span id="step-3-design---artisan-optional"></span>

## Step 3: design, optional

Select `04-Design` when diagrams or Architecture Decision Records are needed before Governance:

```text
Diagram the approved patient-portal architecture.
Show resources, trust boundaries, client access, and private endpoints.
```

```text
Write an ADR for the approved hosting choice, including rejected alternatives and WAF trade-offs.
```

Whether you run Step 3 or skip it, advance next to Step 3.5 Governance.

## Step 3.5: governance

Select `04g-Governance`:

```text
Discover effective Azure Policy assignments for patient-portal at the authorized target scope.
Include management-group-inherited assignments, classify effects, and reconcile constraints with the approved architecture.
Do not modify policy assignments.
```

<span id="step-4-planning---strategist"></span>

## Step 4: planning

Select `05-IaC Planner` for either Bicep or Terraform:

```text
Plan the approved patient-portal architecture using the recorded Terraform track and current target-verified governance constraints.
Verify AVM module versions and policy-property coverage, and produce 04-implementation-plan.md plus the 04-* JSON contracts and diagrams.
```

Step 4 requires `current` target-verified policy evidence (`corp-policy-v1`) and a passing `comprehensive` `challenger-review-subagent` review before Gate 4 approval.

<span id="step-5-implementation--️-forge"></span>

## Step 5: implementation

Select `06b-Bicep CodeGen` or `06t-Terraform CodeGen`:

```text
Implement the approved patient-portal plan and 04-* contracts.
Generate the selected track's AVM-first modules and per-project deployment manifest.
Run preflight lint and security-baseline checks and write 05-iac-handoff.json. Do not deploy.
```

<span id="step-6-deployment---envoy"></span>

## Step 6: deployment

Select `07b-Bicep Deploy` or `07t-Terraform Deploy` and state whether you want validation-only, preview-only, or gated deployment:

```text
Validate patient-portal only against 05-iac-handoff.json and 04-environment-manifest.json.
Do not run cloud previews, bootstrap state, or deploy resources.
```

```text
Preview patient-portal against its approved dev environment.
Run policy-precheck-subagent and what-if/plan preview, then stop without applying changes.
```

```text
Prepare the next approved deployment phase for patient-portal.
Present current policy-precheck and preview results, including any destructive changes, and wait for my explicit apply approval.
```

<span id="step-7-documentation---chronicler"></span>

## Step 7: documentation

Select `08-As-Built`:

```text
Generate the 07-* as-built documentation suite for patient-portal from deployed state and deployment evidence.
Check bidirectional SKU drift against sku-manifest.json and report any failed or unperformed health checks.
```

## If a step fails

Return the exact error to the step that owns the artifact (CodeGen for compilation defects, `05-IaC Planner` for module or contract conflicts, `04g-Governance` for stale policy snapshots) and re-run affected validators and Challenger reviews after repair.

<span id="standalone-agents"></span>

## Standalone agents and skills

<span id="orchestrator---orchestrator"></span>

### Orchestrator and workflow skills

`01-Orchestrator` coordinates step workers through native tasks, pausing at human stage gates in delivery mode. Legacy Local `.prompt.md` slash adapters (`/apex-resume-workflow`, `/apex-git-commit`, and `.github/prompts/apex-debug-log-export.prompt.md`) are retired in favor of:

- `/waf-assess-existing` (`.github/prompts/waf-assess-existing.prompt.md`) in `01-Orchestrator` for standalone WAF assessments.
- `resume <project>` or `/apex-workflow-start` to start or recover a project.
- `/apex-github-operations` for `gh` CLI-first branches, Conventional Commits, and pull requests.
- `/apex-debug-log-export` for redacted `.apex-logs/` session bundles (see [debug log export](/guides/apex-debug-log-export/)).

### Standalone WAF assessment

Select `01-Orchestrator` and run `/waf-assess-existing` to assess an existing workload without running the delivery pipeline. When `Scenario` is `requirements_led`, `02-Requirements` guides you through business goals, availability, recovery, compliance, and budget targets interactively with an `Unknown` option on every field. Replace the `{{...}}` placeholders below, or see the [WAF assessment guide](/guides/waf-assessment/) for the variable table and ready-to-copy variants.

```text
/waf-assess-existing
Project: {{PROJECT_NAME}}
Scenario: {{SCENARIO}}
Source: {{SOURCE}}
Visual charts: true
Action register: true

Azure read scope:
- Tenant ID: {{TENANT_ID}}
- Subscriptions: {{SUBSCRIPTION_IDS}}
- Resource groups: {{RESOURCE_GROUPS}}
- Allowed read categories: configuration, topology, utilization, operations, recovery, billing, policy
- Guardrails: Read-only access only. Do not read secrets, keys, connection strings, or certificates, and do not modify Azure resources.
```

<span id="diagnose---sentinel"></span>

### Diagnose

Select `09-Diagnose`:

```text
Investigate HTTP 503 from app-payment-api-prod in rg-payment-gateway-prod.
Start with read-only AppLens and KQL checks, separating observations from hypotheses.
Do not restart services or modify configuration without explicit approval.
```

<span id="challenger--️-adversary"></span>

### Challenger

Select `10-Challenger` when you want an optional manual review session. It dispatches the same read-only `challenger-review-subagent` leaf (`APEX_REVIEW` / `APEX_REVIEW_FILE`) and `record-review.mjs` recorder used by automatic workflow gates:

```text
Review agent-output/patient-portal/04-implementation-plan.md and its 04-* contracts.
Identify findings with concrete evidence and do not edit reviewed artifacts or approve deployment.
```

## Next steps

- [WAF assessment guide](/guides/waf-assessment/)
- [Prompting practices](/reference/prompts/best-practices/)
- [Skills and subagents](/reference/prompts/skills-subagents/)
- [Troubleshooting](/guides/troubleshooting/)
