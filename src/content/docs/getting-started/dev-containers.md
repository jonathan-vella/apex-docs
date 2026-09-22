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

Use a Docker-compatible engine supported by your organization. This guide describes
Docker Desktop on WSL2. Other runtimes and architectures are not verified by this
guide.

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
[quickstart](/getting-started/quickstart/). Use **Dev Containers: Reopen in
Container** from the command palette.

Wait for the lifecycle scripts to finish. Read any reported error rather than
assuming a visible editor means setup completed. Rebuild when the repository's
container definition changes.

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
runtimes or on ARM. Follow their documentation and verify the project lifecycle
scripts before adopting an alternative.

## What's included

The product container declares Azure CLI, Bicep, Terraform, PowerShell, Python,
Node.js, GitHub CLI, and Azure Developer CLI tooling. Its lifecycle scripts install
project dependencies and `apex-recall`. VS Code loads the repository's agents,
skills, instructions, hooks, and MCP configuration.

Use the configuration in your template-derived repository as the setup authority.
APEX main can contain changes that the template has not yet incorporated. Do not
install a duplicate Azure MCP extension merely because an older guide recommends it.

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

### Extensions not loading

Confirm that you are in the container window, inspect extension installation
errors, and compare the enabled customizations with the repository configuration.
A window reload may resolve a completed installation; it does not fix a failed
container setup.

## References

- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Quickstart](/getting-started/quickstart/)
- [Troubleshooting](/guides/troubleshooting/)
- [Pinned Accelerator configuration](https://github.com/jonathan-vella/apex-accelerator/blob/a77442889129b26a2a89c0d5faa5f1d35a84965c/.devcontainer/devcontainer.json)
