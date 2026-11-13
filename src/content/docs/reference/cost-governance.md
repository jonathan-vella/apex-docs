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

## Assessment costs and proposed recurring changes

Standalone WAF assessments keep historical Azure billing, API forecasts, and retail catalog projections strictly separate:

- `03-Architect` queries authorized historical spend and current-month forecasts via Azure Cost Management Query and Forecast REST APIs (`az rest`), keeping `ActualCost` and `AmortizedCost` views and currencies separate rather than mixing them into one total.
- Under `assessment-bundle-v3` (`Visual charts: true`), `render-assessment-charts.py` generates `assets/03-cost-trends.svg` and `assets/03-cost-drivers.svg` embedded in `03-cost-management-report.md` alongside `contracts/03-cost-management.json`.
- When scoped evidence has no priceable resource (`Source: iac` with unknown SKUs or usage) and `assessment_exit=assessment_only` is selected, `03-Architect` writes `contracts/02-assessment-cost-status.json` (`"status": "NOT_ASSESSED"`) with no fabricated zero-dollar total or numeric chart, while still completing the independent `cost-feasibility` review.

See the pinned [assessment cost contract](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills/apex-azure-cost-optimization/references/assessment-cost-contract.md).

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

- [Quickstart](/getting-started/quickstart/) for setting up your first APEX repository
- [WAF assessment guide](/guides/waf-assessment/) for standalone Cost Management and action-register reports
- [Workflow overview](/concepts/workflow/) for delivery and assessment cost gates
- [Troubleshooting](/guides/troubleshooting/) for diagnosing pricing and deployment issues
