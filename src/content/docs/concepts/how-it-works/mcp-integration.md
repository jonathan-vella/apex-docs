---
title: "MCP server integration"
description: "MCP servers for Azure operations, pricing, and repository context"
---

The Model Context Protocol (MCP) lets APEX agents discover and invoke external
tools through a common interface. The workspace declares its servers in
`.mcp.json`. Azure MCP runs as a workspace stdio process, not an additional
Azure MCP extension pack.

## Architecture

The selected agent calls tools permitted by its definition. Hosted ARM MCP provides
actual-cost, forecast and benefit queries. Workspace Azure MCP provides Azure service tools,
including retail pricing. GitHub MCP provides repository context. Each integration has its own
authentication and authorization requirements.

Registering a server does not authorize every agent to use every tool.
Inspect the current configuration and the selected agent's declarations together.

## Azure Resource Manager MCP

APEX uses Microsoft's hosted
[Azure Resource Manager MCP server](https://github.com/Azure/Azure-Resource-Manager-MCP)
for Azure cost management. Retail pricing no longer uses it; see
[Azure MCP pricing](#azure-mcp-pricing).

| Property | Value |
| --- | --- |
| Transport | HTTP |
| Endpoint | `https://mcp.management.azure.com` |
| Toolsets | `CostManagement` |
| Authentication | Signed-in VS Code Azure identity |
| APEX scope | Read-only cost tools |

The workspace configuration is:

```json
{
  "mcpServers": {
    "azure-resource-manager-mcp": {
      "type": "http",
      "url": "https://mcp.management.azure.com",
      "headers": {
        "x-mcp-toolset": "CostManagement"
      },
      "tools": ["*"]
    }
  }
}
```

Follow the hosted server's current client-support documentation. Open
[the installation link](https://aka.ms/JoinARMMCP)
when VS Code requires interactive registration, then sign in with the Azure
identity whose permissions should apply.

<span id="pricing-and-cost-tools"></span>

### Cost tools

The `apex-azure-cost-optimization` skill, run by a main agent, uses these read-only tools:

| Tool | Use |
| --- | --- |
| `query_costs` | Actual costs for an authorized deployed scope |
| `query_aks_costs` | Actual AKS cost breakdown |
| `forecast_costs` | Forecast costs for a deployed scope |
| `list_dimensions` | Discover supported cost dimensions |
| `list_benefit_utilization` | Inspect reservation and savings-plan utilization |
| `get_benefit_recommendations` | Retrieve benefit recommendations |

The cost-estimate subagent uses none of them. Deployment, resource mutation, and budget creation are outside
APEX's permitted scope. Do not treat server registration as approval for those operations.

### Migration limitations

The official servers replace the former custom Python pricing server. APEX no
longer provides custom bulk estimates, fuzzy SKU discovery, customer discounts,
PTU sizing, Databricks or GitHub pricing, Spot history or simulation, or orphaned
resource detection through its pricing workflow.

No compatibility adapter is retained. Use official service-specific sources in
a separate workflow when one of those capabilities is required.

See Microsoft's
[Cost Management and Pricing tools](https://github.com/Azure/Azure-Resource-Manager-MCP/blob/main/docs/CostManagementAndPricingTools.md)
for current tool schemas and supported scopes.

## Azure MCP server

At the site's source pin, Azure MCP runs as a workspace stdio server through
`npx -y @azure/mcp@3.0.0 server start` in `.mcp.json`. This avoids installing an Azure extension
pack and its unrelated transitive extensions.

Agents use it for governance discovery, Azure service inspection, Microsoft
Learn searches, Azure Terraform guidance, and retail pricing. It uses Azure CLI or managed
identity credentials as supported by the server.

### Azure MCP pricing

The cost-estimate subagent prices planned resources only through the Azure MCP `pricing` tool
(`azure-mcp/pricing`, command `pricing_get`) and has no other Azure tool. It takes `sku`, `service`, `region`,
`service-family`, `price-type`, `currency`, `include-savings-plan` and a raw OData `filter`; at least one filter input is
required. Meter and product constraints go through `filter`, for example
`serviceName eq 'Azure App Service' and armRegionName eq 'swedencentral' and meterName eq 'P1 v3 App'`.

On the pinned release, an empty match returns `status: 200` with an empty `prices` array, a bare `service` such as
`SQL Database` can be rejected with `status: 400`, and responses carry no paging metadata. The subagent therefore
narrows queries by `productName` or `meterName`, selects meters locally, calculates totals from `retailPrice`,
`unitOfMeasure`, quantity and explicit usage, and fails closed when a meter or usage assumption is ambiguous. The
Architect asks it to price one decision per call, with meter hints in the prompt, so one call cannot exhaust the
request budget.

If `pricing_get` returns no rows or a retryable error, only the subagent may use the documented public Retail Prices
API helper as evidence fallback. That evidence is labelled as direct API data, never as MCP output.

## Other servers

| Server | Transport | Purpose |
| --- | --- | --- |
| GitHub MCP | HTTP | Repository, issue, and pull-request context |

Architecture diagrams are generated locally through the `apex-python-diagrams` skill,
not through MCP. Terraform module versions, module READMEs and provider documentation come from the Azure MCP
`azureterraform` commands (`avm versions`, `avm get`, `azurerm get`, `azapi get`), with the public Terraform
Registry API as the fallback. The AVM module index stays the source for module existence and lifecycle, and
initialized provider schemas come from Terraform CLI.

An unknown module makes `avm versions` return status 400 (`ArgumentException`, "not found in available modules");
that is the only response agents treat as "unpublished". `azurerm get` returns status 200 even for an unknown
resource type, so an empty `arguments` list with a "Documentation not found" summary means the type does not exist.

## Verification

Run the configuration validator:

```bash
npm run lint:mcp-config
```

In VS Code, run **MCP: List Servers**, select
`azure-resource-manager-mcp`, and restart it after configuration changes. In
Chat's tool picker, verify that the `pricing` tool appears under `azure-mcp`. Cost-management tools for the
cost-optimization skill come from the `CostManagement` toolset requested by the configuration header.
Actual tool availability still depends on the server and client session.

## Authentication

| Server | Authentication |
| --- | --- |
| Azure Resource Manager MCP | Signed-in VS Code Azure identity for scoped cost tools |
| Azure MCP server | Azure CLI or managed identity; retail prices are public |
| GitHub MCP | Client-managed GitHub authentication |
| Public Terraform Registry and `azureterraform` lookups | No Azure credentials required |

Authentication and authorization failures must be surfaced to the user. Agents
must not fall back to remembered prices or expose tokens, tenant details, or
other credentials.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| ARM MCP tools are missing | Install through `https://aka.ms/JoinARMMCP`, then restart the server |
| Cost tools are missing | Compare `x-mcp-toolset` with the pinned `CostManagement` configuration |
| Azure scope is denied | Sign in with an identity that has the required read permissions |
| Retail query returns many rows or `status: 400` | Use a `filter` with service, region and `productName` or `meterName` |
| Configuration is rejected | Run `npm run lint:mcp-config` and compare `.mcp.json` |

Final estimates should still be reviewed against the
[Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
before committing a budget.
