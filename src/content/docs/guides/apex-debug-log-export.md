---
title: "Debug log export"
description: "Review the proposed native Copilot SDK log export, explicit session selection, and sharing limits."
sidebar:
  order: 9
---

The proposed `/apex-debug-log-export` skill bundles selected native Copilot SDK
events into `.apex-logs/` for inspection. It never uploads the archive. Review
its contents before sharing it with an authorized recipient.

:::caution[Candidate procedure, not accepted runtime evidence]
This guide follows [APEX PR #779](https://github.com/jonathan-vella/apex/pull/779)
at [`a315279`](https://github.com/jonathan-vella/apex/tree/a315279aa5d09bfc7657c14536c1776cadcd6069).
APEX main reverted the earlier cutover. The candidate
[entry skill](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/skills/apex-debug-log-export/SKILL.md)
and [export procedure](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/skills/apex-context-management/references/debug-log-export.md)
are proposed, not released. Native export and smoke acceptance remain unverified
here. Log analysis does not verify live pricing, human approval, deployment, or cleanup.
:::

<span id="how-debug-logs-are-enabled"></span>

## Native Copilot SDK session logs

The candidate uses native session events at:

```text
~/.copilot/session-state/<sessionId>/events.jsonl
```

The candidate package declares these analysis commands. Run them from the
candidate APEX checkout, not apex-docs, after selecting the actual session path:

```bash
npm run profile:debug-log -- ~/.copilot/session-state/<sessionId>/events.jsonl --json
npm run smoke:verify -- ~/.copilot/session-state/<sessionId>/events.jsonl --strict
npm run validate:review-ceiling -- --budget ~/.copilot/session-state/<sessionId>/events.jsonl --strict
```

These commands inspect captured events. A passing result covers only the checks
and evidence present in that capture, not missing acceptance scenarios or authority.

## Legacy Local debug logs

Historical Local exports used this path and often included `main.jsonl`:

```text
~/.vscode-server/data/User/workspaceStorage/<wsId>/GitHub.copilot-chat/debug-logs/<sessionId>/
```

The old Local adapter used `$VSCODE_TARGET_SESSION_LOG`; the separate
`apex-host-debug-log-export` entry belonged to the older Host procedure.
Neither is the candidate native entry point. Do not use Local variables,
`workspaceStorage`, or an assumed newest session to select native SDK logs.
The legacy file-logging setting is not a prerequisite for this native procedure.

## What the bundle contains

The proposed native archive contains selected redacted event copies and a
`MANIFEST.json` with source session IDs, capture options, file sizes, and hashes.
Raw events are excluded by default. Workspace text logs under `logs/copilot/`
and a transcript inside a selected session require explicit opt-in.
Source logs remain unchanged.

## How custom-agent lines are filtered

Historical Local exports used `*.custom-agents.jsonl` filters over `main.jsonl`
based on agent paths, registry names, skills, instructions, and `apex-recall`.
That filename is not the candidate native archive contract.

Native discovery matches `session.start.data.context.gitRoot` or exact `cwd`
to the workspace. The user then selects explicit session IDs. A title match,
model label, or recently modified directory does not establish session scope.

## Running the prompt

The historical heading remains for existing links. The candidate entry is a
skill, not the archived Local prompt. Its declared prerequisites are the
built-in `agent` owner and `MAI-Code-1.1-Flash`, with `ask_user`, execution, and
read access. These are manual-entry requirements, separate from the proposed
unpinned production-agent policy. Stop if the prerequisites cannot be verified;
the skill cannot select a model or broaden permissions.

In Copilot Chat, invoke:

```text
/apex-debug-log-export
```

The proposed skill will:

1. List native sessions that match the workspace identity.
2. Ask for explicit session IDs and capture choices in one form.
3. Default to best-effort redaction, with raw events and workspace logs excluded.
4. Include optional sources only after consent.
5. Write the manifest and archive under `.apex-logs/`.
6. Report the archive path and sharing limits without uploading it.

Decline is not consent. Cancellation, an empty selection, unknown workspace
identity, or malformed events must not produce a success claim.
The proposed exporter ignores `.apex-logs/` in Git.

## Moving the archive to OneDrive

### VS Code explorer

1. In the VS Code Explorer, expand `.apex-logs/`.
2. Right-click the generated `.tar.gz` file and select **Download...**.
3. Save the archive locally.
4. Open the OneDrive for Business share link in your browser.
5. Drag the archive into the browser window.

### Docker copy

From a local terminal outside the dev container:

```bash
docker ps --format '{{.Names}}'
ARCHIVE="/workspaces/<repository>/.apex-logs/<bundle>.tar.gz"
docker cp <container-name>:"$ARCHIVE" ~/Downloads/
```

Replace the path with the archive's actual absolute container path. Inspect
the copied file before uploading it to an explicitly authorized destination.

## Before uploading

:::caution[Review sensitive content]
Best-effort redaction is not a safe-to-share guarantee. Raw native events require
explicit opt-in and may contain prompts, code, or secrets. Historical Local
archives may contain an unmodified raw `main.jsonl`. Inspect every archive before
sharing it, including its manifest and any optional files.
:::

## Related

- [Dev container hygiene](../devcontainer-hygiene/). Reduce context bloat
  before running agents
- [Session debugging](../session-debugging/). Diagnose workflow state and
  resume issues
- [Repository slash prompts](/reference/prompts/repository-prompts/). Understand
  historical prompt entries and their limits.
