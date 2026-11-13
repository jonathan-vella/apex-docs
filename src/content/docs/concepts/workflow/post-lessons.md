---
title: "Post: Lessons learned"
description: "Record workflow failures and propose reviewed improvements to agents, skills, or validators."
sidebar:
  order: 9
  label: "Post: Lessons"
---

## Purpose

Record recurring review findings, governance gaps, differences between preview
and apply, and context failures. Preserve the evidence and propose a specific
correction. A lesson does not authorize an agent or skill change.

## Artifact

```text
Output: agent-output/{project}/09-lessons-learned.{json,md}
```

<span id="lesson-schema-subset"></span>

## Lesson schema subset

This illustrative excerpt shows key fields in `09-lessons-learned.json`; see `tools/schemas/lesson-log.schema.json` for the complete schema:

```json
{
  "step": 4,
  "phase": "phase_3_module_selection",
  "category": "factual-accuracy",
  "trigger": "challenger must_fix",
  "observation": "Planner pinned avm/res/storage/storage-account at a version that lacked the requireInfrastructureEncryption flag required by an inherited deny policy.",
  "root_cause": "AVM module-index lifecycle was Available but the version chosen predated the policy property.",
  "action": "Move policy-property-map.json check earlier in IaC Planner Phase 2, before module pinning.",
  "telemetry": { "iterations": 2, "wall_time_min": 18 }
}
```

## Loop closure

Review lessons before changing the product:

- Change an agent when its instructions caused the failure.
- Update a skill reference when the correction applies to other workloads.
- Add validator coverage when a deterministic check can detect the error.

See the [`11-Context
Optimizer`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/11-context-optimizer.agent.md)
agent for the audit-mode counterpart that mines Copilot debug logs.
