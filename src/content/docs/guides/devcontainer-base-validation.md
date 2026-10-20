---
title: "Dev container base validation"
description: "Compare a candidate dev container base image with the current baseline on native amd64 and arm64 runners before promotion"
sidebar:
  order: 9
---

This is an APEX product contributor procedure, not an apex-docs build command.
Use the Dev Container Base Validation workflow to test a new base image without granting the workflow write
access or merging the change. The workflow builds the current baseline and candidate on native amd64 and arm64 GitHub
runners, then publishes one fail-closed verdict.

## Safety boundaries

The validation workflow is intentionally constrained:

- It uses `contents: read` and receives no secrets.
- It never authenticates to Azure, deploys resources, pushes container images, or modifies `main`.
- Pull request runs accept changes only from branches in this repository; forked pull requests are skipped.
- A human must review and merge the pull request under test. The workflow does not create pull requests, enable
  auto-merge, or bypass branch protection.
- Both native CPU architectures are required. There is no emulation fallback.

:::caution
A `PASS` verdict establishes compatibility with the checks in this repository. It does not replace human review of the
base-image release notes or the pull request.
:::

## Pull request validation

A pull request that changes the dev container or its validation harness starts the workflow automatically. The matrix
compares:

| Variant | Container base | Runner architecture |
| --- | --- | --- |
| Baseline | Base image from the pull request's target commit | amd64 |
| Candidate | Base image from the pull request branch | amd64 |
| Baseline | Base image from the pull request's target commit | arm64 |
| Candidate | Base image from the pull request branch | arm64 |

The host runners are GitHub-hosted Linux machines. The base image under test is the operating system inside the dev
container. This separation tests the same container boundary contributors use locally.

Each matrix leg creates an untracked, repo-relative validation config. The tracked
`.devcontainer/devcontainer.json` is never rewritten by a workflow step.

## Manual validation

After the workflow exists on `main`, dispatch it from a branch to compare that revision with a baseline:

```bash
gh workflow run validate-devcontainer-base.yml --repo jonathan-vella/apex \
  --ref <candidate-branch> \
  -f baseline_ref=origin/main \
  -f candidate_distro_id=azurelinux \
  -f candidate_os=4.0
```

The candidate is the selected workflow revision. `baseline_ref` names the complete baseline Git revision and defaults
to `origin/main`. `candidate_distro_id` and `candidate_os` are the expected `/etc/os-release` `ID` and `VERSION_ID`.
`baseline_distro_id` and `baseline_os` are optional; when empty, the workflow derives them from an official Ubuntu or
Azure Linux image tag.

The preflight job checks that the candidate image matches the digest recorded in the workflow and that its manifest
advertises both `linux/amd64` and `linux/arm64` with the recorded platform digests, before any container build. To
evaluate a different base image, change the dev container definition and the recorded digests together in a reviewed
pull request.

## Validation coverage

Each container run checks:

- The observed distribution ID, version and CPU architecture, compared with the expected `/etc/os-release` values.
- Completion of the dev container lifecycle, including a repeated `post-start` idempotency smoke test.
- All tools reported by the setup script, including Azure CLI, Bicep, PowerShell, Python, Node.js, and Terraform.
  It also checks gitleaks, azd, and configured MCP tooling.
- Repository formatting, hooks, linting, unit tests, and infrastructure validation
  through the product's configured scripts. The separate apex-docs site build is
  not part of this product container check.
- Minimal Bicep compilation and Terraform provider initialization/validation.
- No-auth Azure Retail Prices searches for virtual machine and storage pricing.
- A non-empty Azure architecture diagram rendered through Graphviz and the Python `diagrams` package.

Logs and machine-readable verdicts are uploaded as workflow artifacts for every matrix leg that reaches the validation
script.

## Interpret the verdict

| Verdict | Meaning | Action |
| --- | --- | --- |
| `PASS` | Both baselines and both candidates passed, with no candidate-only setup warnings | Review the pull request |
| `BLOCKED` | A result is missing, a baseline is unhealthy, a candidate check failed, or a new warning appeared | Inspect artifacts and do not promote |

A blocked result is categorized as `compatibility`, `network`, `runner`, `harness`, or `unknown`. Network and runner
failures may be retried once. A repeated infrastructure failure remains blocked but is not automatically labeled as a
base-image incompatibility.

## Troubleshoot a blocked run

1. Open the comparison job summary and identify the affected variant and architecture.
2. Download the consolidated verdict and the matching matrix artifact.
3. Read `post-create.log` and the individual check log named in `verdict.json`.
4. Retry once only when the failure category is `network` or `runner`.
5. For a verified compatibility issue, make the smallest fix that preserves the baseline and rerun the pull request.
6. Do not merge the pull request until a complete `PASS` result is available.

## Related

- [Dev Container Hygiene](../devcontainer-hygiene/). maintain a focused contributor environment
- [Validation & Linting](../../reference/validation-reference/). understand repository validation commands
- [Troubleshooting](../troubleshooting/). diagnose local and workflow failures
