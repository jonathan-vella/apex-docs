---
title: "Workflow deep dive"
description: "Trace APEX context, state, artifact contracts, landing-zone dependencies, and recovery across a project."
---

Read this page when you need to understand why a step needs particular evidence
or where a failed assumption should return. Use the [workflow overview](/concepts/workflow/)
for the normal sequence and the linked step pages for exact outputs.

## Mental model

A human selects a main agent. That agent reads current project evidence, performs
its task, and produces artifacts. Required reviews and approvals determine whether
the next step can proceed. Helpers can perform permitted bounded tasks, but the
main-agent sequence is not an autonomous subagent chain.

| Record | Purpose | What it does not prove |
|---|---|---|
| `agent-output/{project}/` | Requirements, decisions, reviews, contracts, and observed results | A file's presence does not establish freshness or approval. |
| Primary session state through `apex-recall` | Current decisions, findings, and step progress | State does not authorize deployment or replace reviewed artifacts. |
| Workflow graph | Dependencies, expected outputs, and review defaults | An edge does not execute an agent or grant permission. |

## The five context surfaces

### Skills

An agent reads the skill required for its task, then relevant references or
templates. Discovery metadata helps identify a skill; it does not prove that its
instructions loaded. Load required guidance explicitly when needed.

### Instructions

An instruction's `applyTo` pattern describes intended file matching. Essential
approval and stop rules still belong in the main agent's instructions. Verify
runtime attachment separately from authoring-file syntax.

### `.GitHub/data/` registries

Module catalogs, lifecycle information, deprecation data, and governance evidence
help the planner avoid unsupported choices. Check their scope and freshness.
A test fixture or fallback dataset is not evidence of the target subscription's
current effective policy.

### `APEX-Recall`

Use `apex-recall show <project> --json` for current state. Use supported commands
for updates, and keep recorded decisions tied to actual owner choices.

`show` does not restore backups. A write can commit while leaving its derived
index stale. Conflicts, recovery, and idempotent retries have distinct outcomes.
See [session state debugging](/guides/session-debugging/) and the
[public schema](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/tools/apex-recall/docs/show-schema.md).

### Hooks and validators

Git hooks and CI run configured checks. Agent hooks run at their declared lifecycle
events. Each mechanism covers specific rules, not all correctness or safety.
A Challenger review evaluates the requested artifact scope and remains a separate
human-selected step.

## Stage-by-stage walkthrough

<span id="step-0--project-init-orchestrator-boot"></span>

### Step 0: project initialization

Identify the project and read existing state before initializing anything. Capture
the IaC choice through Requirements and retain explicit review-depth decisions.
Normal review is the default. Complexity does not silently enable deep review.

<span id="step-1--requirements"></span>

### Step 1: requirements

`02-Requirements` records the workload, constraints, and initial SKU manifest.
Review the requirements with `10-Challenger`, resolve required findings, and obtain
approval before architecture. Return here when an upstream requirement changes.

<span id="step-2--architecture"></span>

### Step 2: architecture

`03-Architect` evaluates service choices and costs. The architecture assessment
and cost estimate receive independent reviews. Deep architecture review is opt-in
and does not replace the cost-estimate review. Preserve pricing assumptions and
their source rather than substituting remembered prices.

<span id="step-3--design-optional"></span>

### Step 3: design, optional

`04-Design` creates diagrams and decision records when they help explain the
architecture. Design review is optional. The next required concern is governance,
whether or not this step runs.

<span id="step-35--governance"></span>

### Step 3.5: governance

`04g-Governance` discovers effective policy, including inherited assignments, and
produces both Markdown and JSON constraints. Reconcile conflicts before planning.
If resolution changes the architecture, return to Architect and renew the affected
approval. An inaccessible scope is not an empty policy result.

<span id="step-4--iac-plan"></span>

### Step 4: IaC plan

The shared `05-IaC Planner` selects modules and versions, maps policy requirements,
and produces the IaC contract, policy-property map, and environment manifest.
Review the plan before CodeGen. An architectural gap belongs with Architect, not
in an undocumented code-generation workaround.

<span id="step-5--code-generation"></span>

### Step 5: code generation

Select `06b-Bicep CodeGen` or `06t-Terraform CodeGen`. Generate code from the approved
plan and produce `05-iac-handoff.json`. Run the required deterministic checks.
Adversarial code review is opt-in. Return planning defects to the planner instead
of changing approved inputs during generation.

<span id="step-6--deploy"></span>

### Step 6: deploy

Select the matching deployment agent. Check current code, handoff, environment,
policy evidence, and preview before obtaining apply authorization. Reused
validation must cover the current inputs.

Quota, SKU, or regional constraints can require a new design decision. Stop and
escalate rather than substitute a resource automatically. Record provisioning
results and application-health results separately.

<span id="step-7--as-built"></span>

### Step 7: as-built

`08-As-Built` documents the observed resource inventory, operations, costs,
compliance evidence, and recovery procedures. Include missing checks and unresolved
issues. Do not infer a healthy application from a completed provisioning operation.

<span id="post--lessons"></span>

### Post: lessons

Record recurring failures and their evidence during the run. Use the resulting
lessons to propose reviewed changes to agents, skills, or validators. A lesson
record does not authorize those changes automatically.

## End-to-end run timeline

The current sequence is Requirements, Architecture, optional Design, Governance,
Plan, CodeGen, Deploy, and As-built. The owner selects each main-agent handoff.
The [step table](/concepts/workflow/#core-agents-by-workflow-step) names the agents,
and the [review matrix](/concepts/workflow/#adversarial-review-matrix) defines the
default reviews.

<details>
<summary>Historical workflow illustration</summary>

This imported illustration predates the current human-selected main-agent contract.
It remains available for old links and historical comparison, not as execution guidance.

![Historical workflow illustration with agent, helper, artifact, and context lanes](../../../assets/diagrams/workflow-deep-dive/e2e-orchestration.png)

The current sequence and ownership are described in the text above. Do not use the
old delegation lanes to infer runtime behavior.

</details>

## The lessons-learned feedback loop

Capture an observation, its cause, the evidence, and a proposed correction in
`09-lessons-learned.json`. The related Markdown record explains the lessons to
readers. Review proposed improvements before changing the product.

The product's `report:challenger-gaps` command can identify recurring lessons for
review. Its output is a proposal, not a new mandatory workflow rule.

### Illustrative lesson entry

A useful lesson says which step failed, what input exposed the problem, and what
should change. For example, a selected module version may lack a property required
by discovered policy. The correction belongs in module selection and policy
mapping, not in a deployment-time exception.

Use the [lesson schema](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/tools/schemas/lesson-log.schema.json)
for an actual record. An illustration is not evidence that a run occurred.

<details>
<summary>Historical lessons illustration</summary>

![Historical illustration of lesson capture and later reuse](../../../assets/diagrams/workflow-deep-dive/lessons-loop.png)

Reuse requires relevant evidence and reviewed changes. The illustration does not
imply automatic modification of agents or approval rules.

</details>

## APEX and Azure landing zones

An [Azure Landing Zone](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/)
can supply management groups, policy, identity, networking, and shared services.
Discover what the target environment actually provides. APEX workload planning is
not a substitute for establishing the platform's ownership and controls.

### What greenfield means in APEX

A new workload can target an established landing zone. A new subscription can
still require platform setup. Distinguish the application's starting point from
the state of its Azure environment.

### What ALZ provides

Identify inherited policy, role assignments, network connectivity, DNS ownership,
and monitoring destinations. Verify resource IDs and permissions before referencing
central services. Do not assume every landing zone has the same deployment.

<span id="alz-layer--apex-step-consumer"></span>

#### ALZ layer and APEX step consumer

| Platform concern | Workload step |
|---|---|
| Effective policy and inheritance | Governance discovers constraints; Plan maps them to implementation. |
| Existing network and DNS ownership | Architecture selects connectivity; Plan records references and responsibilities. |
| Identity and role scope | Plan and CodeGen implement the approved access model. |
| Diagnostics and monitoring destination | Plan identifies ownership; CodeGen wires the approved resources; As-built records results. |

### How ALZ guardrails accelerate and de-risk APEX

Known policy and resource ownership reduce the choices a workload team must make.
They do not remove discovery, review, or connectivity checks. If a platform rule
conflicts with the design, resolve the conflict with its owner before generation
or deployment.

### When there is no landing zone

Record the absence of inherited controls and apply the current product defaults
where permitted. Do not copy the historical four-tag fallback from an old example.
The product's
[repository instructions](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/.github/copilot-instructions.md)
define the fallback. Failed discovery must not be treated as proof that policy is absent.

## Network planning

### Bring your own VNet vs. create new

Establish whether the workload references an existing network or owns a new one.
For an existing VNet, verify its resource ID, address space, required subnets, and
permissions. Referencing a VNet does not authorize modifying platform-owned resources.

For a new VNet, the plan must account for address ranges, subnet requirements,
routing, and the approved connectivity model. Use the current
[VNet planning reference](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/.github/skills/apex-azure-defaults/references/vnet-planning.md).

### Hub-spoke and virtual wan topologies

Identify who owns the hub, peering or Virtual WAN connection, routing, and firewall
policy. Do not infer connectivity from the presence of a spoke VNet alone.
Check the workload's intended traffic paths and return routes.

<span id="private-dns-zones--enumeration-and-reuse"></span>

### Private DNS zones, enumeration and reuse

Verify the relevant zone IDs, links, permissions, and resolution from intended
clients. Reuse central DNS only when its ownership and behavior are established.
A zone-group policy does not prove that the DNS zone or VNet link exists.

Do not create duplicate policy-owned DNS resources. If a required component is
missing and policy prevents workload-side creation, escalate to the platform owner.
The older proposed `private-dns-zone-baseline.json` inventory is not a shipped
contract and must not be assumed to exist.

### Recommended corp enforcement pattern

Evaluate Deny and DeployIfNotExists assignments for their actual scope, parameters,
managed identity permissions, deployment behavior, and remediation. A policy
assignment alone is not proof that a private endpoint resolves or a network
connection has been created.

Read the [security baseline](/reference/security-baseline/) for private-networking
requirements and the conditional monitoring exception.

<span id="appendix-a--artifact-contract-reference"></span>

## Appendix a: artifact contract reference

Use the [canonical workflow graph](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/.github/skills/apex-workflow-engine/templates/workflow-graph.json)
and the [step guides](/concepts/workflow/#core-agents-by-workflow-step).
Prefixes do not always match step numbers. Architecture produces
`03-des-cost-estimate.md`; Plan produces the `04-` contracts; CodeGen produces
`05-iac-handoff.json`.

<span id="appendix-b--skill--step-matrix"></span>

## Appendix b: skills by step

Consult the selected agent's body and the pinned
[Explorer](/reference/architecture-explorer/) for skill references.
Do not interpret a source reference as proof that a skill loaded at runtime.

<span id="appendix-c--instruction--trigger-matrix"></span>

## Appendix c: instruction scope

The [skills and instructions guide](/concepts/how-it-works/skills-and-instructions/)
explains declared scope and attachment limits. Check the actual instruction file
for its glob and requirements.

<span id="appendix-d--glossary"></span>

## Appendix d: glossary

Use the [glossary](/reference/glossary/) for shared terms.

<span id="appendix-e--further-reading"></span>

## Appendix e: further reading

- [Workflow engine and validation](/concepts/how-it-works/workflow-engine/)
- [Session state debugging](/guides/session-debugging/)
- [Security baseline](/reference/security-baseline/)
- [April 2026 case study](/demo/)
