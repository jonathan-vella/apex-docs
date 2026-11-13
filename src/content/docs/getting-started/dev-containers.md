---
title: "Dev container setup"
description: "Open an APEX project in VS Code on x86-64 Windows with WSL2, then verify tools and authentication."
---

This page describes the container in a project created from
[apex-accelerator](https://github.com/jonathan-vella/apex-accelerator).
The separate apex-docs container only builds this site.

## What are dev containers?

VS Code Dev Containers runs your repository with its declared tools and editor
configuration inside a container. It does not grant GitHub or Azure permissions.
You remain responsible for choosing the account, subscription, and operations.

## System requirements

The primary setup is x86-64 Windows, WSL2, VS Code, and Docker Desktop with WSL
integration. Keep the repository in the WSL Linux filesystem.

### Docker options

Use a Docker-compatible engine supported by your organization. The project owner has
manually tested and validated Docker Desktop dev containers on x86-64 and ARM64,
including Windows with WSL2. Linux hosts are supported. The steps below describe
Docker Desktop on WSL2.

### Hardware

Allow enough memory and disk for the container image, language tools, package
caches, and your workload. Inspect the container build output if setup runs out
of resources. A fixed install-time promise is not useful across different hosts
and networks.

### Software

Install VS Code, its WSL and Dev Containers extensions, Git in WSL, and a running
Docker engine. Use supported versions of WSL and Docker for your Windows version.

## Installation steps

### Step 1: install Docker

Follow the [WSL installation instructions](https://learn.microsoft.com/windows/wsl/install)
and [Docker Desktop WSL guide](https://docs.docker.com/desktop/features/wsl/).
Enable Docker's WSL2 engine and integration for the distribution that holds your
repository.

From that WSL distribution, check:

```bash
docker version
docker ps
```

These commands inspect the engine. Do not stop unrelated containers to resolve a
port conflict.

### Step 2: install VS Code extension

Install the WSL and Dev Containers extensions through VS Code's extension view.
Open the repository from WSL with `code .`. Confirm that the VS Code remote
indicator identifies your WSL distribution before opening the container.

### Step 3: open in dev container

Create your repository from the Accelerator template first, following the
[quickstart](/getting-started/quickstart/).

Microsoft employees on corporate devices must connect to the corporate VPN, fully
exit all VS Code windows, and launch VS Code from the host checkout using
`.\.devcontainer\open-microsoft.ps1` on Windows PowerShell or
`bash .devcontainer/open-microsoft.sh` on Linux, macOS, or WSL before building the
container. Everyone else can open the repository with `code .`.

Use **Dev Containers: Reopen in Container** from the command palette. Wait for the
lifecycle scripts to finish and inspect any reported error rather than assuming a
visible editor means setup completed. Rebuild when `.devcontainer/` changes.

### Step 4: GitHub authentication

Git can use credentials forwarded by VS Code through a credential helper or SSH
agent. The GitHub CLI has its own authentication configuration. Check it inside
the container when a task needs GitHub operations:

```bash
gh auth status
```

Choose an approved sign-in method yourself if authentication is missing. The
container can retain GitHub CLI configuration in its named volume. Setup and
agents should not silently sign in, switch accounts, or alter persistent Git
credential settings.

An optional `GH_TOKEN` is forwarded through `${localEnv:GH_TOKEN}`. That value
comes from the environment inherited by the host VS Code process. Supply it
securely before launching that process. When rotating it, fully exit and relaunch
VS Code, then reopen the container. An environment token takes precedence over
stored GitHub CLI credentials.

:::caution[Terminal settings do not configure the host process]
`terminal.integrated.env.*` only configures integrated terminals. It does not
populate `${localEnv:GH_TOKEN}` for container creation or the extension host.
Exporting a value inside the container does not change the host environment.
:::

A fine-grained PAT is optional. Limit its repositories, permissions, and lifetime
to the intended work and your organization's policy. Never commit it, paste it
into chat, or ask an agent to print it.

If an operation uses the wrong account, inspect the identity and target repository
before changing credentials. A permission failure can also come from branch
protection or organization policy.

### Step 5: verify setup

Check the tools inside the container:

```bash
az --version
bicep --version
terraform --version
pwsh --version
apex-recall --help
```

Tool availability and authentication are separate checks. Consult
[Azure setup](/getting-started/azure-setup/) before granting cloud access or running
setup automation.

## Alternative Docker options

<span id="rancher-desktop-free-docker-desktop-alternative"></span>
<span id="colima-macos-only"></span>
<span id="podman-linuxmacos"></span>

Rancher Desktop, Colima, and Podman have their own compatibility and configuration
requirements. This documentation does not claim a validated APEX setup on those
runtimes. Follow their documentation and verify the project lifecycle
scripts before adopting an alternative.

## What's included

The container declares Azure CLI, Bicep, Terraform, PowerShell, Python, Node.js,
GitHub CLI, `azqr`, and Azure Developer CLI tooling. Its lifecycle scripts install
project dependencies and `apex-recall`. VS Code loads the repository's agents,
skills, instructions, and workspace-root `.mcp.json` (`github` and `azure-mcp` at
`@azure/mcp@3.0.0`).

Runtime `.github/hooks/` hooks were retired and removed from APEX. Do not restore
them or add replacement chat hooks during setup. Git Lefthook pre-commit and
pre-push checks, `gitleaks`, and CI workflows remain active. See
[Copilot hooks retirement](/concepts/how-it-works/workflow-engine/#copilot-hooks).

Use the configuration in your template-derived repository as the setup authority.
Do not install duplicate MCP extensions or create a legacy `.vscode/mcp.json` file
when `.mcp.json` is already present at the workspace root.

## Base image and tool installation

APEX and `apex-accelerator` use the Azure Linux 4 preview base image, pinned by
digest ([apex#793](https://github.com/jonathan-vella/apex/pull/793)). If you created
your project before that update and have not merged an upstream sync pull request,
check which base image your checkout uses:

```bash
head -n 1 .devcontainer/Dockerfile
```

An `azurelinux` line indicates the current container; an `ubuntu` line indicates the
older base.

Key details of the Azure Linux 4 image:

- The package manager is `dnf`, not `apt`.
- Azure CLI runs in an isolated Python environment installed by a local Feature.
- GitHub CLI, Terraform, Bicep, `azqr`, and `azd` install as checksum-verified standalone binaries.
- `dos2unix` and the preinstalled Az PowerShell module bundle were removed; PowerShell and PSScriptAnalyzer remain.

Product CI builds the image natively on `amd64` and `arm64` Linux runners, and the
owner validated Docker Desktop dev containers on x86-64 and ARM64 including Windows
with WSL2. GitHub Codespaces is not separately validated. Rebuild and run the checks
in [step 5](#step-5-verify-setup) after updating.

## Package sources

The dev container uses public registries by default (`registry.npmjs.org` for npm,
`pypi.org` for pip and uv). Microsoft maintainers opt in to the corporate CFS feed
proxy before VS Code starts, and any organization can point the container at an
internal mirror.

Microsoft employees can set the host environment variables for a single VS Code
session without altering global host settings by closing all VS Code windows,
connecting to corporate VPN, and running the host launcher from the repository root:

```powershell title="Windows PowerShell (host)"
.\.devcontainer\open-microsoft.ps1
```

```bash title="Linux, macOS, or WSL (host)"
bash .devcontainer/open-microsoft.sh
```

Under the hood, the launcher populates these host variables before starting VS Code:

| Host variable | Microsoft proxy value | Default |
| --- | --- | --- |
| `APEX_NPM_REGISTRY_HOST_PATH` | `packagefeedproxy.microsoft.io/npm/` | `registry.npmjs.org/` |
| `APEX_PIP_INDEX_HOST_PATH` | `packagefeedproxy.microsoft.io/pypi/simple/` | `pypi.org/simple/` |

Values omit `https://` because the scheme is fixed in `.devcontainer/Dockerfile` and
`devcontainer.json`. Dev Containers reads `${localEnv:...}` from the host VS Code
process, so setting them inside an integrated terminal has no effect on image builds.

At startup, `post-start.sh` prints each package source label (`Microsoft CFS`,
`public`, `custom`, or `unset`) and warns on partial Microsoft opt-in without printing
raw URLs that might embed credentials. If container startup fails with an SSL
`HandshakeFailure` against `files.pythonhosted.org` on a corporate network, exit all
VS Code windows and relaunch via `open-microsoft.ps1` or `open-microsoft.sh`, then
rebuild the container.

Microsoft's 7-day upstream release-age and CFS-feed rules apply to Microsoft
maintainers' environments. Other organizations apply their own mirror and quarantine
policies. Never disable TLS verification to bypass a download error.

## Migrate a customized container

Use this if you changed the Ubuntu container or receive `.devcontainer/` through the
upstream sync.

1. Replace `apt-get install` steps with `dnf install -y`. Package names differ, so
   check each with `dnf search`.
2. Features that call `apt` or `dpkg` do not work on this base. Use a local Feature or
   a binary installer instead.
3. To add a tool, pin its version and add a checksum to the container's
   `download-checksums.json`, or write a local Feature. Do not add unverified downloads.
4. Rebuild and run the verification in [step 5](#step-5-verify-setup).

The sync overwrites `.devcontainer/` and removes files that no longer exist upstream
unless their path is excluded. To protect local changes, review the exclusion list in
your repository's sync workflow first; see
[Update an existing APEX project](/guides/updating-apex/).

To stay on Ubuntu, restore `.devcontainer/` from the product commit before the migration
(`c1755e12`) through a reviewed change. That configuration is not tested against current
tooling. The product's
[migration notes](https://github.com/jonathan-vella/apex/blob/main/.devcontainer/README.md#migrating-a-customized-ubuntu-dev-container)
list what a coherent rollback includes.

## Troubleshooting

### Container won't start

Check the Docker engine, WSL integration, available disk, and the first failing
build or lifecycle command. Preserve the error message. Do not bypass certificate
validation to get past a package-download failure.

### Port conflicts

Identify which process or container owns the port. Change the intended project's
forwarded port or stop only a process you own and have chosen to stop.

### Slow performance (Windows/macos)

On Windows, keep the checkout under the WSL Linux filesystem rather than `/mnt/c`.
Review Docker's resource allocation and available disk before rebuilding caches.
macOS performance and architecture support were not verified for this guide.

### Package install fails during setup

Read the first failing `npm` or Python install. Check the package sources line in the
startup output. A source your network cannot reach fails the setup, and an older
configuration points at a Microsoft proxy by default. See
[Package sources](#package-sources) to set the host variables, then rebuild. Do not
disable TLS verification.

### Extensions not loading

Confirm that you are in the container window, inspect extension installation
errors, and compare the enabled customizations with the repository configuration.
A window reload may resolve a completed installation; it does not fix a failed
container setup.

## References

- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Quickstart](/getting-started/quickstart/)
- [Troubleshooting](/guides/troubleshooting/)
- [Product dev container guide](https://github.com/jonathan-vella/apex/blob/main/.devcontainer/README.md)
- [Pinned Accelerator configuration](https://github.com/jonathan-vella/apex-accelerator/blob/9e7432ca90a9db86e9f85f28d3afd6db78d97c19/.devcontainer/devcontainer.json)
