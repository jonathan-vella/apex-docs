---
title: "Step 3: Design artifacts, optional"
description: "Generate reproducible Python architecture diagrams and WAF-mapped Architecture Decision Records with 04-Design."
sidebar:
  order: 3
  label: "Step 3: Design, optional"
---

## Purpose

Generate code-based Azure architecture diagrams and Architecture Decision Records (`ADR`s) for the approved Step 2 design, keeping the Python diagram source alongside rendered PNG and SVG outputs.

In the delivery workflow, Step 3 is optional. If visual diagrams and ADRs are not needed, transition directly from Step 2 to Step 3.5 Governance. In a standalone WAF assessment, `01-Orchestrator` invokes `04-Design` automatically to render the existing-state topology diagram (`assets/03-des-diagram.{py,png,svg}`).

## Agent

[`04-Design`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/04-design.agent.md) loads [`apex-python-diagrams`](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-python-diagrams/SKILL.md) and [`apex-azure-adr`](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-adr/SKILL.md).

## Invocation

```text
Select: 01-Orchestrator or 04-Design in Copilot Chat
Output: agent-output/{project}/03-des-diagram.py + .png + .svg
        agent-output/{project}/03-des-adr-*.md
```

## Artifact types

| Artifact | Skill | Purpose |
| --- | --- | --- |
| Architecture diagram | `apex-python-diagrams` | Editable SVG and high-resolution PNG Azure topology view |
| Runtime-flow diagram | `apex-python-diagrams` | Synchronous request paths and asynchronous messaging flows |
| Dependency diagram | `apex-python-diagrams` | Provisioning order across foundational and workload resources |
| Architecture Decision Record | `apex-azure-adr` | WAF-mapped trade-off analysis, rejected alternatives, and consequences |

## Review

Challenger review on Step 3 ADRs is opt-in. When requested, `04-Design` or `01-Orchestrator` runs a `comprehensive` review via `challenger-review-subagent` (or you can invoke `10-Challenger` manually).

## Hand-off

Once the diagrams and ADRs are approved, advance to [Step 3.5: Governance](/concepts/workflow/step-3-5/).

## See also

- [CoE modernization archetype: design and ADRs](/showcases/coe-archetype/design-and-adrs/)
- [`apex-python-diagrams` skill](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-python-diagrams/SKILL.md)
- [`apex-azure-adr` skill](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-adr/SKILL.md)
