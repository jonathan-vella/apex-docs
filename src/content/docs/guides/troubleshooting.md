---
title: "Troubleshooting"
description: "Diagnose agent, container, authentication, validation, and deployment failures without bypassing workflow gates."
---

Record the repository revision, project, selected agent, failing command, and
exact error before changing anything. Work in the same environment that failed.
Redact credentials and sensitive configuration from shared evidence.

<span id="troubleshooting-guide"></span>
<span id="agent-codenames-quick-reference"></span>

## Agent names

Use the current names in the agent picker rather than historical codenames.
The [workflow roster](/concepts/workflow/#core-agents-by-workflow-step) lists main
agents. `01-Orchestrator` helps identify the next step; the owner selects it.

## Quick decision tree

| Failure | Start here |
|---|---|
| Missing agent or skill | Verify the checkout, file, invocation flags, and editor diagnostics. |
| Corrupt or conflicting state | Use [session state debugging](/guides/session-debugging/). |
| Authentication | Test the specific tool's context without printing tokens. |
| Policy or preview | Preserve the failing evidence and return to the responsible step. |
| Site build | Use apex-docs commands, not product validators. |

## Common issues

### 1. Agent not appearing in list

Confirm that you opened the product or Accelerator repository, not this site-only
checkout. Check `.github/agents/` and the relevant file's frontmatter. Confirm
Copilot access and inspect editor diagnostics. Reload the window after a corrected
configuration if needed.

<span id="2-orchestratorsubagent-invocation-not-working-vs-code-1109"></span>

### 2. Orchestrator or subagent dispatch not working

Confirm that your VS Code Copilot Chat session target is **Copilot** (not a legacy Local profile) and reload the VS Code window if `.github/agents/` files were recently updated on disk.

In the Copilot target, `01-Orchestrator` is human-selected (`disable-model-invocation: true`) and dispatches allowlisted step workers and `challenger-review-subagent` through native tasks. Step workers call only their declared leaf subagents (`cost-estimate-subagent`, validate/preview subagents, `policy-precheck-subagent`, and `challenger-review-subagent`); if a delegated worker lacks nested task access, it returns `REVIEW_REQUIRED` so `01-Orchestrator` runs the sibling review automatically. Do not add wildcard `agents: ["*"]` frontmatter to work around a missing capability.

### 3. Skill not activating automatically

Read its `SKILL.md` invocation flags. Manual-only skills require explicit selection.
Name the skill and requested task, or load its instructions explicitly when the
client cannot discover it. Do not claim that keyword matching proves a skill loaded.

### 4. Deployment fails with Azure policy error

Capture the assignment/definition, target scope, evaluated property, and exact
failure. Return stale or incomplete policy discovery to Governance. Return design,
plan, or code conflicts to their owners.

Do not choose a new SKU, remove a tag, or enable public access merely to pass a
deployment. Effective policy and the approved design determine the correction.

### 5. Bicep build errors

From the product root, replace `{project}` with the actual project:

```bash
bicep --version
bicep restore infra/bicep/{project}/main.bicep
bicep lint infra/bicep/{project}/main.bicep
bicep build infra/bicep/{project}/main.bicep
```

Check registry access, module versions, parameters, and the reported source location.
Return repairs to Bicep CodeGen and renew the handoff after changes.

### 5T. Terraform validation errors

Check the project's provider constraints and lock file before changing versions.
For configuration-only validation in the project directory:

```bash
terraform version
terraform init -backend=false
terraform fmt -check -recursive
terraform validate
```

This does not establish remote-backend readiness or authorize a plan/apply.
Do not force-unlock state as a routine fix. Confirm no operation owns the lock and
obtain explicit authorization for a state-changing recovery action.

### 6. Azure authentication issues

#### Azure CLI (`az`)

An account listing does not validate a token. Check both context and token acquisition:

```bash
az account show --output table
az account get-access-token --resource https://management.azure.com/ --output none
```

If authentication expired, sign in with the intended identity and recheck the
subscription. Do not change identities merely to bypass a permission failure.

#### Azure developer CLI (`azd`)

Azure CLI and azd have separate caches. Check azd with:

```bash
azd auth login --check-status
```

Use the organization's approved sign-in method if it needs reauthentication.

<span id="service-principal-both-az-and-azd"></span>

#### Service principal authentication

Verify tenant, application identity, and assigned scope without exposing secrets.
Use the organization's approved automation identity and credential mechanism.
Do not paste credentials into prompts, committed scripts, or diagnostic bundles.

### 7. Artifact validation failures

Compare the affected artifact against its template in `.github/skills/apex-azure-artifacts/templates/`, keeping required H2 headings in exact template order. Run `npm run validate:artifacts` from the workload repository root; note that agents do not invoke `markdownlint-cli2` directly against `agent-output/**` because Git Lefthook (`artifact-validation`) and Challenger review enforce artifact compliance.

### 8. MCP server not responding

Confirm workspace-root `.mcp.json` exists (`github` and `azure-mcp` at `@azure/mcp@3.0.0`), remove any stale `.vscode/mcp.json`, and run `npm run lint:mcp-config`. In VS Code, run **MCP: List Servers** and restart `azure-mcp` if needed.

Never substitute remembered prices when `pricing_get` fails; surface the error directly. Note that `azure-resource-manager-mcp` is retired and historical Cost Management queries use `az rest` with `Cost Management Reader` permissions.

### 9. Dev container build fails

Inspect the first failing step in the Dev Containers log, verify Docker Desktop and WSL2 integration are running, and never disable TLS verification to bypass download errors.

If corporate network inspection causes an SSL `HandshakeFailure` against `files.pythonhosted.org` or `registry.npmjs.org` on a Microsoft device, close all VS Code windows, connect to corporate VPN, relaunch from the host via `.\.devcontainer\open-microsoft.ps1` or `bash .devcontainer/open-microsoft.sh`, and rebuild. See [package sources](/getting-started/dev-containers/#package-sources) and [container migration](/getting-started/dev-containers/#migrate-a-customized-container).

<span id="10-orphaned-vs-code-extensions-injecting-unwanted-instructions"></span>

### 10. Unexpected extension instructions

Inspect the active remote and local extension lists and the conversation's context
diagnostics. Compare them with the actual container configuration. Product and
template revisions can differ.

Disable or uninstall a confirmed unwanted extension through VS Code, then reload.
Do not recursively remove extension directories based on an unverified name match.
If it returns, inspect image/configuration sources before rebuilding.

### 11. Git push fails with Lefthook errors

Identify whether the failure comes from pre-commit, commit-message, pre-push, or CI.
Run the named check from the correct repository root and fix its cause.
Product scripts do not necessarily exist in apex-docs.

Do not use `--no-verify` as a routine workaround. A corrected commit message does
not resolve a failing source or artifact validator.

<span id="12-handoff-prompt-not-working"></span>

### 12. Handoff button not appearing

Active APEX agent definitions intentionally omit `handoffs:` frontmatter, so VS Code does not render handoff buttons at the bottom of replies. Continue inside `01-Orchestrator` (or send `resume <project>` in a new `01-Orchestrator` chat), or select the next step agent named in `agent-output/{project}/00-handoff.md` from the agent picker.

## Diagnostic commands

### Environment check

Run only the checks relevant to the failure:

```bash
node --version
python3 --version
git --version
bicep --version
terraform version
az version
```

### Workspace validation

Read the current repository's `package.json` and CI workflow. The
[validation reference](/reference/validation-reference/) separates product and site
checks. Run infrastructure checks in their actual project directory.

### Azure status

These commands read the selected subscription and specified resource group:

```bash
az account show --output table
az deployment group list --resource-group "{resource-group}" --output table
```

Redact output before sharing it. A deployment record alone is not evidence that
application endpoints are healthy.

## Getting help

Provide a reproducible failure, source revision, selected agent, and redacted logs.
Use the product issue tracker for APEX behavior and the docs tracker for site problems.

### Still stuck?

Select `09-Diagnose` for deployed-resource investigation or `01-Orchestrator` to
identify the owning workflow step. State whether the request is read-only.
Diagnosis does not authorize remediation.

## Related

- [Session state debugging](/guides/session-debugging/)
- [Debug-log export](/guides/apex-debug-log-export/)
- [Validation reference](/reference/validation-reference/)
