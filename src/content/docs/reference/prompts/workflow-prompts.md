---
title: "Workflow prompts"
description: "Prompts for human-selected APEX steps, explicit review, and scoped recovery."
---

Select the named main agent before sending a prompt. The examples do not invoke
another agent, approve an artifact, or authorize Azure changes by themselves.
Use the [workflow guide](/concepts/workflow/) for the current gates.

## End-to-end (orchestrator)

Select `01-Orchestrator` to identify the project and next handoff:

```text
Start an APEX project for a patient portal.
We have 500 staff, 50,000 patients, and 10,000 daily active users.
Gather the missing requirements and identify the next main-agent handoff.
Do not deploy anything.
```

For an existing project:

```text
Resume patient-portal. Inspect current recall state and artifacts.
Report missing evidence and recommend the next handoff.
Do not restore state, change decisions, or skip approvals.
```

<span id="step-1-requirements---scribe"></span>

## Step 1: requirements

Select `02-Requirements`. State constraints without inventing technical answers:

```text
We are migrating a .NET ERP system from 12 VMware VMs and SQL Server 2019.
We expect 300 concurrent users and require 99.9% availability.
Capture our recovery, identity, data residency, budget, and operating requirements.
Ask for missing facts before choosing services. We use Terraform.
```

The step produces requirements and an initial SKU manifest. Select Challenger for
the required review, then resolve findings and approve the requirements.

<span id="step-2-architecture--️-oracle"></span>

## Step 2: architecture

Select `03-Architect` with approved requirements:

```text
Assess agent-output/patient-portal/01-requirements.md.
Compare service choices against the approved availability and budget requirements.
Use current pricing evidence. Identify unsupported assumptions and blockers.
```

Architecture assessment and cost estimate have independent required reviews.
Request deep review explicitly when wanted; it is not the default.

<span id="step-3-design---artisan-optional"></span>

## Step 3: design, optional

Select `04-Design` for a diagram or decision record:

```text
Diagram the approved patient-portal architecture.
Show resources, trust boundaries, client access, and data flows.
Mark anything not established by the assessment as unresolved.
```

```text
Write an ADR for the approved hosting choice.
Include alternatives, constraints, and the reasons recorded in the assessment.
```

Whether you run Design or skip it, continue to Governance, not directly to Plan.

## Step 3.5: governance

Select `04g-Governance`:

```text
Discover effective policy for patient-portal at the confirmed target scope.
Include inherited assignments and report inaccessible scopes.
Reconcile constraints with the approved architecture before planning.
Do not change policy assignments.
```

<span id="step-4-planning---strategist"></span>

## Step 4: planning

Select `05-IaC Planner` for either track:

```text
Plan the approved patient-portal architecture using the recorded Terraform track.
Use current governance constraints, verify module versions and property coverage,
and produce the required implementation contract and environment manifest.
Escalate unresolved design conflicts instead of filling them with assumptions.
```

The planner consumes governance evidence. Fresh policy discovery belongs to
Governance. Complete the required plan review before CodeGen.

<span id="step-5-implementation--️-forge"></span>

## Step 5: implementation

Select `06b-Bicep CodeGen` or `06t-Terraform CodeGen`:

```text
Implement the approved patient-portal plan and contracts.
Generate the selected track's code and required deployment manifest.
Run the required checks and emit the current JSON handoff.
Return plan defects to the planner. Do not deploy.
```

Deterministic validation remains required. Challenger review at this step is opt-in.

<span id="step-6-deployment---envoy"></span>

## Step 6: deployment

Select `07b-Bicep Deploy` or `07t-Terraform Deploy` and distinguish request scope:

```text
Validate patient-portal only. Report passed, failed, and unperformed checks.
Do not preview, bootstrap resources, regenerate code, or apply changes.
```

```text
Preview patient-portal against its approved environment.
Preserve the raw preview and policy evidence.
Stop after reporting the preview. Do not request or perform apply.
```

```text
Prepare the next approved deployment phase for patient-portal.
Present current policy and preview results, including destructive changes.
Wait for explicit approval before applying that phase.
```

A missing prerequisite does not expand a validation-only or preview-only request.
Record provisioning and application-health outcomes separately.

<span id="step-7-documentation---chronicler"></span>

## Step 7: documentation

Select `08-As-Built`:

```text
Document the observed patient-portal deployment.
Use the deployment evidence and verified inventory.
Include failed checks, unresolved issues, and unverified operational procedures.
Do not describe planned resources as deployed.
```

This step produces the required `07-*` workload records. It does not publish or
rewrite this documentation site.

## If a step fails

Return the exact error and evidence to the owning step. Code defects return to
CodeGen; contract mismatches return to Plan; stale policy discovery returns to
Governance. Re-run affected reviews after repairs.

An empty result is usable only when discovery actually completed for the required
scope. Authentication failure is not evidence that no policy applies.

## Standalone agents

<span id="orchestrator---orchestrator"></span>

### Orchestrator

Use `01-Orchestrator` to inspect evidence and recommend a main-agent handoff.
It does not execute the entire main-agent sequence automatically.

<span id="diagnose---sentinel"></span>

### Diagnose

Select `09-Diagnose`:

```text
Investigate HTTP 503 from app-payment-api-prod in rg-payment-gateway-prod.
Start with read-only checks. Separate observations from hypotheses.
Do not restart services or change configuration without approval.
```

<span id="challenger--️-adversary"></span>

### Challenger

Select `10-Challenger`:

```text
Review the patient-portal implementation plan and its contracts.
Use the required review scope and identify findings with evidence.
Do not edit the reviewed artifacts or approve deployment.
```

## Next steps

- [Prompting practices](/reference/prompts/best-practices/)
- [Skills and helpers](/reference/prompts/skills-subagents/)
- [Troubleshooting](/guides/troubleshooting/)
