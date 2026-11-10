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

## Retail evidence and estimates

### Reproducible retail pricing

The pricing worker resolves which product and billing rules apply. Deterministic helpers capture the evidence,
validate native meters and calculate the amounts. New monthly outputs use `cost-estimate-v2`.
Each component must match its source product, SKU, billing region, currency, unit, tier and timestamp.
A matching meter ID and an internally consistent total are not enough.
The parent retains the original request independently of the result. Preflight freezes its raw hash and normalized
scope; publication and current validation require that original request. A draft cannot authorize changed quantities
by recomputing its own hashes. Assessment cost/register imports retain the original request path and hash separately.

Preflight checks required usage before network calls. Examples include stored GB, operations, transfer direction
and whether usage covers each instance or all instances together. Unknown usage is not zero.
Logical subscription and environment attribution remain separate even when instances share one catalog query.

The worker reserves each query in a durable ledger and captures the actual MCP response bytes immediately.
Empty results and errors remain evidence. The supported capture helper can preserve an offloaded response exactly;
the worker does not manually reconstruct large JSON responses or copy unrelated files.
The ledger retains request identity, timestamps, hashes and failed attempts across interruptions.
A new chat or filename does not create a fresh allowance.

Azure MCP remains the primary retail source. The constrained public Retail Prices API fallback is available only
after an eligible recorded MCP failure. It retains tier boundaries that the MCP projection may omit.
Failed or incomplete pages never become ready evidence, and every attempted request still counts.

Replaying the same request against the same current evidence requires no new pricing requests.
Changed quantities require recalculation; changed rates, units, scope or stale evidence invalidate reuse.
Historical output can be inspected with explicit legacy audit, but audit does not make it current.
The supported outcome is a verified reproducible result or a precise blocker, not guaranteed API availability.

### Indicative rates with unknown monthly usage

When the owner requests per-unit rates rather than a monthly total, the parent sets `purpose: "rate-quote"`
and supplies a distinct output path. The same pricing worker returns `retail-rate-quote-v1`.
It retains native units, applicable tier bands and source evidence without assuming monthly consumption.
TB and Tb are different units. Any conversion must state its meaning and basis.

A complete rate quote has no monthly or yearly workload total and cannot update manifest prices.
It does not satisfy Architecture's complete-estimate gate or approve spending or deployment.
The original monthly estimate remains blocked until its required usage and applicability are resolved.

### Product documentation is not raw retail evidence

Exact-byte capture applies to native retail API responses, not entire commercial pricing or product pages.
For billing inclusions and exemptions, retain the actual source URL, retrieval timestamp and title, a short
original billing conclusion, the exact applicability conditions and unresolved limitations.
The parent supplies these references to the pricing worker; a full-page archive is not a pricing or review prerequisite.
Unknown applicability remains a gap, never evidence that a charge is free. Documentation does not supply retail rates.

Necessary full-text research captures stay in an authorized private location outside the repository by default.
Git attributes preserve artifact bytes without line-ending normalization so staged retail evidence keeps its hashes.
Public access does not establish redistribution permission. Any proposed redistribution needs the actual source,
applicable license or permission, and attribution. A Learn documentation license does not automatically cover a
commercial pricing page.

For an existing review-bound full-page copy, obtain owner authorization to preserve the original privately and replace
the repository copy with a clearly labelled provenance notice or original summary. Keep its original digest and any
unknown source/date explicit. Historical review records remain unchanged; changed evidence requires affected-owner
revalidation and independent review under existing allowances before current approval.
Do not silently remove protected inputs, restamp old reviews, reset allowances or infer renewed approval.

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
