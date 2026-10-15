---
title: "Session state debugging"
description: "Inspect APEX session state and use authorized recovery without overwriting workflow evidence."
---

Use `apex-recall` to inspect and update APEX session state. Do not edit
`00-session-state.json` with `jq`, copy a backup over it, or delete it to bypass a
blocked step.

The [public recall schema](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/tools/apex-recall/docs/show-schema.md)
defines the supported fields and recovery outcomes.

<span id="session-state-overview"></span>

## Inspect the current state

Run from the project repository, replacing `my-project` with its project name:

```bash
apex-recall show my-project --json
```

`show` reads primary state and the local artifact inventory. It does not restore a
backup or rebuild the index. Missing primary state reports `state_status: "missing"`
and an empty session. Corrupt state requires recovery rather than returning cached
success.

Use read-only queries to narrow the output:

```bash
apex-recall show my-project --json |
  jq '.session.steps // {}'
```

Step keys are strings such as `"1"`, `"3_5"`, and `"6"`. The public `iac_tool`
values are `"Bicep"` and `"Terraform"`. Do not infer a review approval from a step
number, an artifact filename, or the presence of a prior result.

<span id="diagnostic-flowchart"></span>
<span id="common-problems"></span>

## Interpret a failed write

| Outcome | Meaning | Next action |
|---|---|---|
| Conflict, exit 2 | The writer detected competing state or changed watched inputs and did not replace primary state. | Preserve the error, read the current state, and resolve the competing work before retrying. |
| `committed_but_index_stale`, exit 3 | The primary write committed, but the index update failed. | Follow the command's explicit reindex instructions. Do not repeat the mutation as if nothing happened. |
| `step2_residue`, exit 2 | Step 2 cannot complete while a `*.tmp.md` file or a
cost estimate with status `FAILED` is in the project folder. `--allow-missing-challenger`
does not bypass it. | Move superseded or failed cost files to `_meta/`, delete scratch
files, and rerun the command. |
| `already_applied` | An identical validated operation was already recorded. | Inspect the recorded result rather than forcing the step to run again. |
| Recovery required | Primary state is missing or damaged and cannot support the requested operation. | Preserve evidence and obtain explicit owner authorization for recovery. |

`reindex` repairs a derived index. It does not roll state back or grant permission
to complete a step.

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
