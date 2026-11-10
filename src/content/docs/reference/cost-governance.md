---
title: "Cost governance"
description: "Budget alerts, forecasts, and cost anomaly detection"
---

## Why cost governance is mandatory

The deployment requirements on this page apply when implementation is separately
authorized. A [standalone assessment](/concepts/workflow/#standalone-waf-assessment)
reports findings and cost evidence without creating budgets or changing resources.

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

## Assessment costs and proposed recurring changes

The standalone cost report keeps actual spend, API forecasts and retail estimates
separate. Architect owns authorized Cost Management Query and Forecast operations;
the pricing subagent remains retail-only. Neither a helper command nor assessment
acceptance grants billing access.

`03-cost-management-report.md` and `contracts/03-cost-management.json` retain
historical billing evidence, coverage and exclusions. Unavailable billing,
utilization or pricing remains partial or Not assessed, never zero or an invented
saving. A retail subtotal is not the workload's actual bill. See the pinned
[assessment cost contract](https://github.com/jonathan-vella/apex/blob/3d027d41810e33c0d2f08b17ed18f7adf2f21e3a/.github/skills/apex-azure-cost-optimization/references/assessment-cost-contract.md).

Retail-derived register bases retain a separate project-relative path and SHA-256
for the original pricing request. The validator checks that request with captured
responses, preflight binding and the request ledger. Rehashing an estimate does
not replace the original request. A rate-only quote cannot support a monthly
total.

The [Assessment Action Register](/concepts/workflow/#assessment-bundle-and-action-register)
models proposed recurring changes separately:

- An upgrade contributes proposed cost minus current cost on a comparable basis.
- A new service contributes its gross recurring addition.
- A supported saving contributes a negative amount. A negative upgrade delta is
  already a saving and is not negated again.
- An evidenced action with no recurring change contributes zero. Unknown or
  unquantified impact is null, not zero.

For each compatible scenario, currency and comparison basis, the summary shows
positive additions, the magnitude of negative savings and estimated net monthly
change. Net change is additions minus savings, not a new invoice total or a
realized saving. An entirely unquantified scenario has no numeric total. Label a
quantified subset when other material actions remain unknown or excluded.

Do not combine currencies, incompatible periods, tax treatments or cost views.
Keep negotiated actual baselines separate from retail reference projections.
Record usage, regions, dates, normalization, licensing and discount assumptions.
One-time implementation and labor costs stay separate from recurring totals.
Conditional recommendations remain outside the base headline until a named
scenario states their conditions.

Reference a cost-report opportunity once in the register's scenario ledger.
Do not add it again as an independent saving. Resolve overlapping shutdown,
rightsizing, commitment and replacement benefits; mutually exclusive alternatives
cannot share a scenario.

The Node calculator derives the values that both Markdown and Excel display.
Change source evidence or structured inputs, then regenerate and validate both
views. Manual workbook edits do not update the source, certify implementation or
authorize remediation, purchases, Governance or deployment.

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
