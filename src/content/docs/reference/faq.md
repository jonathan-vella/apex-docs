---
title: "FAQ"
description: "Answers about APEX setup, workflow ownership, IaC tracks, customization, and recovery."
---

## General

### How do i start?

Create a repository from
[apex-accelerator](https://github.com/jonathan-vella/apex-accelerator)
and follow the [quickstart](/getting-started/quickstart/).
APEX owns the product. This apex-docs repository owns the published site.

### Is generated code ready for production?

Not by generation alone. Review requirements, architecture, policy, the implementation
plan, generated code, and the actual deployment preview. Complete the required checks
for your environment. Record application health separately from resource provisioning.
The [historical case study](/demo/) shows why that distinction matters.

### Which Copilot plan and model do i need?

Use a Copilot plan and organization configuration that provide the required custom
agent and model access. Model declarations are in `.github/agents/*.agent.md`.
They do not grant access to a model. Check your actual entitlement and
[GitHub's plan comparison](https://github.com/features/copilot/plans).
This site does not require Business or Enterprise by assertion.

### Do i need Azure access?

You can explore prompts and draft requirements without a subscription. Public retail
pricing does not require scoped cost-management access. Effective policy discovery,
target-specific validation, deployment, and live diagnostics require appropriate
Azure access. Offline drafts are not fully verified deployment inputs.

## IaC tracks

### Should i choose Bicep or Terraform?

Bicep is Azure's resource-definition language and uses ARM-managed deployment state.
Terraform uses providers and a state backend. Choose according to your team's
operating model and governance requirements.

Requirements records `iac_tool` as `Bicep` or `Terraform`. Both tracks use
`05-IaC Planner`. CodeGen and Deploy have track-specific main agents, which the
owner selects. See the [workflow](/concepts/workflow/).

### Can i change tracks later?

Treat it as a requirements change. Record the decision through the owning agent,
review affected architecture and module choices, then regenerate the plan, contracts,
code, and handoff as needed. Do not change one field and assume every prior approval
remains valid. Existing Terraform state or deployed resources need an explicit
migration plan.

## Usage

### Does APEX work offline?

Copilot requires network access. Tool calls also depend on their service endpoints.
You can read local files offline, but missing pricing, policy, or validation evidence
must remain missing. Do not substitute remembered prices or call unavailable checks
successful.

### What is the difference between an agent and a skill?

A main agent owns a workflow step and its handoffs. A skill contains reusable
instructions and references. Invocation flags control how a skill may be selected.
Neither a skill nor source metadata grants additional tools or permissions.

See [agents](/concepts/how-it-works/agents/) and
[skills and instructions](/concepts/how-it-works/skills-and-instructions/).

### How do i resume?

Select `01-Orchestrator`, name the project, and ask it to inspect current state
and artifacts. It recommends the next handoff; you select the main agent.
Use [session state debugging](/guides/session-debugging/) for corruption,
conflicts, stale indexes, or authorized recovery.

### Is there a hands-on exercise?

The [MicroHack](https://microhack.apexops.pro/) is a separate learning resource.
Check its environment requirements and revision before following deployment steps.
The April 2026 case study on this site is a historical record, not a current
copy-and-run tutorial.

## Customization & multi-project

### How do i customize an accelerator repository?

A repository created from the template belongs to you. Inspect its current sync
workflow before editing files you want to retain.

At the reviewed template revision, scheduled upstream sync proposes a pull request.
Manual runs default to dry-run. The sync mirrors upstream content except for
declared exclusions, shared-file exceptions, and seed rules. It does not merge
local edits into upstream-owned files automatically.

Both generated Bicep and Terraform project directories are excluded, but their
shared `AGENTS.md` files are explicit sync exceptions. Workflow files remain
separate and use `npm run sync:workflows`. Root `AGENTS.md`, agents, skills,
and instructions are not generally protected customization locations.

Read the actual
[sync configuration](https://github.com/jonathan-vella/apex-accelerator/blob/a77442889129b26a2a89c0d5faa5f1d35a84965c/.github/workflows/weekly-upstream-sync.yml)
and review each proposed diff. Do not rely on an old four-path exclusion list.

### Can one repository contain multiple projects?

Yes. Project artifacts live under `agent-output/{project}/`, and generated IaC
lives under the matching track's project directory. These projects share agents,
skills, and container configuration. Separate repositories provide separate
permissions, lifecycle, and tooling configuration when your team needs them.

## Troubleshooting

### Why does orchestrator not delegate to the next main agent?

That is intentional. The current main-agent workflow requires human selection,
including selection of `10-Challenger`. Do not add wildcard delegation permissions
to restore obsolete behavior.

### What if an agent produces incorrect output?

Provide the exact error, affected artifact, and expected behavior to the owning
step. A deployment agent must return code defects to CodeGen. Preserve required
reviews after changes. Starting a new chat does not make stale approvals current.

### What if MCP is unavailable?

Identify the failed server and required evidence. Work that does not depend on it
may continue, but affected checks remain blocked or unperformed. Cost estimates
must not substitute invented prices. Azure CLI authentication for governance is
separate from pricing-tool availability.

### Where do i report problems?

Use [APEX issues](https://github.com/jonathan-vella/apex/issues) for product defects
and [apex-docs issues](https://github.com/jonathan-vella/apex-docs/issues) for site
problems. Include the revision, failing command or agent, and redacted evidence.
See [troubleshooting](/guides/troubleshooting/) for diagnosis.
