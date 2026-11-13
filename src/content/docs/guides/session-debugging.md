---
title: "Session state debugging"
description: "Inspect apex-recall handoff diagnostics, handle state locks and stale steps, and recover damaged project state safely."
---

Use `apex-recall` for every session-state inspection and update. Never edit `00-session-state.json` directly with `jq`, copy backups over primary state by hand, or delete state files to bypass a blocked gate.

The canonical [`show-schema.md` reference](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/tools/apex-recall/docs/show-schema.md) documents all supported fields, exit codes, and recovery contracts.

<span id="session-state-overview"></span>

## Inspect current state and handoff readiness

Run both read-only commands from your workload repository root, replacing `my-project` with your project folder name:

```bash
apex-recall show my-project --json
apex-recall handoff my-project --json
```

`show` inspects primary state (`state_status`, `.session.steps`, `.session.decisions`, `.session.effective_reviews`, `.session.gate_readiness`, and `.session.assessment_run` for standalone WAF assessments) without mutating files or restoring backups.

`handoff` computes deterministic recovery guidance for the next owner, including:

- `blocked_prerequisites`: exact missing artifacts, stale or unrecorded Challenger sidecars, or missing `corp-policy-v1` target-verified policy evidence.
- `review_cycles` and remaining allowances under `practical-v1`.
- Frozen input digests, settled material inputs, and the exact command to resume safely.

Narrow large outputs with `jq`:

```bash
apex-recall show my-project --json |
  jq '.session | {current_step, steps, policy_feasibility, gate_readiness, assessment_run}'
```

Step keys use strings such as `"1"`, `"3_5"`, and `"6"`. Never infer approval from artifact filenames or step numbers alone.

<span id="diagnostic-flowchart"></span>
<span id="common-problems"></span>

## Interpret failed writes and lock contention

| Outcome | Meaning | Action |
|---|---|---|
| Challenger or prerequisite blocker, exit `2` | `complete-step` or `transition --complete` found a missing, stale, lens-mismatched, or `must_fix` `challenge-findings-*.json` sidecar (or missing required phase scope). | Run `apex-recall handoff my-project --json`, inspect `blocked_prerequisites`, resolve the findings in the owning agent, and record a fresh `challenger-review-subagent` pass. |
| `step2_residue`, exit `2` | Step 2 cannot complete while `*.tmp.md` scratch files or a `FAILED` cost estimate remain in `agent-output/my-project/`. | Move superseded or failed cost files into `agent-output/my-project/_meta/`, remove scratch files, and rerun. |
| Lock contention (`00-session-state.json.lock`), exit `2` | Two processes attempted concurrent state writes (for example, parallel `record-review.mjs` or `review-audit` calls). | Serialize state writes: log each `review-audit ... --attempt-outcome started` sequentially before parallel `task` calls, and run `record-review.mjs` sequentially afterward. If an interrupted process left an orphaned lock, verify no active `apex-recall` or `node` PID owns it before asking the owner to clear it. |
| `committed_but_index_stale`, exit `3` | Primary state updated cleanly, while the cross-project search index failed to refresh. | Run the `apex-recall reindex` command printed in the error output instead of repeating the step transition. |
| `already_applied` | An identical idempotent transition or decision was already recorded. | Continue from the recorded checkpoint shown by `apex-recall handoff my-project --json`. |
| `corrupt` or `missing` primary state | `00-session-state.json` is unreadable or absent. | Preserve disk evidence and request explicit owner authorization before running `recover-state`. |

<span id="corrupted-state-file"></span>

## Recover damaged state

Only use recovery after the project owner authorizes that operation. Record the
actual authorization as the reason:

```bash
apex-recall recover-state my-project \
  --reason "Owner authorized restoring this project's damaged primary state" \
  --json
```

The command refuses healthy primary state, validates backup identity and shape,
preserves damaged bytes and the good backup, and appends a recovery audit.
It does not approve the project, its reviews, or a deployment.

If a crashed process left a handoff-renderer lock, investigate it with the owner.
Do not remove it merely because it looks old.

<span id="missing-steps"></span>
<span id="schema-version-mismatch"></span>

## Reopen a completed step

`apex-recall start-step <project> <step> --force` reopens a completed step. The
command marks every dependent step that is `complete` or `in_progress` as `stale`
and clears its start and completion times. If the plan was `APPROVED` or
`EXCEPTION_AUTHORIZED` and the reopened step is 1, 2, 3.5 or 4, the command sets
`plan_status` to `SUPERSEDED`. Artifacts and risk authorizations stay as history.

A stale step is not complete, so the next step cannot start until the stale step is
completed again in order. Starting or transitioning into a stale step clears its
stale markers. Readers that do not know the `stale` status should treat it as
unfinished. A reopen needs a new Plan approval before `plan_status` returns to
`APPROVED`.

Use `apex-recall show <project> --json` to confirm the stale steps, then regenerate
the handoff with `render-session-handoff` so it lists them with the reason.

## Record a review attempt

`apex-recall review-audit` records review attempts: `started` before the review and
the actual outcome after it. Pass each frozen input with `--attempt-input <path>`
(repeatable) instead of computing `--input-digest` by hand. The command hashes the
sorted workspace-relative paths and file hashes, so the start and the outcome
records use the same digest, and a file that changed during the review is rejected.

The output includes `input_digest` and `permission_granted_by_this_record: false`.
The record is evidence only. It does not authorize a retry or a step.

## Resume a blocked step

Read the failure, the current state, and the step's required artifacts. Use the
owning main agent to resolve missing or outdated evidence. Review selections and
completion are revalidated when the workflow resumes.

Do not use older writers against projects that rely on newer selection or conflict
rules. Preserve evidence and resolve version changes through reviewed source
changes rather than an automatic state migration.

## Decision logging

Record decisions through the supported recall commands and the owning agent's
workflow. Use `apex-recall decide --help` to inspect the installed interface.
A decision record must reflect an actual owner decision, not an inferred approval.

## Context budget strategy

Read the current state and the relevant artifacts rather than pasting the entire
project history into a new chat. Keep the task, unresolved findings, and required
inputs explicit. A short handoff still needs the evidence required by its step.

## Validators

Use the product's `npm run validate:session-state` and the step-specific validators
as documented in [validation reference](/reference/validation-reference/).
Do not modify state to make a validator pass without resolving its finding.

## Related

For tool or authentication failures, use [troubleshooting](/guides/troubleshooting/).
For agent execution evidence, use [debug log export](/guides/apex-debug-log-export/).
