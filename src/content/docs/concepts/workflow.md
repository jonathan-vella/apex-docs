---
title: "Run the workflow"
description: "Follow the existing APEX workflow and distinguish its gates from the proposed VS Code and Autopilot redesign."
---

<span id="agent-and-skill-workflow"></span>

## Overview

APEX helps you turn requirements into an Azure infrastructure plan, Bicep or
Terraform code, and deployment evidence. The step walkthrough below explains the
retained domain workflow. The current body migration keeps named main and leaf
agents. The broader role-consolidation proposal is separate.

:::caution[Authorized execution is not runtime acceptance]
The owner has authorized approved migration execution and evidence-based packet
progression in [APEX PR #779](https://github.com/jonathan-vella/apex/pull/779).
This supersedes the earlier `PLAN_THEN_APPROVE` hold, but does not accept the
proposed lead, skills, source implementation, or runtime pilot. Real-Azure
deployment and E2E are authorized in principle only. The exact tenant,
subscription, resource boundary, budget, and action scope are not established;
cloud execution remains blocked until they are. Cleanup is not authorized.
Prior READY, synthetic shutdown, and leading-prompt approval evidence remains
withdrawn. No runtime pilot or deployment acceptance is established.
The earlier [`a315279`](https://github.com/jonathan-vella/apex/tree/a315279aa5d09bfc7657c14536c1776cadcd6069)
candidate is historical, not the approved target. The Explorer keeps its separate
generated source pin.
:::

The owner-reported October 18 body migration is in progress, not a final
source or runtime certification. Main agents retain direct selection and native
questions. Active definitions omit UI `handoffs:` metadata and no longer require
worker-ready handshakes, nonce exchanges, verifier commands, or log preflight.
See the [current body contract](/concepts/how-it-works/agents/#current-agent-body-migration)
for native task handling, observed limitations, and preserved review requirements.

Start with the [quickstart](/getting-started/quickstart/) if you have not created
a repository from the Accelerator template.

### Proposed routine engineering and owner boundary

The target runtime is the Copilot session target, Copilot SDK/Agent Host, inside
VS Code only. Local, CLI, cloud-agent, and other IDE product runtimes are out of
scope. Running a CLI tool inside an authorized VS Code task does not change that.

The proposal uses an optional short APEX engineering lead or native Agent for
routine repository work, on-demand domain skills, a native bounded independent
reviewer, and one separately permissioned deploy operator with Bicep and
Terraform adapters. See the
[planning section](/concepts/how-it-works/agents/#proposed-simplification-and-planning-gate)
for the PRD, backlog, roadmap, retained contracts, and issue mapping.

For example, the owner can scope a routine documentation fix to an approved
feature branch during the authorized migration. Native Autopilot would edit,
test, repair within bounds, commit, push,
update the PR or issue, and address scoped reviewer feedback without repeatedly
asking for permission. It may answer blocking questions within that scope.
This describes the intended behavior, not an accepted runtime result. Packet
progression requires evidence for each packet; permission to proceed cannot
stand in for pilot or final release acceptance.

A successful `ask_user` call or form response is not proof of a human decision;
Autopilot may have supplied it. `APEX_UNATTENDED=1` neither proves native Autopilot
selection nor grants approval. Consequential permission, expense, security,
and requirements changes and deployment approval require a genuine independent
owner boundary. Native agent roles and tool allowlists alone are not credential
or security isolation.

The owner also retired APEX `.github/hooks/` runtime hooks. Do not restore or
replace them as part of setup. Their tool-call protection is gone, not silently
replaced by native tool restrictions. Native permission boundaries still need
verification. Azure security, governance, SKU, AVM, and cost-provenance requirements
remain in force. This retirement does not remove Git Lefthook, pre-commit checks,
secret scanning, CI, or azd lifecycle hooks. See the
[runtime-hook retirement record](/guides/hooks/).

### Formalized workflow engine

The earlier candidate's [workflow graph](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/skills/apex-workflow-engine/templates/workflow-graph.json)
records step dependencies, expected artifacts, and review defaults for that design.
`apex-recall` records project state. Neither a graph edge nor a completed-state
field grants permission to deploy. The proposal retains durable decisions,
atomic writes, and historical compatibility. Native session SQL and todos do not
replace cross-project approval storage.

## Agent architecture

### Requirements capture and revision

Select `02-Requirements` to establish workload goals, constraints, budget, region,
and IaC choice. It asks missing material questions directly through its native
question tool; you do not need to route those questions through Orchestrator.
Capture known constraints and distinguish workload intent from implementation
details. The [guided discovery candidate](/concepts/workflow/step-1/#guided-discovery-candidate)
adds menus, Greenfield branching, and answer preservation. Exact runtime choices,
IDs, and tag bindings can remain explicit unknowns for the downstream step that
owns them when intent is clear. That step must resolve them before its consuming
gate. Deferral is not approval or permission to guess.
Later changes must return to the affected step rather than leave downstream
artifacts describing different requirements.

### Review finalization and recovery

Independent production workflow reviews retain built-in `rubber-duck` through
the one-shot review contract (`APEX_REVIEW`). The review owner records attributed
findings through `record-review.mjs` (`challenge-findings-*.json`).

The October 18 source candidate explicitly permits Orchestrator to invoke
`rubber-duck` as a sibling reviewer. If a delegated worker lacks nested task
capability, it returns `REVIEW_REQUIRED`. The same Orchestrator automatically
dispatches that independent review, captures current review metadata, and records
the actual parent-invoked result under the existing integrity checks and review
budgets. It does not ask the owner to select `10-Challenger` as a routine detour.
The October 18 owner-supplied `cp-harness-01` retry reached this sibling reviewer
dispatch. Recording then failed because the reviewer ran a shell command that
the execution safety check blocked. No review sidecar or approval resulted.
This confirms dispatch for that retry, not a completed review.

On October 19, model-backed tests in Copilot CLI 1.0.98 confirmed custom-agent
selection, delegated answer continuation, and an actual parent/sibling review
dispatch on a disposable fixture. That reviewer returned prose and reported a
configured output-format conflict. The unchanged recorder rejected it, and no
valid review receipt resulted. This is a CLI observation, not evidence of the
same behaviour in the supported VS Code client.

Do not convert prose into a findings file, override the reviewer's role, change
reviewers, or reset attempts to make this result pass. Test the remaining
compatibility question in the supported VS Code runtime before changing the
production review architecture.

The follow-up source repair removes shell-based draft finalization. The reviewer
reads inputs and returns its independent findings as JSON. The existing recorder
derives finding IDs and severity counts, then checks the schema, attribution,
original metadata, and current input bytes. The reviewer still owns the findings
and verdict. Failed commands remain blocking, even if the reviewer later returns
valid JSON. Do not rehash or salvage the failed attempt, reset its budget, or
treat the repair as permission to launch another project review.

Requirements review also follows the current workflow stage. It checks business
intent, measurable outcomes, contradictions, and security constraints. Documented
later-stage design tasks are not defects solely because they remain open.
Recommendations must not invent user targets or weaken the security baseline.

Only genuinely missing parent reviewer capability or failed or invalid execution
evidence requires a stop and human recovery. `10-Challenger` remains available
for that recovery or optional manual review. Read findings, resolve the required
changes, and obtain the separate owner approval. Review filenames and old
approval text do not prove that the current inputs were reviewed. Neither stage
completion nor this dispatch correction completes a mandatory review.

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

Select `01-Orchestrator` to coordinate approved steps, or select a main step
agent directly. Architect, Design, and Governance can ask their own missing
material questions. A delegated main worker instead returns `USER_INPUT_REQUIRED`
with `request_id`, `phase`, `message`, `requestedSchema.properties`, and its
missing inputs to the interactive parent. Workers do not call user tools.

For Requirements, the parent sends the complete captured-answer ledger with
every new task or supported continuation, not just the latest response. Preserve
known answers and explicit unknowns across calls. The parent owns question
presentation and review dispatch when the delegated worker cannot invoke the
required reviewer.

The historical
[worker-readiness contract](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/skills/apex-workflow-engine/references/worker-readiness.md)
contains conflicting direct-dispatch and pre-dispatch handshake requirements.
It is not the current migrated body contract. Active bodies and shared caller
guidance no longer require those rituals. Old verifiers remain diagnostic and
historical. Native tasks use the available result contract; same-task continuation
is possible only when the actual returned handle supports it. One-shot calls
do not imply a universal continuation API.

Interactive gates present `00-handoff.md` and require human approval
before advancing. Required approvals cover the actual action and current scope;
unresolved authority stops the run. Preserve `apex-recall` checkpoints and fresh
review evidence. The proposed routine Autopilot scope above does not make
ordinary question responses independent owner approval.
No UI handoff control is required or promised. Use the native task result or
explicitly select the named next agent. The handoff file remains durable evidence,
not frontmatter or approval.

<span id="agent-delegation-graph"></span>

The migrated body contract lets `01-Orchestrator` dispatch approved main step workers; step workers invoke
only their declared leaf subagents (`rubber-duck`, `cost-estimate-subagent`, and
validate/preview subagents). Direct user selection of individual step agents
remains supported; note that sending an idle cross-chat message may clear
selected-agent metadata, so resume directly in the selected Orchestrator chat.

## Agent roster

### Primary orchestrator

The roster below describes retained step ownership. `01-Orchestrator` coordinates
approved step dispatch. Direct main-agent selection remains supported.
This body migration does not retire the roster or certify every dispatch path.

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
to validate code is not permission to provision infrastructure. Routing diagnostics,
an earlier candidate's `EXECUTE_VERIFIED` result, model metadata, or an export archive do not establish
approval. Live cleanup needs its own authorized scope and observed results.

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

This matrix describes the existing review requirements, not an approved
simplified target.

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
still apply when no adversarial review runs. The proposal has one independent
technical review path. Only an owner decision can change the currently mandatory
separate architecture cost-feasibility review. No plan update repairs review
counters, hashes, history, or unresolved findings.

## Agents vs skills

An agent owns a selected task. A skill supplies task-specific instructions.
A helper subagent performs permitted delegated work. A handoff asks the human
to approve the next scope; the proposed Orchestrator then dispatches its worker.
Direct agent selection remains an alternative, not a mandatory handoff step.

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
