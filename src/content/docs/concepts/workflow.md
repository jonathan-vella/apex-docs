---
title: "Run the workflow"
description: "Follow APEX from requirements to as-built evidence, with named agents, review defaults, and human approvals."
---

<span id="agent-and-skill-workflow"></span>

## Overview

APEX helps you turn requirements into an Azure infrastructure plan, Bicep or
Terraform code, and deployment evidence. You select the main agents and approve
their handoffs. The Orchestrator identifies the next step; it does not execute
the main-agent sequence on your behalf.

Start with the [quickstart](/getting-started/quickstart/) if you have not created
a repository from the Accelerator template.

### Formalized workflow engine

The [workflow graph](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/.github/skills/apex-workflow-engine/templates/workflow-graph.json)
defines step dependencies, expected artifacts, and review defaults.
`apex-recall` records project state. Neither a graph edge nor a completed-state
field grants permission to deploy.

## Agent architecture

### Requirements capture and revision

Select `02-Requirements` to establish workload goals, constraints, budget, region,
and IaC choice. Resolve gaps before treating the requirements as approved.
Later changes must return to the affected step rather than leave downstream
artifacts describing different requirements.

### Review finalization and recovery

Use the named `10-Challenger` handoff when a review is required. The main reviewer
is not a helper subagent. Read findings, resolve the required changes, and record
the actual outcome. Review filenames and old approval text do not prove that
the current inputs were reviewed.

If state or index updates fail, follow
[session recovery](/guides/session-debugging/) instead of resetting JSON fields.

### Governance closure

`04g-Governance` discovers effective policy constraints, including inherited
assignments. Reconcile discovered constraints before planning. An empty policy
array can skip the reconciliation review; missing access or a failed query does
not establish that there are no constraints.

### Planning feasibility

`05-IaC Planner` connects the approved architecture, SKU evidence, and governance
constraints to the code-generation contract. Resolve infeasible choices before
CodeGen rather than expecting the deployment agent to substitute a service or SKU.

### The orchestrator pattern

Select `01-Orchestrator` when you need help locating the next step. It explains
the required evidence and offers a handoff. You choose the target agent and
approve the scope.

<span id="agent-delegation-graph"></span>

The current relationship is a human-selected handoff between main agents.
Allowed helper subagents remain separate and cannot replace main-agent selection.
The older delegation illustration is not the current execution contract.

## Agent roster

### Primary orchestrator

`01-Orchestrator` routes the conversation to the appropriate main agent.

### Core agents (by workflow step)

| Step | Owner | Main result |
|---|---|---|
| [1: Requirements](/concepts/workflow/step-1/) | `02-Requirements` | Requirements and initial SKU manifest |
| [2: Architecture](/concepts/workflow/step-2/) | `03-Architect` | Architecture assessment and cost evidence |
| [3: Design, optional](/concepts/workflow/step-3/) | `04-Design` | Diagrams and decision records |
| [3.5: Governance](/concepts/workflow/step-3-5/) | `04g-Governance` | Effective policy constraints |
| [4: IaC plan](/concepts/workflow/step-4/) | `05-IaC Planner` | Implementation plan and machine-readable contracts |
| [5: IaC code](/concepts/workflow/step-5/) | `06b-Bicep CodeGen` or `06t-Terraform CodeGen` | Code and `05-iac-handoff.json` |
| [6: Deploy](/concepts/workflow/step-6/) | `07b-Bicep Deploy` or `07t-Terraform Deploy` | Deployment and policy-precheck evidence |
| [7: As-built](/concepts/workflow/step-7/) | `08-As-Built` | Operational documentation based on observed results |

### Validation subagents

An owning agent can use the helper tools and subagents permitted by its definition.
Inspect the [Architecture Explorer](/reference/architecture-explorer/) for the
pinned declarations. A main agent, including Challenger, must not be treated as
one of those helpers.

### Standalone agents

Use diagnostic and context-review agents for their declared tasks. They do not
replace the workflow's approvals or authorize mutations outside the selected task.

## Approval gates

Before approving a transition, check the proposed artifact, unresolved findings,
and what the next agent will do. Stop if requirements, costs, policy evidence,
or resource scope are unclear.

Deployment requires explicit authorization for the proposed changes. A request
to validate code is not permission to provision infrastructure.

## Workflow steps

<span id="step-1-requirements--scribe"></span>

### Step 1: requirements

Capture the workload and constraints in `01-requirements.md`. Review the requirements
before architecture. The step also starts the SKU manifest.

<span id="step-2-architecture-️-oracle"></span>

### Step 2: architecture

Assess the design and cost feasibility. Review architecture and the cost estimate
independently. The cost artifact is `03-des-cost-estimate.md`, despite this being
Step 2.

<span id="step-3-design-artifacts--artisan--optional"></span>

### Step 3: design

Create optional diagrams and decision records when they help explain the design.
Skipping this step does not skip governance.

<span id="step-35-governance-️-warden"></span>

### Step 3.5: governance

Discover and reconcile the policy constraints that apply to the target scope.
Preserve both the human-readable and machine-readable constraint artifacts.

<span id="step-4-planning--strategist"></span>

### Step 4: planning

Approve the implementation plan, resource choices, policy mapping, and deployment
environment contract. CodeGen should not have to invent missing decisions.

<span id="step-5-implementation-️-forge"></span>

### Step 5: code generation

Select the CodeGen agent for the chosen IaC track. Review the generated code,
deterministic validation results, and handoff artifact before deployment.

<span id="step-6-deployment--envoy"></span>

### Step 6: deployment

Confirm scope, authorization, and current validation evidence. Check resource
provisioning and application health separately. Report failures rather than
substituting resources without approval.

<span id="step-7-documentation--chronicler"></span>

### Step 7: as-built documentation

Describe what exists, how it was verified, and what remains unresolved. A successful
resource deployment does not establish a working application or compliance.

## Complexity classification

Complexity can inform a review plan. It does not silently enable deep review or
change the default review policy.

### Adversarial review matrix

| Step | Default Challenger review |
|---|---|
| Requirements | One comprehensive review |
| Architecture | One comprehensive architecture review plus a separate cost-feasibility review |
| Design | Optional |
| Governance | One reconciliation review when constraints exist |
| Plan | One comprehensive review |
| CodeGen | None by default; explicit opt-in |
| Deploy | None |

Deep architecture or plan review requires explicit opt-in. The independent
architecture cost-estimate review remains required. Deterministic validators
still apply when no adversarial review runs.

## Agents vs skills

An agent owns a selected task. A skill supplies task-specific instructions.
A helper subagent performs permitted delegated work. A handoff asks the human
to move to another main agent. Use those terms consistently.

## Quick reference

### Using the orchestrator (recommended)

Select `01-Orchestrator`, identify your project and current goal, and inspect the
proposed next step.

### Direct agent invocation

Select the named custom agent in Copilot Chat when you know which step owns the task.
Provide the project and current evidence rather than asking it to skip dependencies.

### Skill invocation

Use a user-invocable skill for its declared purpose. A skill request does not bypass
the owning step's contract or approval requirements.

## Artifact naming convention

Most workflow records live in `agent-output/{project}/`. IaC lives under
`infra/bicep/{project}/` or `infra/terraform/{project}/`. Artifact prefixes are
historical conventions and do not always match the producing step number.
Use each [step guide](#core-agents-by-workflow-step) for exact outputs.

## Next steps

Read the [technical deep dive](/concepts/workflow-deep-dive/) for context and state
details. The [April 2026 case study](/demo/) shows historical artifacts, not a
validated current tutorial.
