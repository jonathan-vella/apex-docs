---
title: "Agent architecture"
description: "Understand VS Code Copilot harness boundaries, unpinned runtime models, delegated question and review envelopes, and custom agent authoring."
---

<span id="current-agent-body-migration"></span>
<span id="proposed-simplification-and-planning-gate"></span>

APEX targets the **Copilot** session target (GitHub Copilot SDK harness) inside VS Code. Active agent definitions under [`.github/agents/`](https://github.com/jonathan-vella/apex/tree/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/agents) omit fixed model pins and UI `handoffs:` buttons so model selection stays runtime-managed while `01-Orchestrator` coordinates step workers, question batching, and independent Challenger reviews.

## Runtime and delegation model

### Direct questions and delegated input

Interactive step owners (`02-Requirements`, `03-Architect`, `04-Design`, and `04g-Governance`) retain native `ask_user` access when directly selected in Copilot Chat. You do not need to route single-step discovery through `01-Orchestrator` just to answer missing material questions.

| Invocation context | How missing input or review is handled |
|---|---|
| Directly selected main agent | Validates the question payload and calls native `ask_user` directly. |
| Delegated main worker | Returns `USER_INPUT_REQUIRED` (or `REVIEW_REQUIRED` when nested task access is unavailable) to its interactive parent without calling user tools. |
| Leaf subagent | Executes one bounded task and returns structured output or a blocker; never prompts the user or delegates. |

Every user-question payload is validated with `validate_question_batching.py` (`message` plus `requestedSchema.properties` only, with `context` kept outside the native payload). Native fields accept custom text directly, so companion `*_other` and unconditional note fields are forbidden. On Requirements continuation, `01-Orchestrator` passes the full captured-answer ledger rather than only the most recent reply.

When native Autopilot is active, it may auto-answer routine prompts; therefore, a returned form response records captured input values (`practical-v1` `request_id`) rather than independent human risk or deployment authority.

### Handoffs without UI controls

Active `.agent.md` files omit `handoffs:` frontmatter because the VS Code Copilot target uses native task results and explicit picker selection rather than handoff buttons. `agent-output/{project}/00-handoff.md` and `apex-recall handoff <project> --json` provide the durable record of current checkpoints, frozen inputs, and next-step commands across sessions.

### Native task lifecycle

`01-Orchestrator` dispatches authorized named workers without custom readiness handshakes, nonces, or raw-log preflight checks. Same-task continuation is used only when the returned native task handle supports it; one-shot tasks receive complete bounded context up front.

Runtime `.github/hooks/` chat hooks remain retired; deterministic safety relies on `apex-recall` gates, `record-review.mjs` hash verification, validation scripts, Git Lefthook, and CI workflows. See [Copilot hooks](/concepts/how-it-works/workflow-engine/#copilot-hooks).

## Agent anatomy

Each `.agent.md` file combines YAML frontmatter (`name`, `description`, `tools`, and optional `disable-model-invocation`) with an explicit instruction body defining role, scope boundaries, required skill loads, output contracts, and stop rules.

### Tools

Declared `tools` list file operations, shell execution, MCP tools, or allowlisted subagents. Static frontmatter allowlists are authoring declarations rather than cryptographic credential isolation; cloud operations still require Azure RBAC and explicit owner approval.

### Handoffs

Step transitions run atomically through `apex-recall transition <project> --from-step <s> --to-step <t> --complete` after required Challenger sidecars pass validation and the human approves the gate.

<span id="local-and-agent-host-boundaries"></span>

### Copilot SDK harness and entry skills

Archived Local `.prompt.md` adapters live under `.archive/` and are not active entry points; only `.github/prompts/waf-assess-existing.prompt.md` (`/waf-assess-existing`) remains active for standalone WAF assessments. User-invocable skills include `/apex-workflow-start`, `/apex-github-operations`, and `/apex-debug-log-export`.

`01-Orchestrator`, `07b-Bicep Deploy`, `07t-Terraform Deploy`, `09-Diagnose`, and `10-Challenger` set `disable-model-invocation: true` so they are invoked deliberately. Active definitions omit `model:` and `reasoning-effort:` fields, and callers leave per-call model, effort, and context overrides unset.

### APEX and generic application workflows

APEX deployment agents consume `04-environment-manifest.json` and `05-iac-handoff.json`. If upstream planning or code evidence is missing, return to the owning APEX step rather than scaffolding an unreviewed project through generic `apex-azure-prepare`. Validation-only and preview-only requests always stop after reporting results.

## Top-level agents

See the [workflow roster](/concepts/workflow/#core-agents-by-workflow-step) for step-by-step owners and the [Architecture Explorer](/reference/architecture-explorer/) for the generated relationship graph at the site's pinned APEX commit. `09-Diagnose`, `10-Challenger`, and `11-Context Optimizer` handle live diagnostics, manual review sessions, and token/log audits outside the numeric step sequence.

## First-run project decisions (`iac_tool`, `review_depth`)

Step 1 records `decisions.iac_tool` (`bicep` or `terraform`). `decisions.review_depth` defaults to single-pass reviews per required lens; multi-pass rotating reviews run only when the owner explicitly sets `decisions.review_depth = "deep"`. Consult [`decision-keys.md`](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/tools/apex-recall/docs/decision-keys.md) for valid `apex-recall decide` keys.

## Per-step user gates (architect, design, governance)

Under `practical-v1`, administrative disposition questions are eliminated while material architectural, policy-source (`corp-policy-v1`), SKU, budget, and final stage-approval decisions remain human-controlled. Live Azure Policy (`04-governance-constraints.json` `tag_contract`) defines required resource tags whenever present, falling back to the lowercase 9-tag greenfield contract only when no tag policy exists at any inherited scope.

## Subagents

Leaf subagents under `.github/agents/_subagents/` execute stateless domain checks:

- `challenger-review-subagent`: Read-only structured JSON reviewer for all workflow lenses.
- `cost-estimate-subagent`: Retail pricing engine via Azure MCP `pricing_get` (and constrained Retail Prices API fallback).
- `bicep-validate-subagent` and `terraform-validate-subagent`: Build, format, lint, AVM, and security-baseline validation.
- `bicep-whatif-subagent` and `terraform-plan-subagent`: Deployment change previews.
- `policy-precheck-subagent`: Live L3 Azure Policy precheck returning `PROCEED` or `BLOCK`.

## The challenger pattern

Automatic workflow gates and optional manual `10-Challenger` sessions invoke the same read-only `challenger-review-subagent` under [`one-shot-review.md`](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills/apex-azure-defaults/references/one-shot-review.md):

1. Capture input hashes via `validate-challenger-findings.mjs --metadata` (excluding mutable project-root manifests or state files) and validate the request with `record-review.mjs --preflight`.
2. Log `apex-recall review-audit <project> <step> ... --attempt-outcome started`.
3. Dispatch `challenger-review-subagent` synchronously using inline `APEX_REVIEW` JSON or, for large multi-file/multi-subscription bundles, the hash-bound `APEX_REVIEW_FILE` envelope (`request_path` plus `request_sha256` verified on disk by `record-review.mjs`).
4. Record the raw JSON verdict into `challenge-findings-*.json` via `record-review.mjs` and verify freshness with `validate-challenger-findings.mjs --verify-cache`.

Step 2 always requires both a `comprehensive` architecture review and a separate `cost-feasibility` review. If the reviewer is unavailable, returns empty output after one identical-input retry within the existing allowance, or reports unresolved `must_fix` findings, `apex-recall` blocks step completion until resolved.

## Handoffs and delegation

Because each delegated task runs in a fresh context window, `01-Orchestrator` passes explicit artifact paths, phase contracts, and settled material decisions rather than assuming chat history carries over. When state or lock issues arise, follow [session debugging](/guides/session-debugging/).

## Creating a custom agent

Author agent changes in `apex` or your `apex-accelerator` workload repository following [`agent-authoring.instructions.md`](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/instructions/agent-authoring.instructions.md) and the `apex-agent-authoring` skill.

### Step 1: choose agent type and model

Decide between an interactive main agent (`.github/agents/`) and a stateless leaf helper (`.github/agents/_subagents/`). Omit `model:` and `reasoning-effort:` pins in frontmatter so selection remains runtime-managed.

### Step 2: create the agent file

Copy a current agent of the same class, declare accurate `name`, `description`, and `tools` metadata, omit `handoffs:`, and set `disable-model-invocation: true` on orchestrator, deploy, diagnostic, or manual-review entry points.

### Step 3: write the agent body

Include one `# H1` title and the required section structure (`## Role`, `<scope_fencing>`, `<output_contract>`, and `<stop_conditions>`, or the standard Markdown H2 contract). Keep essential approval, security, output, and stop rules directly in the body and reference `.github/skills/apex-*/SKILL.md` for detailed domain procedures.

### Step 4: register the agent

Add or update the entry in `tools/registry/agent-registry.json` and, if the agent participates in workflow routing, `.github/skills/apex-workflow-engine/templates/workflow-graph.json`.

### Step 5: validate

Run the repository validators from the project root:

```bash
npm run validate:agents
npm run validate:agent-registry
npm run validate:context-budget
```

### Troubleshooting

If a custom agent does not appear in the VS Code Copilot agent picker, check `.agent.md` YAML frontmatter syntax, confirm the workspace is trusted inside the dev container, and reload the VS Code window so updated definitions attach from disk.
