---
title: "Repository Slash Prompts"
description: "Distinguish current Copilot entry guidance from historical Local and Host slash-prompt procedures."
sidebar:
  order: 4
---

The current migration targets Copilot inside VS Code. Select `01-Orchestrator`
to coordinate approved steps, or select a main agent directly. Requirements,
Architect, Design, and Governance retain native questions when directly selected.
Delegated main workers return `USER_INPUT_REQUIRED` to their interactive parent;
leaves never ask users or delegate.

Active definitions omit UI `handoffs:` metadata. Use a native task result or
explicit selection, with `00-handoff.md` as durable evidence. Worker-ready and
log-preflight rituals are no longer active entry requirements. Source migration
does not certify runtime enforcement or waive reviews and approvals. See the
[body migration and observed limits](/concepts/how-it-works/agents/#current-agent-body-migration).

## Prompt reference

The remaining sections preserve historical Local slash adapters and older Host
entries for existing links. Local prompts are archived, not current entry points.
Their command names, tool mappings, and UI behavior do not establish support in
the Copilot target. Use the selected agent's current instructions and actual
available tools rather than copying this historical procedure.

- `/apex-resume-workflow`: resumes an APEX workflow after `/clear`.
  Source: `.github/prompts/apex-resume-workflow.prompt.md`.
- `/apex-git-commit`: commits, pushes, and handles the PR handoff.
  Source: `.github/prompts/apex-git-commit.prompt.md`.
- `/apex-debug-log-export`: bundles Copilot debug logs for review.
  Source: `.github/prompts/apex-debug-log-export.prompt.md`.

## Resume workflow

The earlier Host procedure selected `01-Orchestrator` and used
`/apex-host-workflow-start resume [project]`. The `resume` operation was explicit;
it is not inferred from an empty request or failed recall. With no project supplied,
the procedure discovers candidates and asks only when selection is ambiguous.
That historical name is not the current entry contract. Local
`/apex-resume-workflow` is an archived adapter.

Use `/apex-resume-workflow` after `/clear` or whenever you need to re-enter an
existing APEX workflow without carrying old chat context forward.

The prompt is bound to `01-Orchestrator` and uses its canonical recovery procedure.
A supplied project is used directly; otherwise it selects a unique candidate or asks which project to resume.
The workflow graph and current evidence determine the next gate or handoff, not a separate next-step questionnaire.

### Resume behavior

- Lists candidate projects under `agent-output/`.
- Resolves a project from your answer or from the prompt argument.
- Uses `apex-recall show <project> --json` for state, with bounded artifact recovery when required evidence is missing.
- The historical adapter mapped the workflow node to an Orchestrator handoff button.
- The current migration instead uses native task results or explicit agent selection.

### Resume usage

Use the slash prompt, attach `tools/apex-prompts/workflow-prompts/00-resume-workflow.prompt.md`,
or send `resume <project>` to the selected Orchestrator. All use the same agent-owned procedure;
plain chat text does not invoke a prompt file automatically. Required approvals remain explicit.

### Resume boundaries

The historical adapter did not re-run completed steps by itself, change recorded
decisions, or call `#runSubagent`. This does not restrict the migrated
Orchestrator's approved native task dispatch. Neither route skips required gates.

## Git commit

The earlier Host procedure used `/apex-host-git-commit` with its required owner
and tools already selected. Commit and debug-log capture remain separate
operations, not workflow-start modes.

Use `/apex-git-commit` when you want the repository's standard commit workflow:
inspect scoped changes, stage allowed paths, create a conventional commit, push
the current branch, and decide what to do with the pull request.

### Commit behavior

- Computes pathspec exclusions for `agent-output/`, `infra/`, and the Sensei
  skill directory when applicable.
- Refuses to commit from `main`.
- Stages only the allowed paths.
- Generates a conventional commit message from the staged diff unless you pass a
  subject.
- Pushes the current branch.
- Checks whether an open pull request already exists for the branch.
- Asks whether to update an existing PR, create a new PR, or skip the PR step.

### Commit usage

Use this prompt after a focused code or documentation change when you want the
repo's commit exclusions and PR decision flow applied consistently.

### Commit boundaries

The prompt never force-pushes, never stages excluded infrastructure or
`agent-output/` artifacts, and keeps the pull-request action as the final human
confirmation gate.

## Debug log export

The earlier Host procedure used `/apex-host-debug-log-export` with confirmed
workspace and session paths. Do not substitute Local log variables for native
session paths. Skills inherit the caller's
model/tools and do not grant new permissions; unavailable prerequisites stop the operation.

Use `/apex-debug-log-export` when you need to package Copilot Chat debug logs
for review. It is especially useful when investigating custom-agent loading,
skill loading, tool behavior, latency, token use, or unexpected retries.

### Export behavior

- Enumerates debug-log sessions for the current workspace.
- Recommends the most recent non-active session by default.
- Lets you opt into older sessions, transcript JSONL, and workspace logs.
- Builds a custom-agent filter from `.github/agents/` and the agent registry.
- Writes filtered `*.custom-agents.jsonl` files.
- Redacts common secret patterns from filtered output.
- Creates a `.tar.gz` bundle under `.apex-logs/`.

### Export usage

Use this prompt before filing an upstream Copilot issue or asking another
maintainer to review an APEX agent session. The companion guide is
[Debug Log Export](/guides/apex-debug-log-export/).

### Export boundaries

The prompt does not upload anything. It preserves raw session logs for auditing,
so you should review the bundle before sharing it outside the repository team.

## Choosing the right prompt

The historical Host entries were manual-only. Source flags and static tests do
not establish native runtime support. The table below is historical; verify the
current selected agent and available entry skill in the Copilot target.

| Need                                        | Use                         |
| ------------------------------------------- | --------------------------- |
| Continue a workflow after a clean chat      | `/apex-resume-workflow`     |
| Commit current work with repository guards  | `/apex-git-commit`          |
| Share debug evidence for agent behavior     | `/apex-debug-log-export`    |

## Related

- [Prompt Guide](/guides/prompt-guide/). prompt patterns for agents and skills
- [Workflow Prompts](/reference/prompts/workflow-prompts/). examples for workflow agents
- [Debug Log Export](/guides/apex-debug-log-export/). export prompt operating guide
