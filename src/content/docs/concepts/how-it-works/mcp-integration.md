---
title: "MCP server integration"
description: "MCP servers for Azure operations, pricing, and repository context"
---

The Model Context Protocol (MCP) lets APEX agents discover and invoke external
tools through a common interface. The workspace declares its servers in
`.vscode/mcp.json`. Azure MCP runs as a workspace stdio process, not an additional
Azure MCP extension pack.

## Architecture

The selected agent calls tools permitted by its definition. Hosted ARM MCP provides
pricing and cost queries. Workspace Azure MCP provides Azure service tools.
GitHub MCP provides repository context. Each integration has its own authentication
and authorization requirements.

Registering a server does not authorize every agent to use every tool.
Inspect the current configuration and the selected agent's declarations together.

## Azure Resource Manager MCP

APEX uses Microsoft's hosted
[Azure Resource Manager MCP server](https://github.com/Azure/Azure-Resource-Manager-MCP)
for Azure retail pricing and cost management.

| Property | Value |
| --- | --- |
| Transport | HTTP |
| Endpoint | `https://mcp.management.azure.com` |
| Toolsets | `CostManagement, Pricing` |
| Authentication | Signed-in VS Code Azure identity |
| APEX scope | Read-only pricing and cost tools |

The workspace configuration is:

```json
{
  "servers": {
    "azure-resource-manager-mcp": {
      "type": "http",
      "url": "https://mcp.management.azure.com",
      "headers": {
        "x-mcp-toolset": "CostManagement, Pricing"
      }
    }
  }
}
```

Follow the hosted server's current client-support documentation. Open
[the installation link](https://aka.ms/JoinARMMCP)
when VS Code requires interactive registration, then sign in with the Azure
identity whose permissions should apply.

### Pricing and cost tools

The cost-estimate subagent uses an exact read-only allowlist:

| Tool | Use |
| --- | --- |
| `get_retail_prices` | Public retail catalog rows for planned resources |
| `query_costs` | Actual costs for an authorized deployed scope |
| `query_aks_costs` | Actual AKS cost breakdown |
| `forecast_costs` | Forecast costs for a deployed scope |
| `list_dimensions` | Discover supported cost dimensions |
| `list_benefit_utilization` | Inspect reservation and savings-plan utilization |
| `get_benefit_recommendations` | Retrieve benefit recommendations |

`get_retail_prices` returns raw records. The subagent selects an unambiguous
meter and calculates totals from `retailPrice`, `unitOfMeasure`, quantity, and
explicit usage. It deduplicates identical queries and fails closed when a meter
or usage assumption is ambiguous.

Deployment, resource mutation, and budget creation are outside the cost subagent's
permitted scope. Do not treat server registration as approval for those operations.

### Migration limitations

The official server replaces the former custom Python pricing server. APEX no
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
`npx -y @azure/mcp@2.0.5 server start` in `.vscode/mcp.json`. This avoids installing an Azure extension
pack and its unrelated transitive extensions.

Agents use it for governance discovery, Azure service inspection, Microsoft
Learn searches, and Azure Terraform guidance. It uses Azure CLI or managed
identity credentials as supported by the server.

## Other servers

| Server | Transport | Purpose |
| --- | --- | --- |
| GitHub MCP | HTTP | Repository, issue, and pull-request context |

Architecture diagrams are generated locally through the `apex-python-diagrams` skill,
not through MCP. Terraform provider and module metadata comes from the public
Terraform Registry API; initialized provider schemas come from Terraform CLI.

## Verification

Run the configuration validator:

```bash
npm run lint:mcp-config
```

In VS Code, run **MCP: List Servers**, select
`azure-resource-manager-mcp`, and restart it after configuration changes. In
Chat's tool picker, verify that `get_retail_prices` appears. Optional Cost
Management and pricing toolsets are requested by the configuration header.
Actual tool availability still depends on the server and client session.

## Authentication

| Server | Authentication |
| --- | --- |
| Azure Resource Manager MCP | Signed-in VS Code Azure identity for scoped tools; retail prices are public |
| Azure MCP server | Azure CLI or managed identity |
| GitHub MCP | Client-managed GitHub authentication |
| Public Terraform Registry lookups | No Azure credentials required |

Authentication and authorization failures must be surfaced to the user. Agents
must not fall back to remembered prices or expose tokens, tenant details, or
other credentials.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| ARM MCP tools are missing | Install through `https://aka.ms/JoinARMMCP`, then restart the server |
| Cost tools are missing | Compare `x-mcp-toolset` with the pinned `CostManagement, Pricing` configuration |
| Azure scope is denied | Sign in with an identity that has the required read permissions |
| Retail query returns many rows | Add ARM SKU, region, meter, price-type, or currency filters |
| Configuration is rejected | Run `npm run lint:mcp-config` and compare `.vscode/mcp.json` |

Final estimates should still be reviewed against the
[Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
before committing a budget.
