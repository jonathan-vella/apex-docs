---
title: "System architecture"
description: "How APEX connects human-selected agents, artifact contracts, MCP servers, validation, and Azure workflows."
---

## The multi-step workflow

APEX supports two workflow profiles defined in the machine-readable [workflow graph](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills/apex-workflow-engine/templates/workflow-graph.json):

- **Infrastructure delivery.** Separates requirements, architecture, optional design, governance discovery, IaC planning, Bicep or Terraform generation, deployment, and as-built documentation behind explicit human approval gates.
- **Standalone WAF assessment (`workflow_mode=assessment`).** Evaluates existing Azure subscriptions, local IaC, or both after upfront scope approval, producing a five-pillar WAF report, existing-state diagram, Cost Management report with visual charts, and prioritized action register with one final acceptance gate.

See the [workflow overview](/concepts/workflow/) for step owners, outputs, and review rules.

| Layer | Responsibility | Boundary |
|---|---|---|
| Human operator | Select main agents, answer material questions, approve stage gates and deployments | Requesting validation or a preview never authorizes deployment. |
| Main agent | Own domain artifacts and phase checkpoints | Cannot bypass gates; delegated workers return `USER_INPUT_REQUIRED` or `REVIEW_REQUIRED` to their parent. |
| Skill | Provide on-demand procedures, scripts, references, and templates | Inherits caller model and tools without granting permissions. |
| Leaf subagent | Execute stateless pricing, lint, preview, policy-precheck, or review tasks | Never prompts the user or delegates further. |
| Workspace MCP (`.mcp.json`) | Expose `github` MCP and stdio `azure-mcp` (`@azure/mcp@3.0.0`) | Server availability does not authorize cloud mutations. |
| `apex-recall` | Persist session state, decisions, review audits, and gate readiness | State records never replace reviewed artifacts or human approval. |
| Validators and Git Lefthook | Enforce schemas, security baselines, and contract consistency | Runtime `.github/hooks/` chat hooks remain [retired](/concepts/how-it-works/workflow-engine/#copilot-hooks). |

## The orchestrator pattern

`01-Orchestrator` reads `apex-recall` state, identifies required inputs, and dispatches authorized step workers through native tasks in the VS Code **Copilot** session target. Operators can also select interactive step agents (`02-Requirements`, `03-Architect`, `04-Design`, `04g-Governance`) directly.

Active agent definitions omit UI `handoffs:` buttons and fixed model or reasoning-effort pins:

- Model selection is controlled by the operator and VS Code Copilot runtime (including Auto and HydraFusion). Consult the [Architecture Explorer](/reference/architecture-explorer/) for agent and skill relationships.
- Durable context travels through `agent-output/{project}/` files and `00-handoff.md`. When opening a new chat session, `apex-recall handoff <project> --json` reconstructs the exact checkpoint, frozen inputs, and blocked prerequisites.
- Independent reviews run synchronously through `challenger-review-subagent` and `record-review.mjs` before human stage approvals. See [agent architecture](/concepts/how-it-works/agents/).

## Dual IaC tracks

In the delivery workflow, Requirements, Architecture, Design, Governance, and `05-IaC Planner` are shared across both IaC languages. `05-IaC Planner` reads `decisions.iac_tool` (`bicep` or `terraform`) to emit track-appropriate contracts, and Steps 5 and 6 dispatch the matching CodeGen and Deploy agents:

| Track | Code generation | Deployment |
|---|---|---|
| Bicep | `06b-Bicep CodeGen` | `07b-Bicep Deploy` |
| Terraform | `06t-Terraform CodeGen` | `07t-Terraform Deploy` |

Both tracks consume the approved `04-iac-contract.json`, `04-policy-property-map.json`, and `04-environment-manifest.json` artifacts and emit `05-iac-handoff.json`. Never switch IaC tracks mid-run by editing directories or state fields without re-running `05-IaC Planner`.

Read [agent architecture](/concepts/how-it-works/agents/) for delegation rules, [workflow engine](/concepts/how-it-works/workflow-engine/) for `apex-recall` state transitions, and [MCP integration](/concepts/how-it-works/mcp-integration/) for `.mcp.json` configuration.
