---
title: "Agent architecture"
description: "Use direct agent questions and native tasks without confusing source migration with runtime acceptance."
---

:::caution[Execution authorized, runtime acceptance unverified]
On October 18, the owner authorized the approved migration execution and
evidence-based packet progression in
[APEX PR #779](https://github.com/jonathan-vella/apex/pull/779), superseding
the earlier `PLAN_THEN_APPROVE` hold. That authorization is not acceptance of
the proposed engineering lead, skills, pilot, or runtime implementation.
Real-Azure deployment and E2E work are authorized in principle only. The exact
tenant, subscription, resource boundary, budget, and action scope remain
unestablished, so no cloud action may proceed on that basis. Cleanup is not
authorized. The earlier candidate at
[`a315279`](https://github.com/jonathan-vella/apex/tree/a315279aa5d09bfc7657c14536c1776cadcd6069)
is historical implementation evidence, not the approved target or a shipped contract.
:::

## Current agent-body migration

On October 18, the migration owner reported that all current main and leaf
agent bodies had been migrated in the source worktree. That work was not yet
committed when this documentation update began. Validation and runtime
certification were incomplete. The behavior described here is the reported
source contract, not a released runtime guarantee. The site's generated Explorer
still uses its separate `apex-source.json` pin.

The body migration retains the named agents and domain workflow. It is separate
from the broader proposal to consolidate roles, retire the roster, or establish
an independent deployment approval boundary.

### Direct questions and delegated input

Main agents retain their names, user-selectable entries, and explicit native
`ask_user` tools. Select `02-Requirements`, `03-Architect`, `04-Design`, or
`04g-Governance` directly to work through missing material questions. They must
not force you through Orchestrator merely to ask about requirements, architecture
choices, design intent, or governance scope.

| Invocation | Who handles missing input |
|---|---|
| Directly selected main agent | The agent asks through its available native question tool. |
| Delegated main worker | Returns `USER_INPUT_REQUIRED` to its interactive parent without calling user tools. |
| Leaf helper | The helper returns its role-specific failure or blocked result. It never asks the user or delegates. |

A delegated input request includes `request_id`, `phase`, `message`, and
`requestedSchema.properties`, and identifies the missing inputs. The interactive
parent presents the question and returns the answer to the owning task.
An unavailable question tool or unanswered material question is not permission
to guess, approve, or advance. Autopilot may answer routine questions; that answer
does not establish independent owner authority.

### Handoffs without UI controls

The migration deliberately omits active `handoffs:` metadata. Continue through
the native task or run result when delegation is supported, or explicitly select
the named next agent. APEX does not require a handoff button. The durable
`00-handoff.md` artifact still records scope, current inputs, unresolved findings,
and the next owner. It is not UI metadata or approval by itself.

In the owner's October 18 Copilot-target test, the owner explicitly selected
Probe Source in the picker and received `SOURCE_READY_20261018`. No handoff
controls appeared. The transcript also showed Read/search despite `tools: []`.
That test does not establish native tool-restriction enforcement or credential
isolation. It does not certify every production agent or handoff.

The [GitHub configuration reference](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
says `handoffs` is ignored by Copilot cloud agent on GitHub.com. That is a
cloud-specific statement, not proof that every VS Code target ignores the field.
APEX's no-metadata design and the observed Copilot result are separate facts.

### Native task lifecycle

Use the task and result contract actually available in the selected Copilot
session. A synchronous or one-shot task returns its result. A native asynchronous
task may support same-task continuation through its returned handle; retain that
handle only for the same work. Do not assume every task can resume, replace a
failed one-shot call with an invented continuation API, or advertise one tool
name as a universal IDE interface.

The body migration removes worker-ready handshakes, nonce exchanges,
`WORKER_EXECUTE`, mandatory verifier commands, and log preflight from active
bodies and shared caller guidance. Old verifiers and event readers remain for
historical compatibility and diagnostics, not execution prerequisites.
This does not remove independent production review receipts, `record-review`
attribution, or freshness checks. Required reviews and owner approvals still
gate the domain workflow.

VS Code's [agent-harness guide](https://code.visualstudio.com/docs/agents/agent-harnesses)
distinguishes the Copilot target from Local and Cloud. Ask and Agent are built-in
Copilot roles; Plan and Autopilot are modes. Changing a model or role does not
change the session's target. Tool availability and customization support must be
checked in that target, not inferred from the shared SDK.

## Proposed simplification and planning gate

The target supports only the Copilot session target, Copilot SDK/Agent Host,
inside VS Code. Local, CLI, cloud-agent, and other IDE execution runtimes are out
of scope. CLI tools and SDK documentation may inform an explicitly checked VS Code
equivalent; that does not offer a CLI product runtime. Historical archives and
readers remain available.

For routine repository engineering, the proposal permits a short interactive APEX
engineering lead or the native Agent, with domain skills loaded on demand. It
proposes a native bounded independent reviewer and one separately permissioned
deploy operator with Bicep and Terraform adapters. It does not presume that the
existing main-step and leaf-agent roster must survive the redesign.
Native roles and tool allowlists alone do not isolate credentials or security
authority. The deploy operator needs a separate permission boundary.

Native Autopilot would perform most routine engineering, tests, bounded repairs,
commits and pushes to approved feature branches, PR and issue updates, and scoped
reviewer fixes without repeated confirmations. It may answer blocking questions
within that scope. A successful `ask_user` call or form can be answered by
Autopilot; it is not genuine human approval. `APEX_UNATTENDED=1` grants neither
authority nor proof that native Autopilot is selected. Consequential permission,
expense, security, or requirements changes and deployment approval require a
genuine independent owner boundary.

The owner intentionally deleted APEX `.github/hooks/` runtime hooks. No APEX
runtime hooks are currently provided in this migration checkout; do not restore
them or introduce replacement hooks. Their regex command guard, self-modification
check, advisory output check, and hook audit logging no longer protect tool calls.
Native tool restrictions are not proven equivalent. Verify native permission
boundaries before relying on them, including the still-unknown cloud boundary.
Azure requirements survive this retirement. Git Lefthook, pre-commit checks,
secret scanning, and CI are separate tooling, not retired by this decision.
See the [retirement record](/guides/hooks/).

The current body migration removes the earlier per-worker readiness rituals
from the active execution contract. That source change does not establish pilot
acceptance or verified replacement permission boundaries. Neither a compulsory
two-turn handshake nor universal task statelessness defines the target.

The redesign must retain tested Azure security, live governance, SKU and AVM
contracts, cost provenance, durable project decisions, atomic writes, and
historical compatibility. Native session SQL and todos are not cross-project
approval storage. One independent technical review path is proposed. The owner
must decide any change to the currently mandatory separate architecture
cost-feasibility review; deep review remains opt-in. Do not repair review history,
counters, hashes, or findings to make the proposal appear accepted.

The plan has no accepted runtime pilot or deployment result. Prior READY evidence
was withdrawn, including synthetic shutdown evidence and leading approval
prompts. Passing source or documentation checks is not runtime end-to-end
acceptance. Optional usage measurements must record missing data as `UNKNOWN`,
not zero; no token, cost, or latency savings are established.

October 18 prerequisite observations reported by the migration owner are narrower
than pilot acceptance. An earlier native background task returned `INPUT_REQUIRED`,
and same-task `write_agent` continuation worked on its retained worker ID. That
historical output is not the current delegated-main `USER_INPUT_REQUIRED` contract. A skill
loaded in the parent, and pricing MCP metadata discovery succeeded without a
cloud query. Native `ask_user` in Autopilot returned `user not available`, not
human signoff. The owner-scope question was also unavailable; no cloud writes
followed. The existing GitHub `copilot`, `dev`, `prod`, and `staging` environments
had no `protection_rules`; `pages` had only a branch policy. These observations
do not establish a deployment approval boundary. Source body migration is now
reported in progress, but the full pilot, source validation, and fleet runtime
certification remain unverified. This docs update did not reproduce those runtime checks.

Use the approved feature branch's
[PRD](https://github.com/jonathan-vella/apex/blob/feat/copilot-harness-migration/tools/plans/copilot-harness-migration/prd.md),
[backlog](https://github.com/jonathan-vella/apex/blob/feat/copilot-harness-migration/tools/plans/copilot-harness-migration/backlog.md),
and [roadmap](https://github.com/jonathan-vella/apex/blob/feat/copilot-harness-migration/tools/plans/copilot-harness-migration/roadmap.md)
for the proposal. These are moving planning links, not released behavior pins.
CHM01 [#769](https://github.com/jonathan-vella/apex/issues/769) and CHM02
[#771](https://github.com/jonathan-vella/apex/issues/771) remain closed historical work.
The remaining packets cover actual VS Code native capability in CHM03
[#773](https://github.com/jonathan-vella/apex/issues/773), the representative
no-cloud pilot in CHM04 [#772](https://github.com/jonathan-vella/apex/issues/772),
MCP and runtime-hook retirement in CHM05 [#775](https://github.com/jonathan-vella/apex/issues/775),
evidence and optional usage in CHM06 [#768](https://github.com/jonathan-vella/apex/issues/768),
documentation in CHM07 [#774](https://github.com/jonathan-vella/apex/issues/774),
and the final release matrix in CHM08 [#770](https://github.com/jonathan-vella/apex/issues/770).
Owner execution authorization permits implementation and evidence-based packet
progression, including the representative no-cloud pilot. It does not mark any
packet accepted. The full production simplification still needs accepted pilot,
replacement-check, source-phase, and final release evidence before cutover.

The sections below explain retained workflow concepts and identify historical
candidate details. The broader consolidation proposal does not make roster
retirement part of this body migration.

## Agent anatomy

An `.agent.md` file has metadata and an instruction body. Metadata declares the
name, description, tools, and invocation rules. Active migration definitions
omit `handoffs:`. The body
defines the task, expected evidence, constraints, and stop conditions.

Read the earlier candidate's
[agent definitions](https://github.com/jonathan-vella/apex/tree/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/agents)
instead of copying a model name or body-size limit from an old example.

### Tools

An agent's declared tools can include file operations, terminal commands, MCP
queries, and permitted helper delegation. Registration or authentication does not
authorize every possible operation. The task and its approval boundaries still apply.

### Handoffs

Main agents produce artifacts under `agent-output/{project}/`. A handoff identifies
the next main agent and its inputs. Select `01-Orchestrator` to coordinate
approved step dispatch, or select an individual step agent directly.
Native task results and explicit user selection replace reliance on UI handoff
controls. Neither route removes review or approval gates.

<span id="local-and-agent-host-boundaries"></span>

### Copilot SDK harness and entry skills

The earlier candidate targets the GitHub Copilot SDK harness inside VS Code. It
places legacy Local `.prompt.md` files under `.archive/pre-cpharness/` and manual
entry skills under `.github/skills/` (`/apex-workflow-start`,
`/apex-git-commit`, and `/apex-debug-log-export`).

`01-Orchestrator` remains human-selected (`disable-model-invocation: true`) and
the candidate declares delegation to allowlisted step agents in worker contexts.
Active agent definitions omit model and reasoning-effort pins so the operator
and runtime control selection, including Auto and HydraFusion. Model metadata is
diagnostic, not evidence of worker readiness or approval.

The historical [worker-readiness contract](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/skills/apex-workflow-engine/references/worker-readiness.md)
describes direct dispatch and a diagnostic handshake, while other instructions
in that candidate still require a pre-dispatch handshake. Neither conflicting
candidate path establishes accepted native behavior. Those rituals are absent
from the current body migration. Retained readers do not reinstate them.

A skill inherits the selected agent's context and tool permissions; it does not
switch agents or grant access. An unattended environment flag cannot select or
verify native Autopilot and cannot authorize an owner-only action.

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
acceptance. Directly selected Architect, Design, and Governance agents ask
material questions themselves. Delegated workers return the structured request
to their parent instead. Use the product's
[candidate decision-key contract](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/tools/apex-recall/docs/decision-keys.md)
for supported keys.

Discovered tag policy controls required keys, values, and casing. When no inherited
tag policy applies, use the current product fallback rather than a copied tag list
from a historical example.

## Subagents

Helpers perform bounded tasks such as pricing, code validation, preview, or
policy precheck. Their parent must permit that delegation. Leaves never ask user
questions or delegate. Their role-specific file, text, and output-status
contracts remain intact; native task handling is not a replacement schema.

`10-Challenger` remains available for optional manual review and repair. The
earlier candidate assigns automatic reviews to built-in `rubber-duck`, not the legacy
`challenger-review-subagent`.

## The challenger pattern

Use the [existing review matrix](/concepts/workflow/#adversarial-review-matrix)
until the owner approves a replacement.
Independent production workflow reviews retain the built-in `rubber-duck`
one-shot review contract (`APEX_REVIEW`) and
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
Do not treat a native task's completion, a question response, or `00-handoff.md`
as permission for the next step.

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
metadata field. Keep `01-Orchestrator` human-selected. Preserve direct selection
and native questions for main agents, with the delegated-worker input return
described above. Leaves cannot delegate or ask the user. Omit UI handoff
metadata. Tool declarations require runtime verification; they are not proof of
credential isolation.

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
