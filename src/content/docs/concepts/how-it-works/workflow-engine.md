---
title: "Workflow engine and validation"
description: "Understand step dependencies, human approvals, state recovery, and the limits of automated checks."
---

## Workflow engine

### The dag model

The [workflow graph](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/.github/skills/apex-workflow-engine/templates/workflow-graph.json)
defines the main steps, dependencies, output contracts, review defaults, and
return paths. It describes valid progression, not an autonomous scheduler.

Use [Run the workflow](/concepts/workflow/) for the reader-facing sequence.
Product changes to the graph, agent definitions, or skills require their own
review and validation. Editing project state is not a way to customize the graph.

### Gates and approval points

The human approves requirements, architecture and cost, governance constraints,
and the implementation plan. Code validation precedes deployment, and explicit
apply authorization is still required. After deployment, inspect the actual
resources and health checks before accepting the as-built record.

Review defaults differ by step. In particular, Architecture has a separate
cost-estimate review, Governance has reconciliation, and Deploy has no Challenger
review. See the [review matrix](/concepts/workflow/#adversarial-review-matrix).

If a gate fails, return to the owning step and resolve its evidence. A retained
artifact can still be stale after an upstream decision changes.

### IaC routing

Requirements records the chosen Bicep or Terraform track. Step 4 uses the shared
`05-IaC Planner`. Steps 5 and 6 select the matching CodeGen and Deploy agents.
Do not invent separate Step 4 agents or activate both tracks implicitly.

### Session state and resume

Use `apex-recall show <project> --json` to inspect state. It reads primary state
without restoring backups. Participating writers use locks and revision checks.
Primary replacement and index updates are separate operations, so a write can
commit while leaving the index stale.

The [public state contract](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/tools/apex-recall/docs/show-schema.md)
defines conflicts, idempotent retries, and authorized recovery. These mechanisms
do not lock arbitrary editors or guarantee a multi-file transaction.

### Session break protocol

Before starting a new chat, retain the handoff, current decisions, relevant
artifacts, and unresolved findings. Select the appropriate main agent in the
new session and inspect current evidence. Do not assume the old conversation
contains everything needed to resume safely.

For damaged state, follow [session recovery](/guides/session-debugging/).

## Quality and safety systems

### Validation scripts

Product validators check artifact structure, agent and skill definitions,
governance contracts, IaC, and source metadata. The
[validation reference](/reference/validation-reference/) identifies the relevant
commands. Use the product's `package.json` for its current command inventory.

The apex-docs build, link checks, and browser tests validate this website instead.
A passing website build is not an infrastructure validation result.

### Git hooks (pre-commit and pre-push)

The product uses lefthook to run checks on staged changes and before a push.
Read the configured hooks for their actual scope. Hooks are not proof that all
changes were scanned, especially when tools are missing or a commit bypasses hooks.

### Circuit breaker

Repeated failures should stop work and preserve diagnostic evidence. Follow the
owning agent's retry and escalation rules. Do not use a generic retry count or
waiting period as permission to repeat a failed cloud mutation.

Unavailable or empty review output does not satisfy a required review. Use the
declared recovery path and human handoff rather than inventing an inline approval.

### Context compression

The `apex-context-management` skill describes selective loading and summarization.
Read the necessary artifact sections and keep decision evidence available.
Do not describe estimated context percentages as measured runtime guarantees.

A short summary cannot replace the exact input coverage required by a validator
or reviewer. Skills and runtime artifact summaries serve different purposes.

### Copilot hooks

Agent hooks run at configured lifecycle events. The product's `tool-guardian`
and `subagent-validation` hooks cover specific checks; they are not a general
permission system. See [agent hooks](/guides/hooks/) for their configuration and
limitations.
