---
title: "Agent architecture"
description: "Choose main agents, understand helper boundaries, and author changes without bypassing approvals."
---

:::caution[Proposed migration, not a released runtime contract]
This page describes the candidate in [APEX PR #779](https://github.com/jonathan-vella/apex/pull/779),
reviewed at [`a315279`](https://github.com/jonathan-vella/apex/tree/a315279aa5d09bfc7657c14536c1776cadcd6069).
APEX main reverted the earlier cutover. The candidate's source declarations do not
prove native smoke acceptance, live pricing, critical human-gate behavior, or live
cleanup. Those remain unverified in this documentation review.
:::

## Agent anatomy

An `.agent.md` file has metadata and an instruction body. Metadata declares the
name, description, tools, invocation rules, and handoff targets. The body
defines the task, expected evidence, constraints, and stop conditions.

Read the proposed
[agent definitions](https://github.com/jonathan-vella/apex/tree/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/agents)
instead of copying a model name or body-size limit from an old example.

### Tools

An agent's declared tools can include file operations, terminal commands, MCP
queries, and permitted helper delegation. Registration or authentication does not
authorize every possible operation. The task and its approval boundaries still apply.

### Handoffs

Main agents produce artifacts under `agent-output/{project}/`. A handoff identifies
the next main agent and its inputs. In the proposed migration, you select
`01-Orchestrator` and approve the scope; it dispatches allowlisted step workers
rather than requiring manual agent selection at every handoff. Direct selection
of an individual step agent remains supported. Neither route removes human gates.

<span id="local-and-agent-host-boundaries"></span>

### Copilot SDK harness and entry skills

The candidate targets the GitHub Copilot SDK harness inside VS Code. Legacy Local
`.prompt.md` files are archived under `.archive/pre-cpharness/`; canonical manual
entry skills live under `.github/skills/` (`/apex-workflow-start`,
`/apex-git-commit`, and `/apex-debug-log-export`).

`01-Orchestrator` remains human-selected (`disable-model-invocation: true`) and
the candidate declares delegation to allowlisted step agents in worker contexts.
Active agent definitions omit model and reasoning-effort pins so the operator
and runtime control selection, including Auto and HydraFusion. Model metadata is
diagnostic, not evidence of worker readiness or approval.

The proposed [worker-readiness contract](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/skills/apex-workflow-engine/references/worker-readiness.md)
declares direct `WORKER_EXECUTE` dispatch for normal and Autopilot runs, followed
by `verify-worker-ready.mjs --phase execute` and `EXECUTE_VERIFIED` attribution.
It retains a two-turn tool-free handshake through `--phase initial` and
`--phase complete` for diagnostic routing checks. Other candidate instructions
still require a pre-dispatch handshake. This source inconsistency needs
reconciliation and native acceptance evidence before either path can be called
an accepted runtime contract.

`APEX_UNATTENDED=1` selects proposed unattended behavior; it does not grant
authority. An Autopilot request does not bypass governance, required reviews,
human gates, or separate deployment authorization. A skill inherits the selected
agent's context and tool permissions; it does not switch agents or grant access.

### APEX and generic application workflows

APEX deployment consumes its approved environment manifest and IaC handoff.
Missing code or contract evidence returns to the owning step. Do not restart the
generic `apex-azure-prepare` flow to repair an APEX handoff.

Validation-only and preview-only requests return their results and stop. Neither
authorizes apply. If both workflow formats exist and the requested one is unclear,
ask the owner which workflow to use.

## Top-level agents

See the [workflow roster](/concepts/workflow/#core-agents-by-workflow-step) for step
owners and the [Architecture Explorer](/reference/architecture-explorer/) for the
pinned source inventory. Diagnose, Challenger, and Context Optimizer support
specific tasks outside the normal step sequence.

Explorer metadata describes source declarations. It is not a live view of a
running session or proof of runtime permissions.

## First-run project decisions (`iac_tool`, `review_depth`)

Requirements establishes the IaC choice. Review depth defaults to the workflow's
normal review policy. Deep review requires an explicit owner decision; do not
infer it from the workload's complexity.

Read existing decisions before asking again. If the owner changes a decision,
record the change through the supported recall command and reassess affected
artifacts. Do not treat the earlier answer as permanently immutable.

## Per-step user gates (architect, design, governance)

The owner resolves choices such as SKU selection, budget trade-offs, review
findings, and governance constraints. Record actual decisions, not inferred
acceptance. Use the product's
[candidate decision-key contract](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/tools/apex-recall/docs/decision-keys.md)
for supported keys.

Discovered tag policy controls required keys, values, and casing. When no inherited
tag policy applies, use the current product fallback rather than a copied tag list
from a historical example.

## Subagents

Helpers perform bounded tasks such as pricing, code validation, preview, or
policy precheck. Their parent must permit that delegation. They return evidence
to the owner and do not take over the main workflow.

`10-Challenger` remains available for optional manual review and repair. The
candidate assigns automatic reviews to built-in `rubber-duck`, not the legacy
`challenger-review-subagent`.

## The challenger pattern

Use the [current review matrix](/concepts/workflow/#adversarial-review-matrix).
The candidate declares that automatic independent workflow reviews invoke built-in `rubber-duck`
reviewer synchronously via the one-shot review contract (`APEX_REVIEW`) and
persist validated findings with `record-review.mjs` and
`validate-challenger-findings.mjs --verify-cache`. `10-Challenger` remains an
optional manual review and repair workflow rather than a mandatory automatic
handoff hop. Architecture and cost-estimate reviews are independent. Deep review
is opt-in (`decisions.review_depth = "deep"`), preserving separate canonical
pass files. Design and CodeGen reviews are optional; Deploy has no Challenger
review.

Inspect the findings and resolve required changes against the reviewed inputs.
When a reviewer is unavailable, stop and use the human handoff. Missing, empty,
or stale review output cannot be replaced with a success-shaped summary.

## Handoffs and delegation

Handoffs preserve task ownership and evidence through files. They do not guarantee
that every earlier detail is in the next agent's context. Name the required
artifacts and unresolved issues explicitly, and use
[state recovery](/guides/session-debugging/) when reads or writes fail.

## Creating a custom agent

Make product-agent changes in APEX or your template-derived project, not apex-docs.
Follow the current
[candidate agent-authoring instructions](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/instructions/agent-authoring.instructions.md).

### Step 1: choose agent type and model

Choose a human-facing main agent or a bounded helper. Under the proposed policy,
active definitions omit model and reasoning-effort pins. Leave per-call model,
effort, and context overrides unset so the operator and runtime control selection.
Do not infer effective selection or permission from a catalog label.

### Step 2: create the agent file

Use an existing agent of the same type as a starting point, then review every
metadata field. Keep `01-Orchestrator` human-selected. Step agents permit only
the proposed approved Orchestrator dispatch, and leaves cannot delegate or ask
the user. Use an empty helper allowlist when no delegation is needed.

### Step 3: write the agent body

The candidate validates body structure independently of the selected model.
Main agents use one H1 and either the Markdown contract with Role, Goal, Success
criteria, Constraints, Output, and Stop rules H2s, or the structured contract with
`## Role`, `<scope_fencing>`, `<output_contract>`, and `<stop_conditions>`.
Leaf workers use their role-specific input, activity, output, and failure contract.

Reference skills for detailed procedures. Keep essential approval and safety
requirements explicit rather than assuming an authoring glob attaches at runtime.

### Step 4: register the agent

Update the source registry and any workflow references required by the product's
authoring rules. Keep metadata consistent with the agent file. Do not copy stale
skill inventories into multiple registries.

### Step 5: validate

Run from the product repository:

```bash
npm run validate:agents
npm run validate:agent-registry
```

Then exercise discovery and the intended handoff in the supported client.
Static validation alone does not verify runtime behavior.

### Troubleshooting

For a missing agent, inspect file location, frontmatter, and discovery settings.
For a missing tool, inspect registration, authentication, the agent's allowlist,
and the requested operation. Do not broaden permissions merely to hide a failure.
