---
title: "System architecture"
description: "How APEX connects human-selected agents, artifact contracts, validation, and Azure deployment."
---

## The multi-step workflow

APEX separates requirements, architecture, governance, planning, code generation,
deployment, and as-built documentation. Design artifacts are optional. Each main
agent owns a task and produces files for the next step.

The [workflow overview](/concepts/workflow/) is the canonical reader guide for
step owners, outputs, and review defaults. The product's
[workflow graph](https://github.com/jonathan-vella/apex/blob/a656e66d83cfae8d525ce0d2012b124599b37252/.github/skills/apex-workflow-engine/templates/workflow-graph.json)
defines the dependencies.

| Part | Responsibility | Limit |
|---|---|---|
| Human operator | Select main agents, resolve decisions, approve scope and deployment | A request to validate is not permission to apply. |
| Main agent | Perform its step and produce the required evidence | It cannot bypass prerequisites or replace another main agent through nested delegation. |
| Skill | Supply task-specific procedures and reference material | It does not grant tools, change models, or authorize work. |
| Helper subagent | Perform a bounded task permitted by its parent | It does not own the main workflow. |
| `apex-recall` | Read and update project state through its supported commands | State is not a substitute for current artifacts or approval. |
| Validators and hooks | Check the contracts they implement | Passing checks do not prove every requirement or establish application health. |

## The orchestrator pattern

`01-Orchestrator` identifies the current step, required inputs, and next main agent.
It offers a human handoff. It does not invoke Requirements, Architect, Challenger,
or the other main agents through `#runSubagent`.

Artifacts under `agent-output/{project}/` provide durable context. The handoff
must identify the relevant files, unresolved findings, and intended next action.
When starting a new chat, read current state and evidence rather than relying on
a stale conversation summary.

Model choices and tool declarations live in agent frontmatter. Consult the
[pinned Explorer](/reference/architecture-explorer/) or source files instead of
copying a model roster into deployment instructions. Source declarations do not
prove that an account can use a model or that every client supports the same behavior.

## Dual IaC tracks

Requirements, Architect, Design, Governance, and `05-IaC Planner` are shared.
The planner uses the project's selected IaC track. CodeGen and Deploy have
separate Bicep and Terraform agents.

| Track | Code generation | Deployment |
|---|---|---|
| Bicep | `06b-Bicep CodeGen` | `07b-Bicep Deploy` |
| Terraform | `06t-Terraform CodeGen` | `07t-Terraform Deploy` |

Both tracks consume approved planning and governance evidence and produce an
IaC handoff. Do not switch tracks by renaming an output directory or editing a
state field to skip planning.

Read [agents](/concepts/how-it-works/agents/) for invocation boundaries,
[workflow state](/concepts/how-it-works/workflow-engine/) for recovery, and
[MCP integration](/concepts/how-it-works/mcp-integration/) for external tools.
