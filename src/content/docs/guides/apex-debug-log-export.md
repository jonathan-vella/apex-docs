---
title: "Debug log export"
description: "Export redacted VS Code Copilot session logs under .apex-logs/ for workflow diagnostics and token profiling."
sidebar:
  order: 9
---

Use the `/apex-debug-log-export` skill ([`SKILL.md`](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills/apex-debug-log-export/SKILL.md) and [`debug-log-export.md`](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills/apex-context-management/references/debug-log-export.md)) to package selected VS Code **Copilot** session events into a local `.tar.gz` archive under `.apex-logs/` without uploading anything automatically.

## Scope and telemetry boundaries

APEX targets the **Copilot** session target inside VS Code:

- Active workflows require no pre-dispatch log preflight or `.github/hooks/` runtime hook logs; event exports are optional post-mortem diagnostics for `11-Context Optimizer` or bug reports.
- Missing token or timing fields in exported logs are reported as `UNKNOWN` rather than `0`.
- Passing a log profiler (`npm run profile:debug-log`) never substitutes for `record-review.mjs` Challenger provenance, Azure retail pricing evidence, or human deployment approval.

<span id="how-debug-logs-are-enabled"></span>

## Native Copilot SDK session logs

In the VS Code Copilot target, session events are written automatically to:

```text
~/.copilot/session-state/<sessionId>/events.jsonl
```

From an APEX workload repository root, contributors can inspect an explicitly selected session file with the read-only analysis scripts:

```bash
npm run profile:debug-log -- ~/.copilot/session-state/<sessionId>/events.jsonl --json
npm run smoke:verify -- ~/.copilot/session-state/<sessionId>/events.jsonl --strict
npm run validate:review-ceiling -- --budget ~/.copilot/session-state/<sessionId>/events.jsonl --strict
```

### Legacy Local debug logs

Older VS Code Local sessions wrote `main.jsonl` under `~/.vscode-server/data/User/workspaceStorage/<wsId>/GitHub.copilot-chat/debug-logs/<sessionId>/` and used retired `.github/prompts/apex-debug-log-export.prompt.md` or `apex-host-debug-log-export` wrappers. Current sessions use `/apex-debug-log-export` over `~/.copilot/session-state/`.

## What the bundle contains

Each `.apex-logs/` bundle contains redacted copies of the selected session events plus a `MANIFEST.json` recording session IDs, capture options, byte sizes, and SHA-256 hashes. Raw unredacted events and optional `logs/copilot/` workspace logs are excluded unless you opt in explicitly, and `.apex-logs/` is ignored by Git.

## How custom-agent lines are filtered

`/apex-debug-log-export` matches native sessions whose `session.start.data.context.gitRoot` or `cwd` equals your current workspace, then presents matching session IDs so you choose the exact sessions to export rather than guessing from timestamps or chat titles.

## Running the prompt

In VS Code Copilot Chat, run the user-invocable skill:

```text
/apex-debug-log-export
```

The skill walks through six bounded steps:

1. Lists native sessions matching the current workspace root.
2. Presents one `ask_user` form to select session IDs and redaction options.
3. Applies best-effort secret and token redaction by default, excluding raw events unless explicitly requested.
4. Packages the selected records and `MANIFEST.json` into `.apex-logs/<bundle>.tar.gz`.
5. Reports the archive path and SHA-256 digest without uploading the file.
6. Stops cleanly if cancelled or if no matching workspace sessions exist.

## Moving the archive to OneDrive

### VS Code explorer

1. Expand `.apex-logs/` in the VS Code Explorer sidebar.
2. Right-click the generated `.tar.gz` archive and select **Download...**.
3. Save the file locally and inspect its contents before uploading to an approved share link.

### Docker copy

From a host terminal outside the dev container:

```bash
docker ps --format '{{.Names}}'
ARCHIVE="/workspaces/<repository>/.apex-logs/<bundle>.tar.gz"
docker cp <container-name>:"$ARCHIVE" ~/Downloads/
```

## Before uploading

:::caution[Inspect every archive before sharing]
Best-effort redaction does not guarantee that prompts, file excerpts, or custom strings are free of sensitive internal context. Always inspect `MANIFEST.json` and the archive contents locally before sharing with another engineer or attaching to an issue.
:::

## Related

- [Dev container hygiene](../devcontainer-hygiene/) for keeping Copilot Chat context lean
- [Session state debugging](../session-debugging/) for `apex-recall` recovery
- [Workflow prompts](/reference/prompts/workflow-prompts/) for active chat commands and skills
