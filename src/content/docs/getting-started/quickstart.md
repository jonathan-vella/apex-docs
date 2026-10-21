---
title: "Quickstart"
description: "Create an APEX project from the Accelerator template and start a human-approved infrastructure workflow."
---

Start from the [APEX Accelerator template](https://github.com/jonathan-vella/apex-accelerator),
not the documentation repository. You will create a repository, open its development
container, and ask the Requirements agent to capture your workload.

This walkthrough uses x86-64 Windows with WSL2 and VS Code Dev Containers.
Docker Desktop dev containers are validated on x86-64 and ARM64, including
Windows with WSL2, and Linux hosts are supported. It does not deploy Azure
resources.

If you already have a project, use [Updating APEX](/guides/updating-apex/) to
compare its configuration with this guidance before following new instructions.

## Prerequisites

| Requirement | Check |
|---|---|
| GitHub account and access to Copilot in VS Code | Confirm that Chat works and your account or organization permits the models selected by the APEX agents. |
| VS Code with WSL and Dev Containers extensions | Open the repository through the WSL extension. |
| WSL2 and a running Docker-compatible engine | Use Docker Desktop with integration enabled for your WSL distribution. |
| Git in WSL | Run `git --version`. |
| Azure access for scoped discovery and deployment | Prepare the correct tenant, subscription, and permissions before work that requires them. |

Copilot has individual and organization plans. Check [current plan entitlements](https://docs.github.com/en/copilot/get-started/plans)
and your organization's model policy rather than assuming a Business or Enterprise
license is always required.

A GitHub PAT is optional. It is not a substitute for Copilot sign-in or Azure authentication.
See [GitHub authentication](/getting-started/dev-containers/#step-4-github-authentication)
if the container cannot use your existing credentials.

## Step 1: create your repository from the template

Open the [template](https://github.com/jonathan-vella/apex-accelerator), select
**Use this template**, and create a repository under your account or organization.
Choose its visibility according to your requirements. A template creates a new
repository, not a fork.

## Step 2: clone and open

Run these commands in WSL. Replace the example owner and repository.
Keep the checkout in the Linux filesystem rather than under `/mnt/c`.

```bash
mkdir -p ~/src
cd ~/src
git clone https://github.com/YOUR-OWNER/YOUR-REPOSITORY.git
code YOUR-REPOSITORY
```

## Step 3: open in dev container

Use the VS Code command palette to select **Dev Containers: Reopen in Container**.
Wait for setup to finish, then inspect the setup output for failures.

The project container provides the IaC and diagnostic tools expected by its agents.
Its configuration differs from the smaller apex-docs container, which only builds
this documentation site. See [container setup](/getting-started/dev-containers/).

Review the template's initialization instructions before running:

```bash
npm run init
```

Initialization adapts the copied repository. Review the resulting diff.
Use `npm run sync:workflows` when intentionally synchronizing workflow files;
it is not a substitute for reviewing their permissions or cloud configuration.

<span id="step-4-set-up-azure-optional"></span>

## Step 4: decide which Azure access you need

You can read the documentation and discuss requirements without provisioning anything.
Scoped governance discovery, subscription-specific evidence, and deployment require
Azure access. Do not call a workflow verified when those checks have not run.

Read [Azure setup](/getting-started/azure-setup/) before running setup automation.
The product's `npm run setup` can create identities, role assignments, federated
credentials, and GitHub configuration. It is not a harmless prerequisite check.

<span id="step-5-configure-gh_token-for-the-dev-container"></span>

## Step 5: check GitHub authentication

Run `gh auth status` inside the container if your task needs GitHub CLI operations.
Use your organization's approved authentication method. If you choose an optional
`GH_TOKEN`, provide it to the host VS Code process before creating the container.
Terminal-only settings do not supply `${localEnv:GH_TOKEN}`.

Never commit a token or paste one into a documentation example.

## Step 6: verify setup

Run the checks in the container terminal:

```bash
git --version
az --version
bicep --version
terraform --version
pwsh --version
apex-recall --help
```

Check only the authentication needed by your next task. A tool reporting its version
does not prove that it can access your tenant or subscription.

<span id="step-7-enable-subagent-orchestration"></span>

## Step 7: understand agent handoffs

In the current source migration, select a main workflow agent directly or use
`01-Orchestrator` to coordinate approved step dispatch. Requirements, Architect,
Design, and Governance retain native questions when directly selected. You do
not need Orchestrator merely to answer their missing material questions.

Use the native task result or explicitly select the named next agent in Copilot
Chat. Active definitions deliberately omit `handoffs:` metadata; do not wait for
a handoff button. Keep `00-handoff.md` as the durable record of scope and inputs.
Read it before approving a transition. A delegated main worker returns
`USER_INPUT_REQUIRED` to its interactive parent rather than asking you directly.

The [body migration and runtime evidence](/concepts/how-it-works/agents/#current-agent-body-migration)
are distinct. The reported source migration is not certified runtime behavior
or enforcement of declared tools. Removed worker-ready and log-preflight rituals
are not setup prerequisites. Reviews and approval gates still apply.

## Step 8: start the orchestrator

Open Copilot Chat and select `01-Orchestrator` from the available custom agents.
Describe your goal, IaC preference, environment, region constraints, and budget.
For example:

```text
Help me start requirements for a development workload on Azure.
Use Bicep. I need a small web application with persistent data.
Ask about region, policy constraints, availability, and budget before choosing services.
Do not deploy anything.
```

<span id="option-a-orchestrator-recommended"></span>
<span id="option-b-direct-agent-invocation"></span>
<span id="quick-reference"></span>
<span id="orchestrator-orchestrated-workflow"></span>
<span id="direct-agent-invocation"></span>
<span id="skill-invocation"></span>

The Orchestrator should identify the next main agent and the evidence it needs.
You can also select `02-Requirements` directly when you are starting requirements.
It should ask about missing material inputs through its available native question
tool, rather than insist that you select Orchestrator first.
If the agent list is missing, check that you opened your template-derived repository
and that VS Code loaded its customization files.

## Step 9: follow the workflow

Use [Run the workflow](/concepts/workflow/) for the step sequence, reviews, outputs,
and approvals. Choose Bicep or Terraform during requirements; the planning,
generation, and deployment agents depend on that choice.

### What you've created

Your first checkpoint is an understandable requirements artifact and its review,
not a successful-looking chat response. Later deployment needs explicit approval,
current validation evidence, resource checks, and application-health checks.

### If a step fails

Preserve the error and use
[troubleshooting](/guides/troubleshooting/). Do not reset session state to force a
step forward.

### Next steps

Read the [workflow overview](/concepts/workflow/) before selecting the next agent.
