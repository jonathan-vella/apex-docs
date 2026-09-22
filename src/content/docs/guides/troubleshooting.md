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

### 2. Orchestrator does not invoke the next main agent

This is expected in the current workflow. Main agents, including Challenger,
require human selection. Do not add wildcard `agents: ["*"]` permissions or an
obsolete experimental setting to make Orchestrator delegate.

If an allowed helper fails, inspect the parent agent's actual tool and helper
declarations. Main-agent handoffs and bounded helper calls are different mechanisms.

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

Compare the affected artifact with its current template under
`.github/skills/apex-azure-artifacts/templates/`. Preserve required headings and
their order. Run the check named in the failure through the supported product
workflow. Do not delete mandatory sections to satisfy a prose cleanup.

### 8. MCP server not responding

Check `.vscode/mcp.json`, the client's registered servers, authentication, and the
specific tool's error. Restart the failed server through the client's MCP controls
when appropriate.

Missing pricing evidence must remain missing. Work that does not depend on the
failed tool may continue, but a required check cannot become a success by fallback.
Governance uses Azure authentication independently of retail-pricing access.

### 9. Dev container build fails

Read the first failed build step. Confirm Docker is available and WSL integration
is enabled. Check proxy, registry, disk, and port errors before rebuilding.
Do not disable TLS verification to get past a package-download failure.

Use [container setup](/getting-started/dev-containers/) for the supported environment.
A successful native Windows dev preview does not establish Linux build compatibility.

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

### 12. Handoff prompt not working

Check that the target agent exists and matches the handoff declaration. Main-agent
selection remains a human action. Inspect malformed frontmatter or a client discovery
problem rather than adding delegation privileges.

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
