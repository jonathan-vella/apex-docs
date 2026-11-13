---
title: "Workflow engine and validation"
description: "Understand workflow DAG routing, apex-recall state transitions, Challenger sidecar enforcement, and Lefthook vs. retired Copilot hooks."
---

## Workflow engine

### The DAG model

The machine-readable [workflow graph](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills/apex-workflow-engine/templates/workflow-graph.json) defines two execution profiles:

- **Delivery DAG (`practical-v1` default).** Connects Step 1 Requirements, Step 2 Architecture, optional Step 3 Design, Step 3.5 Governance, Step 4 IaC Plan, Step 5 CodeGen, Step 6 Deploy, Step 7 As-Built, and Post-Lessons, including return edges (such as `step-6b -> step-5b` or `step-N -> step-2`) when downstream validation or quota checks uncover upstream conflicts.
- **Standalone assessment DAG (`workflow_mode=assessment`).** Routes `scope` -> optional `requirements` -> `evidence` -> `analysis` -> `diagram` -> `review` -> `acceptance` -> `terminal` (`apex-recall assessment <project> --action start|advance|revise|accept|adopt`) without entering Governance, IaC planning, or deployment.

See [Run the workflow](/concepts/workflow/) for step-by-step inputs and outputs.

### Gates and approval points

`apex-recall complete-step` and `apex-recall transition --complete` enforce Challenger sidecar gates at runtime (exiting with code `2` when required `challenge-findings-*.json` files are missing, stale against disk hashes, mismatched on lens, or hold unresolved `must_fix` findings). Step 2 enforces both `comprehensive` architecture and separate `cost-feasibility` reviews, and rejects leftover `*.tmp.md` or `FAILED` cost files (`step2_residue`).

Human approval gates remain mandatory at every delivery stage transition, at Step 6 cloud deployment, and at final bundle acceptance for standalone WAF assessments.

### Native tasks and questions

Interactive step owners ask missing material questions through native `ask_user` when directly selected, or return `USER_INPUT_REQUIRED` (`message` plus `requestedSchema.properties`) when delegated by `01-Orchestrator`.

Independent reviews invoke the shared read-only `challenger-review-subagent` synchronously with no model or effort overrides, passing inline `APEX_REVIEW` JSON or a hash-bound `APEX_REVIEW_FILE` envelope (`request_path` plus `request_sha256` verified on disk by `record-review.mjs`). When two lenses share a frozen snapshot (such as Step 2 or standalone assessment WAF and cost-feasibility reviews), `review-audit ... --attempt-outcome started` is recorded sequentially before parallel `task` dispatch, and `record-review.mjs` writes complete sequentially afterward so state updates never contend on `00-session-state.json.lock`.

### IaC routing

Step 1 records `decisions.iac_tool` (`bicep` or `terraform`). Step 4 runs the shared `05-IaC Planner`, and Steps 5 and 6 route to `06b-Bicep CodeGen` / `07b-Bicep Deploy` or `06t-Terraform CodeGen` / `07t-Terraform Deploy`.

### Session state and resume

All session state flows through `apex-recall`:

- Prefer `apex-recall transition <project> --from-step <s> --to-step <t> --complete --decision key=value --json` to bundle step completion, Challenger gate verification, decision recording, and next-step entry into one atomic write.
- Use `apex-recall show <project> --json` and `apex-recall handoff <project> --json` to inspect current checkpoints, `blocked_prerequisites`, `review_cycles`, and exact resume commands. See [`show-schema.md`](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/tools/apex-recall/docs/show-schema.md).
- Reopening an earlier step with `start-step --force` marks dependent downstream steps `stale` and sets `plan_status` to `SUPERSEDED` so stale artifacts must be re-verified in order. See [session debugging](/guides/session-debugging/#reopen-a-completed-step).

### Session break protocol

When ending or switching chats, `00-handoff.md` and `apex-recall` preserve project context on disk. In a new VS Code Copilot Chat window, select `01-Orchestrator` and send `resume <project>` (or run `/apex-workflow-start resume <project>`). Never edit `00-session-state.json` directly.

## Quality and safety systems

### Validation scripts

Node and Python validators enforce artifact H2 templates, JSON schemas, agent/skill contracts, question batching, governance property maps, SKU manifest coverage, and the IaC security baseline. See the [validation reference](/reference/validation-reference/) for the full catalog.

<span id="git-hooks-pre-commit-and-pre-push"></span>

### Git hooks

Git Lefthook runs local `pre-commit` checks (`gitleaks` secret scanning, `artifact-validation`, safe-shell, and lint checks), `commit-msg` Conventional Commit validation, and `pre-push` diff-based validators (`diff-based-push-check.sh`) before code leaves your workstation.

### Circuit breaker

Deploy agents cap automated error recovery at bounded retries (default 3 attempts) and halt immediately on Azure Policy denials, quota conflicts, or missing authorization, surfacing structured diagnostics to the operator instead of looping or substituting SKUs silently.

### Context compression

The `apex-context-management` skill defines runtime compression rules (`full`, `summarized`, `minimal`) when passing upstream Markdown context to downstream agents while keeping JSON contracts (`sku-manifest.json`, `04-governance-constraints.json`, `04-iac-contract.json`) intact and uncompressed.

### Copilot hooks

APEX runtime chat hooks under `.github/hooks/` (`tool-guardian`, `subagent-validation`, and `hooks.json`) were permanently retired and deleted during the transition to the VS Code Copilot target. Do not recreate `.github/hooks/` or add regex command-interception hooks during setup:

- Regex chat hooks cannot provide real credential or cloud-permission isolation, and native tool allowlists in `.agent.md` frontmatter are authoring metadata rather than a security sandbox.
- Active deterministic enforcement lives in `apex-recall` step and Challenger sidecar gates, `record-review.mjs` provenance checks, repository validators (`npm run validate:all`), `azd` lifecycle hooks inside workload `azure.yaml` files, Git Lefthook (`pre-commit` `gitleaks` and `pre-push` checks), and GitHub Actions CI workflows.
