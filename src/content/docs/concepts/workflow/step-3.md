---
title: "Step 3: Design artifacts, optional"
description: "Create architecture diagrams and Architecture Decision Records before locking down governance."
sidebar:
  order: 3
  label: "Step 3: Design, optional"
---

## Purpose

Create architecture diagrams and decision records that explain the approved design.
Keep the diagram source with its rendered output.

Step 3 is optional. If the design is already documented, proceed to Step 3.5 Governance.

## Agent

[`04-Design`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/04-design.agent.md)
uses the
[`apex-python-diagrams`](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-python-diagrams/SKILL.md)
and
[`apex-azure-adr`](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-adr/SKILL.md)
skills.

## Invocation

```text
Select: 04-Design in Copilot Chat
Output: agent-output/{project}/03-des-diagram.py + .png + .svg
        agent-output/{project}/03-des-adr-*.md
```

## Artifact types

| Artifact            | Tooling                | Purpose                                            |
| ------------------- | ---------------------- | -------------------------------------------------- |
| Architecture diagram | apex-python-diagrams        | Reproducible Azure system view                     |
| Runtime-flow diagram | apex-python-diagrams        | Request paths and async messaging                  |
| Dependency diagram   | apex-python-diagrams        | Resource dependency tree                           |
| ADR                  | apex-azure-adr skill        | WAF-mapped decisions with alternatives             |

## Review

Review is opt-in. When requested, use a `comprehensive` review of the design
decision records through the `10-Challenger` handoff.

## Hand-off

Select [Step 3.5: Governance](/concepts/workflow/step-3-5/) when the design
artifacts are ready.

## See also

- [`apex-python-diagrams`
  skill](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-python-diagrams/SKILL.md)
- [`apex-azure-adr`
  skill](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-adr/SKILL.md)
