---
title: "Architecture and retail pricing"
description: "Step 2 WAF trade-off assessment, Azure Retail Prices API verification at $1,320.95 per month, SQL MI Hybrid Benefit options, and post-cutover schedule savings."
---

In Step 2, `03-Architect` validated all five user-pinned SKUs in `swedencentral` and `germanywestcentral`, confirmed that Linux App Service `P0v3` supports regional VNet integration without requiring a larger Premium v3 tier, and delegated retail pricing to `cost-estimate-subagent` (`18` Azure Retail Prices API calls for the primary workload plus `2` license-comparison calls).

## Five-pillar WAF assessment (`6.4 / 10` composite)

The architecture optimizes **Security** inside a policy-enforced Corp landing zone while accepting **best-effort Reliability** for a non-production training kit where recovery means redeploying from Bicep:

![WAF pillar score chart for the university archetype showing Security 8, Reliability 4, Performance 6, Cost Optimization 7, and Operational Excellence 7](/showcases/coe-archetype/02-waf-scores.svg)

[Open full-size SVG](/showcases/coe-archetype/02-waf-scores.svg)

| WAF pillar | Score | Confidence | Key architectural drivers and accepted trade-offs |
| --- | ---: | --- | --- |
| Security | `8 / 10` | High | Private endpoints and `publicNetworkAccess: Disabled` on ACR, Storage, Service Bus, and Key Vault; SQL MI VNet-injected with Entra-only auth and public data endpoint off; single UAMI (`id-university-<suffix>`) with resource-scoped RBAC; local/shared-key auth disabled everywhere, including Application Insights (`DisableLocalAuth: true`). Public web app has no WAF or Easy Auth (scoped to app code in `B06`/`B10`). |
| Reliability | `4 / 10` | High | Intentional lab posture: single-instance `P0v3` web plan (`zoneRedundant: false`), non-zonal SQL MI `GP_Gen5` with `Local` backup redundancy, and `Standard_LRS` storage. ACR Premium and Service Bus Premium receive platform-automatic zone redundancy in `swedencentral` at no extra cost. |
| Performance Efficiency | `6 / 10` | Medium | Single `P0v3` instance with `alwaysOn: true` and 4-vCore SQL MI comfortably serve fewer than `50` concurrent demo users; private endpoints keep data-plane traffic inside the spoke without firewall hairpinning. After `C7`, stopping SQL MI overnight adds a ~20-minute morning startup window. |
| Cost Optimization | `7 / 10` | Medium | On-demand consumption (no reservation lock-in for teardown labs), SQL MI Azure Hybrid Benefit (`-$291.90/month` vs license-included), free native SQL MI `startStopSchedules` (`-$314.32/month` after `C7`), and inherited landing-zone budget (`budget-factory-workload`). Premium Service Bus and ACR tiers are forced by private-endpoint policy rather than throughput. |
| Operational Excellence | `7 / 10` | Medium | Subscription-scope Bicep with pinned AVM modules, three human inputs, fail-closed PowerShell 7 preflight checks, ordered post-deploy readiness probes (MCR HTTP 200, ACR import, UAMI pull from private ACR, Kudu DNS verification), and explicit `AllMetrics` diagnostic settings on the four private endpoints, App Service plan, and Storage account. |

## Retail cost breakdown (`$1,320.95/month`, `~$1.81/hour`)

All line items below come verbatim from `cost-estimate-subagent` queries against `get_retail_prices` in `swedencentral` (`730` hours/month; `30.4167` days/month for daily ACR meters; Global billing region for Private Link):

| Category | Service | Retail meter and unit rate | Monthly quantity | Estimated monthly USD | Share |
| --- | --- | --- | --- | ---: | ---: |
| Messaging | Service Bus | Premium Messaging Unit (`$0.9275/hour`) | `1 MU x 730 h` | `$677.08` | `51.3%` |
| Data Services | SQL Managed Instance | General Purpose Compute Gen5 4 vCore (`BasePrice` AHB, `$0.669756/hour`) | `1 instance x 730 h` | `$488.92` | `37.0%` |
| Compute | App Service Plan | Linux `P0v3` App (`$0.089/hour`) | `1 instance x 730 h` | `$64.97` | `4.9%` |
| Containers | Container Registry | Premium Registry Unit (`$1.6666/day`) | `1 unit x 30.4167 d` | `$50.69` | `3.8%` |
| Networking | Private Link | Standard Private Endpoint (`$0.01/hour`) + data processed (`$0.01/GB` in/out) | `4 x 730 h` + `5 GB in / 5 GB out` | `$29.30` | `2.2%` |
| Data Services | SQL Managed Instance | General Purpose Data Stored (`$0.13685/GB-month`) | `64 GB` | `$8.76` | `0.7%` |
| Data Services | Storage Account | `StorageV2` Hot `Standard_LRS` (`10 GB`, `100K` writes, `1M` reads) | `10 GB` + ops | `$1.08` | `0.1%` |
| Security | Key Vault | Standard Operations (`$0.03 / 10K` operations) | `50K` operations | `$0.15` | `<0.1%` |
| Data Services | SQL Managed Instance | PITR Backup LRS Data Stored (`$0.119/GB-month`, within included allowance) | `0 billable GB` | `$0.00` | `0.0%` |
| **Workload total** | | **1.1% below the `$1.83/hour` (`~$1,336/month`) brief target** | | **`$1,320.95`** | **`100.0%`** |

Deploying the identical manifest into the approved alternate region (`germanywestcentral`) prices at **`$1,321.05/month`** (`+$0.10/month`). Variable charges incurred in the shared services subscription (`2 GB` Application Insights ingestion into `log-management` at `$2.99/GB = $5.98` plus `5 GB` `afw-hub` Standard firewall processing at `$0.016/GB = $0.08`, subtotal **`$6.06/month`**) are reported separately so workload and hub budgets stay distinct.

![Monthly cost distribution chart showing Service Bus Premium at 51.3% and SQL Managed Instance at 37.7% of the $1,320.95 monthly total](/showcases/coe-archetype/03-des-cost-distribution.svg)

[Open full-size SVG](/showcases/coe-archetype/03-des-cost-distribution.svg)

## Policy-driven cost structure (`57.3%` private-access floor)

In an ALZ-lite Corp landing zone, Azure Policy rules set the minimum cost floor regardless of traffic volume:

- **Service Bus Premium (`$677.08/month`), ACR Premium (`$50.69/month`), and four Private Endpoints (`$29.30/month`)** combine for **`$757.07/month`** (`57.3%` of total spend). Basic and Standard tiers on Service Bus and ACR cannot attach private endpoints and would fail `mg-factory-corp` Deny policies on deployment.
- **Event teardown remains the primary cost lever.** Because every fixed meter in this design bills hourly or daily with zero reservation commitment, deleting `rg-university-<suffix>` between training cohorts drops workload spend to `$0.00/hour`.

## SQL MI licensing and post-cutover weekday schedule matrix

`cost-estimate-subagent` priced four combinations of SQL MI licensing (`BasePrice` Azure Hybrid Benefit versus `LicenseIncluded`) and operating hours (`730` hours/month 24x7 pre-cutover versus `260.7` hours/month Mon to Fri `07:30` to `18:30` post-cutover):

| SQL MI compute and license option | Billable hours / month | Compute + license / month | Delta vs selected 24x7 baseline | Operational condition |
| --- | ---: | ---: | ---: | --- |
| **AHB (`BasePrice`), 24x7** | `730.0` | **`$488.92`** | Baseline | **Selected pre-C7 baseline** (MI link active; partner holds eligible SQL Server cores with Software Assurance). |
| License-included (`LicenseIncluded`), 24x7 | `730.0` | `$780.82` | `+$291.90/month` | Fallback if SQL Server license entitlement is not confirmed (`az sql mi update --license-type LicenseIncluded`). |
| **AHB (`BasePrice`), Mon to Fri `07:30` to `18:30`** | `260.7` | **`$174.61`** | **`-$314.32/month`** | **Post-C7 steady state** once the Managed Instance Link from `vm-app01` is removed (`ADR-0008`). |
| License-included, Mon to Fri `07:30` to `18:30` | `260.7` | `$278.85` | `-$210.07/month` | Post-C7 steady state without Azure Hybrid Benefit. |

![Cost projection chart comparing 24x7 pre-cutover spend at $1,320.95/month against post-C7 scheduled SQL MI spend saving $314.32/month](/showcases/coe-archetype/03-des-cost-projection.svg)

[Open full-size SVG](/showcases/coe-archetype/03-des-cost-projection.svg)

While SQL MI is stopped overnight and on weekends after `C7`, compute and SQL licensing stop billing (`$0.00/hour`), while the `64 GB` General Purpose storage meter (`$8.76/month`) continues billing.
