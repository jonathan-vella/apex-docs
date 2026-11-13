---
title: "MCP server integration"
description: "Configure workspace-root .mcp.json for GitHub MCP and Azure MCP across retail pricing, documentation, and Terraform lookups."
---

The Model Context Protocol (`MCP`) lets APEX agents query external services through a standard tool interface. APEX declares workspace servers in root `.mcp.json` (`mcpServers` with `"tools": ["*"]`) rather than deprecated `.vscode/mcp.json` (`servers`) so the VS Code **Copilot** harness loads them directly without migration prompts or extra Azure extension packs.

## Architecture

Workspace `.mcp.json` registers exactly two MCP servers:

1. **`azure-mcp`** (`stdio` via `npx -y @azure/mcp@3.0.0 server start`): Azure retail pricing (`pricing_get`), Microsoft Learn documentation (`documentation`), Azure Terraform provider and AVM schemas (`azureterraform`), and read-only Azure resource inspection.
2. **`github`** (`http` via `https://api.githubcopilot.com/mcp/`): Fallback repository, issue, and pull-request context when `gh` CLI does not cover a capability.

The former hosted `azure-resource-manager-mcp` server and custom Python pricing server are retired. Historical and forecast Azure spend queries in `apex-azure-cost-optimization` and standalone WAF assessments run directly through authenticated Azure Cost Management REST API calls (`az rest --method post` against `Microsoft.CostManagement/query` and `Microsoft.CostManagement/forecast`).

<span id="azure-resource-manager-mcp"></span>
<span id="pricing-and-cost-tools"></span>
<span id="cost-tools"></span>

## Cost analysis and retail pricing

APEX keeps actual billing evidence and retail catalog pricing strictly separate:

- **Actual and forecast Azure spend (`apex-azure-cost-optimization` and standalone assessments).** Queries `Microsoft.CostManagement/query` and `Microsoft.CostManagement/forecast` via `az rest`, keeping `ActualCost` and `AmortizedCost` views and currencies separate and combining spend data with Azure Monitor utilization metrics.
- **Planned and as-built retail pricing (`cost-estimate-subagent`).** Queries `azure-mcp` `pricing` (`pricing_get`) for evidence-backed `cost-estimate-v2` monthly workload estimates or `retail-rate-quote-v1` unit-rate quotes when monthly usage is unknown.

### Migration limitations

Retiring the custom pricing server and `azure-resource-manager-mcp` means APEX does not perform negotiated EA/MCA discount lookups, fuzzy SKU guessing, PTU capacity simulation, Databricks/GitHub license pricing, or Spot eviction history inside `cost-estimate-subagent`. Verify enterprise-discounted budgets in the [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/) or Azure Cost Management.

## Azure MCP server

In `.mcp.json`, `azure-mcp` runs as a pinned workspace `stdio` process:

```json title=".mcp.json"
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "tools": ["*"]
    },
    "azure-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@azure/mcp@3.0.0", "server", "start"],
      "env": {
        "NPM_CONFIG_ALLOW_REMOTE": "all"
      },
      "tools": ["*"]
    }
  }
}
```

### Azure MCP pricing

`cost-estimate-subagent` calls `azure-mcp` `pricing` (`pricing_get`) with `sku`, `service`, `region`, `service-family`, `price-type`, `currency`, `include-savings-plan`, and an OData `filter` (for example, `serviceName eq 'Azure App Service' and armRegionName eq 'swedencentral' and meterName eq 'P1 v3 App'`).

Because `@azure/mcp@3.0.0` returns `status: 200` with an empty `prices` array on zero matches and rejects unspecific `service` strings with `status: 400`, `03-Architect` dispatches focused calls with explicit meter hints, and `cost-estimate-subagent` captures raw response hashes and verifies unit conversions and tier arithmetic (`cost-estimate-v2`). If `pricing_get` returns empty rows or a retryable transport error, only `cost-estimate-subagent` may invoke the constrained direct Azure Retail Prices API fallback, labeling those records with direct-API provenance rather than MCP provenance.

## Other servers

| Server | Transport | Primary role in APEX |
| --- | --- | --- |
| `github` | HTTP | Fallback GitHub API context (`gh` CLI remains primary for issues and pull requests) |

Architecture diagrams are rendered locally through `apex-python-diagrams` rather than an MCP server. Terraform AVM module versions, READMEs, and `azurerm` / `azapi` provider docs come from `azure-mcp` `azureterraform` (`avm versions`, `avm get`, `azurerm get`, `azapi get`), with the public Terraform Registry API as fallback.

## Verification

Validate `.mcp.json` and pinned tool snapshots from your project root:

```bash
npm run lint:mcp-config
npm run validate:mcp-tool-refs
```

In VS Code, run **MCP: List Servers** from the command palette to inspect or restart `azure-mcp` after configuration updates.

## Authentication

| Integration | Authentication |
| --- | --- |
| `azure-mcp` retail pricing and `azureterraform` docs | Public catalog queries require no Azure sign-in |
| `azure-mcp` resource inspection and `az rest` Cost Management | Active `az login` or managed identity with scoped `Reader` / `Cost Management Reader` access |
| `github` MCP | VS Code GitHub Copilot sign-in (`gh` CLI uses its own `gh` config volume or host `GH_TOKEN`) |

Agents surface authentication or RBAC denials directly to the user and never fabricate prices or expose credentials.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Azure resource or Cost Management query returns `403` | Sign in with `az login --tenant <TENANT_ID>` using an identity with `Reader` (and `Cost Management Reader` for billing) on the target scope |
| `pricing_get` returns `status: 400` or too many rows | Narrow the OData `filter` with exact `serviceName`, `armRegionName`, and `productName` or `meterName` |
| MCP server fails to start or prompts migration | Confirm `.mcp.json` is at the workspace root, remove stale `.vscode/mcp.json`, and run `npm run lint:mcp-config` |
