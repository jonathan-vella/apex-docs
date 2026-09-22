---
title: "Agent architecture"
description: "Choose main agents, understand helper boundaries, and author changes without bypassing approvals."
---

## Agent anatomy

An `.agent.md` file has metadata and an instruction body. Metadata declares the
name, description, model, tools, invocation rules, and handoff targets. The body
defines the task, expected evidence, constraints, and stop conditions.

Read the actual
[agent definitions](https://github.com/jonathan-vella/apex/tree/a656e66d83cfae8d525ce0d2012b124599b37252/.github/agents)
instead of copying a model name or body-size limit from an old example.

### Tools

An agent's declared tools can include file operations, terminal commands, MCP
queries, and permitted helper delegation. Registration or authentication does not
authorize every possible operation. The task and its approval boundaries still apply.

### Handoffs

Main agents produce artifacts under `agent-output/{project}/`. A handoff identifies
the next main agent and its inputs. You select that agent and approve the scope.
The Orchestrator is a routing aid, not a main-agent scheduler.

### Local and Agent Host boundaries

Local prompt files are adapters, not proof that another client supports the same
entry point. Main agents, including `10-Challenger`, require human selection and
use `disable-model-invocation: true`.

A skill inherits the selected agent's context and tool permissions. It does not
switch agents or grant access. Validate client discovery, model availability,
and instruction attachment separately from source-file syntax.

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
[decision-key contract](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/tools/apex-recall/docs/decision-keys.md)
for supported keys.

Discovered tag policy controls required keys, values, and casing. When no inherited
tag policy applies, use the current product fallback rather than a copied tag list
from a historical example.

## Subagents

Helpers perform bounded tasks such as pricing, code validation, preview, or
policy precheck. Their parent must permit that delegation. They return evidence
to the owner and do not take over the main workflow.

Challenger is a human-selected main agent. Do not route its work through a
`challenger-review-subagent` example from older documentation.

## The challenger pattern

Use the [current review matrix](/concepts/workflow/#adversarial-review-matrix).
Architecture and cost-estimate reviews are independent. Deep review is opt-in.
Design and CodeGen reviews are optional; Deploy has no Challenger review.

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
[agent-authoring instructions](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/.github/instructions/agent-authoring.instructions.md).

### Step 1: choose agent type and model

Choose a human-facing main agent or a bounded helper. Use an approved model that
the intended runtime and account can access. Do not infer a helper's model from
its parent or silently substitute another model.

### Step 2: create the agent file

Use an existing agent of the same type as a starting point, then review every
metadata field. Production main agents need human-entry restrictions. Use an
empty helper allowlist when no delegation is needed.

### Step 3: write the agent body

State the role, goal, success criteria, constraints, output, and stop rules.
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
