---
title: "Step 1: Requirements"
description: "Gather Azure platform-engineering requirements with the 02-Requirements agent."
sidebar:
  order: 1
  label: "Step 1: Requirements"
---

## Purpose

Capture the functional, non-functional, compliance, and budget constraints for a new Azure workload
through an interactive conversation. Step 1 also produces the empty `sku-manifest.{json,md}`
artifact that downstream steps mutate.

## Agent

[`02-Requirements`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/02-requirements.agent.md)

## Invocation

```text
Select: 02-Requirements in Copilot Chat
Output: agent-output/{project}/01-requirements.md
        agent-output/{project}/sku-manifest.{json,md} (rev 1)
```

## What gets captured

- What the workload must do.
- Performance, availability, security, and scale targets.
- Regulatory, organizational, and residency constraints.
- Monthly budget and cost limits.
- Any SKUs the owner has already selected.

## Review

One `comprehensive` review by `10-Challenger` is mandatory. Select the main
reviewer through its handoff, not a subagent call. Resolve required findings and
approve the requirements before Step 2.

## Hand-off

After approving the requirements, select the handoff to
[Step 2: Architecture](/concepts/workflow/step-2/).

## See also

- [Workflow overview](/concepts/workflow/)
- [Workflow deep dive](/concepts/workflow-deep-dive/)
- [Agent architecture](/concepts/how-it-works/agents/)
