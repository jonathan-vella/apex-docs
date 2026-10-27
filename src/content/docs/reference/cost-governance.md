---
title: "Cost governance"
description: "Budget alerts, forecasts, and cost anomaly detection"
---

## Why cost governance is mandatory

Every IaC deployment in this project **must** include cost monitoring resources.
This is enforced by `iac-bicep-best-practices.instructions.md`
and `iac-terraform-best-practices.instructions.md`, which apply to
all `.bicep`, `.tf`, and implementation plan files.

Required reviews check the cost-monitoring contract. Do not infer complete coverage
from CI or a source scan; verify the approved scope and deployed configuration.

## Budget alert setup

Every deployment implements the governed cost-monitoring contract: a
scope-appropriate Azure Budget, actual and forecast notifications, Action Group
routing, and anomaly detection. Governance constraints override repository
defaults.

The canonical contract and implementation examples are maintained in one place:

- [Cost monitoring baseline](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-defaults/references/cost-alerts-baseline.md)
- [Bicep implementation](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-defaults/references/cost-alerts-bicep.md)
- [Terraform implementation](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-defaults/references/cost-alerts-terraform.md)

Budget amounts and notification recipients remain parameters. Do not copy
thresholds or notification blocks into documentation; the canonical contract
changes independently of this guide.

## Per-environment budgets

Use parameterised budgets that scale by environment:

| Environment | Typical Budget | Rationale                       |
| ----------- | -------------- | ------------------------------- |
| `dev`       | Low            | Minimal resources, short-lived  |
| `staging`   | Medium         | Production-like but limited use |
| `prod`      | Full           | Production workload capacity    |

Set the budget amount via `.bicepparam` or `terraform.tfvars`,
never hardcode it in the template.

<span id="azure-resource-manager-mcp-tools"></span>

## Azure MCP pricing tool

The **cost-estimate-subagent** uses only the Azure MCP `pricing` tool during architecture review and
as-built documentation:

| Tool | Purpose |
| --- | --- |
| `pricing_get` | Query public retail catalog rows, with optional savings-plan data |

The subagent calculates estimates from returned meter units and explicit usage. It has no deployment,
resource mutation, or budget creation tools. Actual-cost and forecast queries belong to the
`apex-azure-cost-optimization` skill, which uses the authenticated Azure Cost Management Query and
Forecast REST APIs (`az rest`).

The **Microsoft Learn documentation tools** (exposed through the Azure MCP
`documentation` router, e.g. `mcp_azure-mcp_documentation` with
`command: "microsoft_docs_search"`) are used for looking up service-specific
pricing documentation.

## Repeatability rules

The cost governance instruction enforces **zero hardcoded values**:

- `projectName` must be a parameter with no default
- All tag values must reference parameters
- Budget amounts must be parameterised
- `.bicepparam` / `terraform.tfvars` is the only place for project defaults

## Adversarial review checklist

The Challenger reviews verify two mandatory cost categories:

**Cost Monitoring:**

- [ ] Budget resource exists
- [ ] Notifications comply with the governed cost-monitoring contract
- [ ] Anomaly detection configured
- [ ] Notification recipients are parameterised

**Repeatability:**

- [ ] No hardcoded project names or values
- [ ] `projectName` is a required parameter
- [ ] Target scope, region, permissions, and service availability match the approved plan

## Post-deployment validation

After deployment, verify budget alerts are active:

```bash
# List budgets in the resource group
az consumption budget list \
  --resource-group rg-${PROJECT}-${ENV}

# Check budget notifications
az consumption budget show \
  --budget-name budget-${PROJECT}-${ENV} \
  --resource-group rg-${PROJECT}-${ENV}
```

---

:::tip[Further Reading]

- The mandatory IaC best-practices instructions
  (`.github/instructions/iac-bicep-best-practices.instructions.md` and `iac-terraform-best-practices.instructions.md`)
  define the required patterns. Glob matching alone does not prove runtime attachment
- **Reusable budget patterns** are available in the IaC pattern skills:
  - Bicep: `.github/skills/apex-azure-bicep-patterns/references/budget-pattern.md`
  - Terraform: `.github/skills/apex-terraform-patterns/references/budget-pattern.md`
- [MCP integration](/concepts/how-it-works/mcp-integration/)
- [Workflow](/concepts/workflow/)

  :::

## Related

- [Quickstart](/getting-started/quickstart/). install and run your first project
- [Workflow](/concepts/workflow/). how agents collaborate across steps
- [Troubleshooting](/guides/troubleshooting/). diagnose failed deploys
