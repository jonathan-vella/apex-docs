---
title: "FAQ"
description: "Answers about APEX setup, runtime-managed models, standalone WAF assessments, IaC tracks, and multi-project repositories."
---

## General

### How do I start?

Create a workload repository from [apex-accelerator](https://github.com/jonathan-vella/apex-accelerator) and follow the [quickstart](/getting-started/quickstart/), or copy a starter prompt from the [WAF assessment guide](/guides/waf-assessment/) to review an existing workload. `apex` owns the product agents, skills, and validators; `apex-docs` owns this documentation site.

### Can APEX assess an existing Azure workload without deploying anything?

Yes. Select `01-Orchestrator` in VS Code Copilot Chat and run `/waf-assess-existing` (`workflow_mode=assessment`). You can inspect live Azure subscriptions read-only (`Source: azure`), local Bicep/Terraform and diagrams with no Azure sign-in (`Source: iac`), or both (`Source: combined`). One run produces a five-pillar WAF report, an existing-state diagram, a Cost Management report with visual charts, and a prioritized Excel and Markdown action register, then terminates without entering Governance or deployment. See the [WAF assessment guide](/guides/waf-assessment/) and [WAF assessment showcase](/showcases/waf-assessment/).

### Is generated code ready for production?

Not from code generation alone. Review requirements, WAF and cost assessments, target-verified Azure Policy constraints, the Step 4 implementation plan, `validate:iac-security-baseline` results, and the live `what-if` or `terraform plan` preview before approving deployment. Verify resource provisioning and application health separately. Inspect the [CoE modernization archetype showcase](/showcases/coe-archetype/) for a complete artifact trail.

### Which Copilot plan and model do I need?

Use a GitHub Copilot individual or organization plan that enables VS Code Copilot Chat and custom agents; see [GitHub Copilot plans](https://github.com/features/copilot/plans). Active `.github/agents/*.agent.md` definitions intentionally omit fixed `model:` and `reasoning-effort:` pins so you and the VS Code Copilot runtime control model selection (including Auto and HydraFusion).

### Do I need Azure access to start?

It depends on your workflow mode:

- **No Azure sign-in needed:** Offline IaC WAF assessments (`Source: iac`), public retail pricing lookups (`pricing_get`), and Step 1 + Step 2 Architecture using shared ALZ Corp policy assumptions (`corp-policy-v1`).
- **Read-only `az login` needed:** Live Azure WAF assessments (`Source: azure` or `combined`, requiring `Reader` and `Cost Management Reader`) and interactive `04g-Governance` policy discovery (which is mandatory before completing Step 4 planning, CodeGen, and deployment).
- **Write access needed:** Step 6 deployments (`Contributor` or `Owner`) and CI/CD OIDC setup (`npm run setup`). See [Azure setup](/getting-started/azure-setup/).

## IaC tracks

### Should I choose Bicep or Terraform?

Choose Bicep for Azure-native declarative deployments with no external state file, or Terraform when your organization standardizes on HCL and remote state backends. Step 1 records `decisions.iac_tool` (`bicep` or `terraform`). Steps 1 through 4 (including `05-IaC Planner`) are shared, while Steps 5 and 6 use `06b-Bicep CodeGen` / `07b-Bicep Deploy` or `06t-Terraform CodeGen` / `07t-Terraform Deploy`.

### Can I change tracks later?

Treat switching tracks as an upstream decision change: reopen planning (`apex-recall start-step <project> 4 --force`), regenerate `04-*` contracts, CodeGen modules, and `05-iac-handoff.json`, and obtain fresh Plan approval. Existing Terraform state or deployed Azure resources require a separate migration plan.

## Usage

### Does APEX work offline?

VS Code Copilot Chat requires network connectivity to GitHub Copilot, and `azure-mcp` / Azure CLI calls require access to their respective public or Azure endpoints. When a pricing or policy endpoint is unreachable, APEX fails closed and records the blocker rather than guessing prices or assuming empty policy sets.

### What is the difference between an agent, a skill, and a subagent?

A main agent (`.github/agents/*.agent.md`) owns an interactive conversation, domain artifacts, and phase checkpoints. A skill (`.github/skills/apex-*/SKILL.md`) loads reusable procedures, scripts, and templates into the calling agent's context without changing permissions. A leaf subagent (`.github/agents/_subagents/*.agent.md`) runs one stateless validation, preview, pricing, or Challenger review task on behalf of its parent agent. See [agent architecture](/concepts/how-it-works/agents/) and [skills and instructions](/concepts/how-it-works/skills-and-instructions/).

### How do I resume an interrupted project?

Open a new VS Code Copilot Chat in the **Copilot** session target, select `01-Orchestrator`, and send `resume <project>` (or run `/apex-workflow-start resume <project>`). `01-Orchestrator` runs `apex-recall show <project> --json` and `apex-recall handoff <project> --json` to continue from the active step or assessment phase without repeating answered questions. See [session state debugging](/guides/session-debugging/).

### Is there a hands-on workshop?

Yes. The [APEX MicroHack](https://microhack.apexops.pro/) provides a guided multi-challenge workshop covering governance policies, architecture, Bicep/Terraform delivery, and live diagnostics. You can also browse completed reference runs in the [showcases](/showcases/).

## Customization & multi-project

### How do I customize an Accelerator repository?

Inspect [`.github/workflows/weekly-upstream-sync.yml`](https://github.com/jonathan-vella/apex-accelerator/blob/9e7432ca90a9db86e9f85f28d3afd6db78d97c19/.github/workflows/weekly-upstream-sync.yml) before editing upstream-managed framework files:

- Workload outputs under `agent-output/{project}/`, `infra/bicep/{project}/`, `infra/terraform/{project}/`, and private `.github/data/governance-policy-baseline.json.gz` are preserved in `EXCLUDE_PATHS`.
- Shared `infra/bicep/AGENTS.md`, `infra/terraform/AGENTS.md`, and `.github/data/alz-corp-policy-baseline.json.gz` are upstream-managed `SYNC_EXCEPTIONS`.
- Consumer workflows in `.github/workflows/` are updated intentionally via `npm run sync:workflows` (preview by default; pass `-- --apply --ref <commit-sha>` to write). See [Updating APEX](/guides/updating-apex/).

### Can one repository contain multiple projects?

Yes. Each workload uses its own isolated `agent-output/{project}/` and `infra/{bicep|terraform}/{project}/` directories (including per-project `azure.yaml` files rather than a repo-root `azure.yaml`). Use separate repositories when teams require distinct GitHub environment approvals or Azure OIDC identities.

## Troubleshooting

### Why do I not see handoff buttons or automatic deployment?

Active APEX agents omit UI `handoffs:` buttons by design. `01-Orchestrator` dispatches step workers through native tasks in the **Copilot** session target, runs `challenger-review-subagent` automatically for required reviews, and pauses at human approval gates before advancing stages or deploying resources. See [agent architecture](/concepts/how-it-works/agents/).

### What if an agent produces incorrect output?

Report the exact error or constraint mismatch to the owning step agent (for example, return IaC compilation errors to CodeGen or module conflicts to `05-IaC Planner`) and re-run affected validators and Challenger reviews after repair.

### What if an MCP server fails to start?

Verify workspace-root `.mcp.json` (`github` and `azure-mcp` at `@azure/mcp@3.0.0`), remove any deprecated `.vscode/mcp.json`, run `npm run lint:mcp-config`, and restart `azure-mcp` via **MCP: List Servers** in VS Code. Note that `azure-resource-manager-mcp` is retired; historical Cost Management queries use `az rest`.

### Where do I report problems?

Open product defects in [APEX issues](https://github.com/jonathan-vella/apex/issues) and documentation issues in [apex-docs issues](https://github.com/jonathan-vella/apex-docs/issues), attaching the repository commit SHA and redacted error output. See [troubleshooting](/guides/troubleshooting/).
