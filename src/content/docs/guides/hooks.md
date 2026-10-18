---
title: "Agent Hooks"
description: "APEX runtime-hook retirement, lost protection, and the separate Git validation tooling that remains."
---

:::caution[Runtime hooks retired by owner decision]
The owner intentionally deleted APEX `.github/hooks/` runtime hooks during the
October 18 migration. No APEX runtime hooks are currently provided in that
checkout. Do not restore the deleted directory or introduce replacement hooks.
This decision does not certify the proposed runtime or its permission boundaries.
:::

This page records what was retired and preserves published heading anchors.
It is not a hook installation or recovery guide. The site's generated product
metadata has a separate older source pin and may still describe historical hooks.

:::note[Git hooks vs. Agent hooks]
APEX runtime hooks ran during agent sessions. Git Lefthook, pre-commit,
pre-push, commit-message checks, secret scanning, and CI are separate tooling.
They are not retired by this decision. For their configured coverage, see the
[Validation & Linting Reference](../../reference/validation-reference/).
:::

## How hooks work

Historically, a `PreToolUse` hook evaluated a tool call before execution and could
deny it. `SubagentStop` ran an advisory output check. Those APEX checks no longer
run after the directory's deletion. Native tool restrictions are not automatically
equivalent to the old regex guard. Verify native permissions before relying on them.

## Hook inventory

This is a historical inventory, not a list of installed or required hooks.

| Retired directory      | Former event | Former purpose                              | Former timeout |
| :--------------------- | :----------- | :------------------------------------------ | ------: |
| `tool-guardian/`       | PreToolUse   | Block dangerous terminal commands           |     10s |
| `subagent-validation/` | SubagentStop | Validate subagent output quality (advisory) |     15s |

Earlier `secrets-scanner`, `session-telemetry`, and `tool-audit` hooks had already
been removed. The first duplicated gitleaks; the latter two only wrote logs that
nothing consumed. This history does not authorize restoring any of them.

## Configuration

Do not register the deleted APEX hooks in `.vscode/settings.json`, the dev container,
or agent frontmatter. Stale caller and validation references belong to the source
retirement change. This docs update does not verify their removal.

### Agent-scoped hooks

Moving a deleted hook into `.agent.md` frontmatter would reintroduce it. The owner
did not authorize that workaround. Native roles and tool allowlists must be checked
on their own; they do not by themselves isolate credentials or Azure authority.

## Safety considerations

The underlying Azure security, live governance, SKU, AVM, cost-provenance, and
approval requirements survive runtime-hook retirement. Real-Azure deployment and
E2E are authorized in principle only. The exact tenant, subscription, resource
boundary, budget, and action scope remain unestablished. No cloud action may
proceed until that scope is established. Cleanup is not authorized.

Native Autopilot cannot supply genuine owner signoff. An unavailable owner answer
does not approve anything. Neither hook deletion nor passing documentation checks
accepts the pilot, approval boundary, or full migration.

### Self-modification protection

The deleted `PreToolUse` guard checked file-edit paths under `.github/hooks/`,
including resolved symlinks and traversal. That hook-based self-modification
protection is gone. Do not describe it as active.

### Command precision (low false-positive rate)

The retired guard used anchored regex patterns for selected destructive commands.
Those pattern checks no longer run. Native tool restrictions have not been shown
to reproduce their command-level coverage, and this guide makes no equivalent
protection claim.

### Timeout enforcement

The former hooks declared timeouts. Their absence is not a passing timeout or
safety check. No replacement timeout mechanism is established here.

### Bounded logging

The deleted guard used a rotating JSONL audit log. That hook audit trail no longer
exists for new calls. Optional native session telemetry is a separate measurement
source, not a replacement enforcement mechanism or proof of human approval.

### Secret scanning (handled by gitleaks, not a hook)

Gitleaks at the Git pre-commit layer is unrelated to the retired APEX runtime
hooks. Preserve that tooling and inspect its actual installed configuration.
The documented product scan soft-skips locally when gitleaks is missing and is
not run in CI. A commit made outside its configured execution path is not proof
of a scan. Do not bypass Git hooks to work around runtime-hook retirement.

## Hook directory structure

The historical `.github/hooks/{name}/` directories held an event-binding
`hooks.json` and a shell script. The owner deleted the runtime-hook directory;
this layout is not a setup requirement.

### Shared library

The former `.github/hooks/lib/common.sh` supplied shared JSON, logging, timestamp,
and allowlist helpers. It is retired with the directory.

### Hooks.JSON schema

Historical `hooks.json` files bound lifecycle events to shell commands and
timeouts. No APEX runtime-hook configuration is currently provided in the
migration checkout.

### Script conventions

The removed shell scripts read JSON from stdin and returned JSON decisions.
Their historical conventions do not require replacement scripts.

## Validation

`validate:hooks` and `test:hooks` were product commands for the old implementation.
Do not recreate deleted files to satisfy them. Product maintainers own retirement
of stale callers, settings, and tests; this documentation does not certify that
source phase as complete. Preserve unrelated validators and Git checks.

## Adding a new hook

This heading remains for existing links. Adding a runtime hook is not part of
the authorized migration. The former creation instructions have been retired.

### 1. Create the hook directory and script

Do not recreate `.github/hooks/` or a substitute directory.

### 2. Create hooks.JSON

Do not introduce replacement event bindings.

### 3. Register in VS Code settings

Do not register deleted paths to match older examples or generated metadata.

### 4. Add tests and validate

Keep retirement tests and unrelated quality checks separate. A source validator
passing does not prove native permission or pilot acceptance.

### Best practices

Record lost protection honestly. Do not hide it behind a tool allowlist, an
Autopilot response, or a source-check result.

## Troubleshooting

### Hook not firing

In the migration checkout, the owner deleted these hooks intentionally. Their
absence is not a discovery error to repair by restoring files. Diagnose stale
callers in the product retirement change without disabling unrelated tooling.

### Hook timeout

An old timeout or success log is historical evidence only. It does not establish
protection for a current tool call.

### Manual testing

Do not reconstruct or exercise a deleted hook as a migration prerequisite.
Native permission checks require their own bounded, authorized evidence.

## Relationship to git hooks

| Mechanism | Current migration status | Coverage limit |
|---|---|---|
| APEX `.github/hooks/` runtime hooks | Intentionally deleted; no replacements | Former tool-call checks and hook logging are gone. |
| Git hooks through `lefthook.yml` | Not retired by this decision | Only configured commit and push operations are checked. |
| Gitleaks and CI | Not retired by this decision | Verify installed tools and actual job scope. |
| azd hooks in `azure.yaml` | Separate application lifecycle mechanism | Review against the approved Azure action scope; runtime-hook deletion grants no cloud permission. |

## Related

- [Quickstart](../../getting-started/quickstart/). install and run your first project
- [Workflow](../../concepts/workflow/). how agents collaborate across steps
- [Troubleshooting](../troubleshooting/). diagnose failed deploys
