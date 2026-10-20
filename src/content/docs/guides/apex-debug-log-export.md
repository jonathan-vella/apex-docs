---
title: "Debug log export"
description: "Review the earlier native log-export candidate and distinguish authorized VS Code migration work from accepted runtime evidence."
sidebar:
  order: 9
---

The earlier `/apex-debug-log-export` candidate describes a bundle of selected
native Copilot SDK events under `.apex-logs/`. It does not upload the archive.
This page preserves that candidate procedure for review, not as accepted target
behavior. The owner has authorized migration execution and evidence-based packet
progression, but has not accepted the proposed lead, skills, or runtime pilot.
Inspect any archive before sharing it with an authorized recipient.

:::caution[Candidate procedure, not accepted runtime evidence]
The earlier implementation in [APEX PR #779](https://github.com/jonathan-vella/apex/pull/779)
at [`a315279`](https://github.com/jonathan-vella/apex/tree/a315279aa5d09bfc7657c14536c1776cadcd6069)
is not the approved target. Its
[entry skill](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/skills/apex-debug-log-export/SKILL.md)
and [export procedure](https://github.com/jonathan-vella/apex/blob/a315279aa5d09bfc7657c14536c1776cadcd6069/.github/skills/apex-context-management/references/debug-log-export.md)
are not released. Owner execution authorization on October 18 supersedes the
earlier `PLAN_THEN_APPROVE` hold; it does not certify these commands or any runtime
result. Real-Azure deployment and E2E are authorized in principle only, with no
exact tenant, subscription, resource boundary, budget, or action scope established.
That scope must be established before cloud execution. Cleanup is not authorized.
Prior READY and synthetic shutdown evidence remains withdrawn; no runtime pilot
or deployment acceptance is established. Log analysis does not verify live
pricing, genuine human approval, deployment, or cleanup.
:::

## Optional measurement and runtime scope

The proposed target supports only the Copilot session target, Copilot SDK/Agent
Host, inside VS Code. A native event format or SDK command example does not offer
CLI, Local, cloud-agent, or other IDE product runtime support. Historical readers
remain available.

The [migration planning section](/concepts/how-it-works/agents/#proposed-simplification-and-planning-gate)
links to the current PRD and delivery gates. Telemetry is optional contextual
measurement. The owner-reported current body migration removes worker-ready
handshakes, nonce exchanges, mandatory verifier commands, and log preflight from
active bodies and shared caller guidance. Retained event readers and old
verifiers are historical diagnostics, not routine execution prerequisites.
That source change does not certify the representative no-cloud pilot or
replacement permission boundaries. Independent production review receipts,
`record-review` attribution, and freshness validation are still required.

APEX `.github/hooks/` runtime hooks were intentionally deleted. No runtime hooks
are currently provided in the migration checkout, and hook audit logging is no
longer available. Do not recreate hooks to collect telemetry or restore the old
regex guard. Native session events do not replace that protection. Verify native
permission boundaries separately; underlying Azure requirements still apply.
Git Lefthook and pre-commit security checks are unrelated to this retirement.

Treat missing usage as `UNKNOWN`, not zero. Record capture scope and limitations
beside any measurements. There is no established token, cost, or latency saving.
Passing a source validator or log analyzer does not establish native runtime
end-to-end acceptance. A successful `ask_user` event may record an Autopilot
answer; neither it nor an unattended environment flag proves independent human
approval or native Autopilot selection.

<span id="how-debug-logs-are-enabled"></span>

## Native Copilot SDK session logs

The candidate uses native session events at:

```text
~/.copilot/session-state/<sessionId>/events.jsonl
```

The earlier candidate package declares these analysis commands. They are retained
as candidate examples, not verified target behavior or pilot instructions. Their
context is that candidate APEX checkout, not apex-docs, with an explicitly selected
session path:

```bash
npm run profile:debug-log -- ~/.copilot/session-state/<sessionId>/events.jsonl --json
npm run smoke:verify -- ~/.copilot/session-state/<sessionId>/events.jsonl --strict
npm run validate:review-ceiling -- --budget ~/.copilot/session-state/<sessionId>/events.jsonl --strict
```

These historical commands inspect captured events; they are not required worker
preflight in the current body migration. A passing result covers only the checks
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

The historical heading remains for existing links. The earlier candidate entry
is a skill, not the archived Local prompt. That revision declares the
built-in `agent` owner and `MAI-Code-1.1-Flash`, with `ask_user`, execution, and
read access, as manual-entry prerequisites. These are historical declarations,
not model or role requirements for the revised target. They are not evidence of
native acceptance. A skill cannot select a model or broaden permissions.

The earlier candidate's proposed Copilot Chat invocation was:

```text
/apex-debug-log-export
```

That candidate describes these steps, which this documentation update does not certify
as exercised native behavior:

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
