---
title: "Quickstart"
description: "Create an APEX project from the Accelerator template, open the Azure Linux 4 dev container, and start either infrastructure delivery or a standalone WAF assessment."
---

Start from the [APEX Accelerator template](https://github.com/jonathan-vella/apex-accelerator),
not the documentation repository. You will create a workload repository, open its development
container in VS Code, and start `01-Orchestrator` for either policy-compliant infrastructure delivery
or a standalone Well-Architected Framework assessment.

Docker Desktop dev containers are validated on x86-64 and ARM64, including Windows with WSL2,
and Linux hosts are supported. GitHub Codespaces is not separately validated. This walkthrough
does not deploy Azure resources.

If you already have an APEX project, read [Updating APEX](/guides/updating-apex/) to compare
your repository revision with this guidance before applying new instructions.

## Prerequisites

| Requirement | Check |
|---|---|
| GitHub account and Copilot access in VS Code | Confirm that VS Code Copilot Chat responds under your individual or organization plan. |
| VS Code with Dev Containers (plus WSL on Windows) | Open the repository from your Linux or WSL filesystem. |
| Running Docker-compatible engine | Use Docker Desktop with WSL2 integration enabled on Windows. |
| Git | Run `git --version` in your Linux or WSL terminal. |
| Mode-specific Azure access | Offline IaC assessment and shared-policy Architecture need no Azure sign-in. Live reads and deployments need scoped RBAC. |

Check [GitHub Copilot plan entitlements](https://docs.github.com/en/copilot/get-started/plans)
and your organization's model policy. Active APEX agent definitions do not pin fixed models;
the VS Code Copilot runtime and your picker selection control the active model.

A GitHub Personal Access Token is optional and never replaces Copilot sign-in or Azure
authentication. See [GitHub authentication](/getting-started/dev-containers/#step-4-github-authentication)
if the container cannot use your host credentials.

## Step 1: create your repository from the template

Open [apex-accelerator](https://github.com/jonathan-vella/apex-accelerator), select
**Use this template**, and create a repository under your account or organization.
Choose repository visibility to match your governance requirements. Using the template
creates a clean repository history rather than a fork.

## Step 2: clone and open

Clone the new repository inside your Linux or WSL filesystem. On Windows, do not clone
under `/mnt/c`.

```bash title="WSL or Linux terminal"
mkdir -p ~/src
cd ~/src
git clone https://github.com/YOUR-OWNER/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
```

:::caution[Microsoft employees: launch VS Code with CFS package feeds first]
Corporate devices must install container packages through Microsoft-approved feeds.
Before opening the repository or building the container, connect to the corporate network
or VPN, **fully exit all VS Code windows**, and run the host launcher from your checkout:

- Windows PowerShell: `.\.devcontainer\open-microsoft.ps1`
- Linux, macOS, or WSL: `bash .devcontainer/open-microsoft.sh`

Running the launcher inside an already-open VS Code terminal does not pass the feed
variables to Docker image builds. Everyone else can run `code .` directly. See
[Package sources](/getting-started/dev-containers/#package-sources).
:::

## Step 3: open in dev container

Open the command palette in VS Code (`F1` or `Ctrl+Shift+P`) and select
**Dev Containers: Reopen in Container**. Wait for the Azure Linux 4 container build
and `post-create.sh` script to finish, then check the terminal log for errors.

The container loads the workspace-root `.mcp.json` (`github` and `azure-mcp` at
`@azure/mcp@3.0.0`), CLI binaries, Python diagram libraries, and `apex-recall`.
See [dev container setup](/getting-started/dev-containers/).

Initialize repository metadata from the dev container terminal:

```bash title="Dev container terminal"
npm run init
```

Review the diff produced by `npm run init`. To inspect upstream GitHub Actions workflow
templates later, run `npm run sync:workflows` (which previews changes by default and only
writes files when passed `-- --apply --ref <commit-sha>`).

<span id="step-4-set-up-azure-optional"></span>

## Step 4: match Azure access to your workflow

APEX does not require subscription write access up front. Match Azure sign-in to the task
you intend to run:

| Workflow task | Required Azure access | Setup command |
|---|---|---|
| Standalone WAF assessment of local IaC (`Source: iac`) | None | No Azure sign-in required |
| Delivery Step 1 and Step 2 using shared ALZ Corp policy assumptions (`corp-policy-v1`) | None for early Architecture; target-verified policy reads required before Step 4 completion, CodeGen, and deployment | No Azure sign-in required to start |
| Live Azure WAF assessment (`Source: azure` or `combined`) or tenant-verified policy discovery (`04g-Governance`) | `Reader` and `Cost Management Reader` on target subscriptions (plus Management Group `Reader` for inherited policies) | `az login --tenant <TENANT_ID>` |
| Step 6 deployment (`07b-Bicep Deploy` / `07t-Terraform Deploy`) and GitHub Actions OIDC pipelines | `Contributor` or `Owner` on target subscriptions, plus Entra app registration for CI | `az login` or `npm run setup` |

Read [Azure setup](/getting-started/azure-setup/) before running `npm run setup`. That wizard
creates Microsoft Entra ID registrations, federated credentials, role assignments, and GitHub
repository environments.

<span id="step-5-configure-gh_token-for-the-dev-container"></span>

## Step 5: check GitHub authentication

If your work uses `gh` CLI commands for issues or pull requests, verify authentication inside
the container:

```bash title="Dev container terminal"
gh auth status
```

Git operations normally use credentials forwarded by VS Code from the host. If you supply an
optional `GH_TOKEN`, set it in the host environment before launching VS Code so
`${localEnv:GH_TOKEN}` resolves during container creation. Integrated terminal settings do not
populate `${localEnv:GH_TOKEN}`. Never commit tokens or paste secrets into chat.

## Step 6: verify setup

Run these checks in the dev container terminal:

```bash title="Dev container terminal"
git --version
az --version
bicep --version
terraform --version
pwsh --version
apex-recall --help
```

Tool versions confirm the container build succeeded; they do not verify cloud permissions.

<span id="step-7-enable-subagent-orchestration"></span>

## Step 7: understand how Copilot agents coordinate

APEX targets the **Copilot** session target inside VS Code. Select `01-Orchestrator` from the
agent picker to coordinate multi-step work, or select an interactive step owner (`02-Requirements`,
`03-Architect`, `04-Design`, or `04g-Governance`) directly.

Keep three runtime rules in mind:

- Active agent definitions omit UI `handoffs:` buttons and model pins. `01-Orchestrator`
  dispatches specialist workers through native tasks and records state in `apex-recall` and
  `agent-output/<project>/00-handoff.md`.
- When a delegated worker needs missing material answers, it returns `USER_INPUT_REQUIRED` to
  its interactive parent so you answer one validated question form. When a worker needs an
  independent review without nested task access, it returns `REVIEW_REQUIRED` so
  `01-Orchestrator` runs `challenger-review-subagent` automatically.
- Human approval gates remain mandatory before advancing delivery stages or executing Step 6
  deployments. See [agents and delegation](/concepts/how-it-works/agents/).

<span id="step-8-start-the-orchestrator"></span>

## Step 8: start your first workflow

<span id="option-a-orchestrator-recommended"></span>
<span id="option-b-direct-agent-invocation"></span>
<span id="quick-reference"></span>
<span id="orchestrator-orchestrated-workflow"></span>
<span id="direct-agent-invocation"></span>
<span id="skill-invocation"></span>

Open VS Code Copilot Chat, confirm the session target is **Copilot**, and select
`01-Orchestrator` from the agent picker. Pick one of the two starter prompts below.

### Path A: deliver new or modernized infrastructure

```text title="Copilot Chat (select agent: 01-Orchestrator)"
Start a new Azure delivery project named orders-api-dev.
Use Bicep in swedencentral for a Linux web API with Azure SQL Database.
Ask me for any missing availability, residency, policy-source, and budget inputs before drafting architecture.
Do not deploy anything.
```

You can also run `/apex-workflow-start` or select `02-Requirements` directly to capture
`01-requirements.md` and initial SKU pins first.

### Path B: assess an existing Azure or IaC workload

```text title="Copilot Chat (select agent: 01-Orchestrator)"
/waf-assess-existing
Project: checkout-iac-audit
Scenario: evidence_only
Source: iac
Visual charts: true
Action register: true

IaC and diagrams:
- Paths: infra/bicep/checkout/
```

For live Azure subscriptions or guided `requirements_led` target discovery, copy the full
variable-based prompt from the [WAF assessment guide](/guides/waf-assessment/).

## Step 9: follow the workflow

In the delivery workflow, `01-Orchestrator` guides each step through independent
`challenger-review-subagent` checks and waits for your explicit approval before advancing.
In a standalone WAF assessment, `01-Orchestrator` confirms scope once, runs evidence
collection, 5-pillar WAF scoring, existing-state diagram generation, Cost Management reporting,
and dual independent reviews automatically, then presents the completed bundle for acceptance.

### What you've created

Every project writes auditable Markdown reports, JSON contracts, diagrams, and review sidecars
under `agent-output/<project>/`. Inspect real examples in the [showcases](/showcases/) before
running your own workload.

### If a step fails

Preserve the terminal or chat error output and check [troubleshooting](/guides/troubleshooting/)
or [session debugging](/guides/session-debugging/). Use `apex-recall handoff <project> --json`
to inspect blocked prerequisites rather than editing session state by hand.

### Next steps

- [WAF assessment guide](/guides/waf-assessment/) for read-only Azure and offline IaC reviews
- [Workflow overview](/concepts/workflow/) for delivery Steps 1 through 7 and standalone routing
- [Showcases](/showcases/) for completed WAF assessment and CoE modernization archetype artifacts
