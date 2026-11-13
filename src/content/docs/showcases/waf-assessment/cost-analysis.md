---
title: "Actual and amortized cost analysis"
description: "Closed-month ActualCost and AmortizedCost series, empty-slice disclosures, Forecast API splits, and resource-group spend reconciliation across four subscriptions."
---

`03-Architect` collected read-only Azure Cost Management evidence across all four authorized subscriptions as of `2026-11-11T15:13:51.244Z`. The primary contract queried `ActualCost` (`PreTaxCost`) grouped by service and resource ID across September 2026, October 2026, November 1 to 11 month-to-date (MTD), and the November Forecast API window. A separate supplemental collection queried `AmortizedCost` across the same scopes and UTC windows without mixing or summing the two metrics.

## Subscription ActualCost and AmortizedCost summary

Returned rows across all four subscriptions used `USD` pre-tax. For the returned rows in this tenant snapshot, `ActualCost` and `AmortizedCost` matched to the cent before rounding (which does not prove that the tenant lacks reservations or savings plans).

| Subscription role | Synthetic ID prefix | September 2026 (USD) | October 2026 (USD) | November MTD (USD) |
| --- | --- | ---: | ---: | ---: |
| Shared | `00000000-...0001` | `<0.01` | `110.15` | `312.67` |
| Member 01 | `00000000-...0002` | `0.00` | `137.62` | `483.30` |
| Member 02 | `00000000-...0003` | `602.62` | `770.85` | `124.77` |
| Member 03 | `00000000-...0004` | `No rows` | `31.44` | `0.46` |
| **Returned-row subtotal** | | **`602.62` (partial)** | **`1,050.07`** | **`921.19`** |

Two data-hygiene rules govern this table:

- **Empty period versus observed zero.** Member 01's September query returned one USD billing row with amount `0.00`. Member 03's September queries (`ActualCost`, `AmortizedCost`, and resource-group view) succeeded at the API level but returned zero rows and no currency column. Its normalized contract inferred `USD` from Member 03's October rows, and the report marks September as `No rows` rather than an observed `$0.00` bill.
- **Partial month-over-month delta.** Subtracting the three-scope September subtotal (`$602.62`) from the four-scope October subtotal (`$1,050.07`) yields `$447.45`, which is a partial comparison across different row coverage rather than a complete four-subscription run-rate delta.

## Spend trends and non-additive Forecast API breakdown

![Subscription spend and Forecast API trend chart showing September, October, November MTD, and Forecast API bars with a NO ROWS badge on Member 03 September](/showcases/waf-assessment/03-cost-trends.svg)

[Open full-size SVG](/showcases/waf-assessment/03-cost-trends.svg)

The Azure Cost Management Forecast API returned two non-overlapping segments for November 2026: `Actual` for November 1 to 9 and `Forecast` for November 10 to 30. Because the separate November 1 to 11 MTD query (`$921.19`) overlaps November 1 to 9, the MTD query is never added to the Forecast API columns:

| Subscription role | Forecast API Actual (Nov 1 to 9) | Forecast API Projected (Nov 10 to 30) | Combined November outlook (USD) |
| --- | ---: | ---: | ---: |
| Shared (`00000000-...0001`) | `273.44` | `277.78` | `551.22` |
| Member 01 (`00000000-...0002`) | `425.92` | `408.08` | `834.00` |
| Member 02 (`00000000-...0003`) | `110.15` | `334.79` | `444.94` |
| Member 03 (`00000000-...0004`) | `0.25` | `22.95` | `23.20` |

During `AmortizedCost` collection, the Shared subscription forecast hit four HTTP `429` throttling responses from the CLI before succeeding on the fifth attempt (`12` physical CLI attempts total, all preserved in the provenance log).

## Why declared hourly rates could not be multiplied into savings

The operator brief supplied user-declared hourly reference figures (`$1.30/hr` shared hub, `$1.83/hr` modernized spoke, `$1.55/hr` legacy datacenter, or `$11.44/hr` for one hub plus three simultaneous member stacks). `03-Architect` refused to multiply those hourly figures against observed monthly spend because:

1. Three simultaneous active member stacks do not exist in the live estate.
2. Operating hours per resource group were not uniform (several lab resource groups were created and deleted mid-month).
3. Subscription subtotals include unattributed workloads such as `rg-arcbox-swc01` (`$273.71` in October) and historical deleted groups.

## Closed-month service cost drivers

The chart below was re-rendered cleanly from the sanitized `03-cost-management.json` contract via `render_cost_drivers()` in `tools/scripts/render-assessment-charts.py`, mapping the four synthetic subscription IDs to `Shared`, `Member 01`, `Member 02`, and `Member 03`.

![Horizontal bar chart of top October 2026 net ActualCost service drivers by subscription role and Azure service name](/showcases/waf-assessment/03-cost-drivers.svg)

[Open full-size SVG](/showcases/waf-assessment/03-cost-drivers.svg)

Aggregated across all four subscriptions, six Azure service families accounted for `$939.24` (`89.4%`) of October's `$1,050.07` returned spend:

| ServiceName dimension | October 2026 ActualCost (USD) | Share of October total | Primary contributing scopes |
| --- | ---: | ---: | --- |
| Azure Bastion | `306.85` | `29.2%` | Member 02 (`rg-arcbox-swc01` and historical `rg-datacenter`), Member 01 (`rg-datacenter`) |
| Virtual Machines | `190.89` | `18.2%` | Member 02 (`rg-arcbox-swc01` and historical groups), Member 01 (`vm-app01` `$16.24`, `vm-dev01` `$16.22`) |
| Storage | `152.01` | `14.5%` | Member 02 and Member 01 managed disks and storage accounts |
| Service Bus | `127.07` | `12.1%` | Member 02 historical university runs and Member 01 (`rg-university-cijshn`) |
| Azure Firewall | `106.87` | `10.2%` | Shared (`rg-hub`) |
| SQL Managed Instance | `55.55` | `5.3%` | Member 02 historical university runs and Member 01 (`rg-university-cijshn`) |

## Resource-group spend and lifecycle reconciliation

An independent 12-window Cost Management query grouped by `ResourceGroup` reconciled to the exact cent against the primary subscription-level `ActualCost` totals across all `11` subscription/period pairs that returned rows. Comparing billed resource groups with the `2026-11-11` live inventory exposed nine historical resource groups that billed in October or November MTD but no longer exist:

| Subscription | Resource group | October 2026 (USD) | November MTD (USD) | Live inventory status | Attribution |
| --- | --- | ---: | ---: | --- | --- |
| Shared | `rg-hub` | `107.40` | `310.20` | Observed (`12` resources) | Inferred reference; owner unknown |
| Shared | `rg-management` | `0.12` | `0.78` | Observed (`2` resources) | Declared shared |
| Shared | `Unlabeled` / other observed RGs | `2.64` | `1.70` | Mixed (`rg-apexe2e-dev-swc` absent) | Unattributed |
| Member 01 | `rg-datacenter` | `83.37` | `114.00` | Observed (`43` resources) | Inferred reference; owner unknown |
| Member 01 | `rg-university-cijshn` | `53.99` | `367.60` | Observed (`19` resources) | Inferred reference; owner unknown |
| Member 01 | `rg-spoke` | `Not returned` | `Not returned` | Observed (`10` resources) | Declared member spoke |
| Member 01 | `Unlabeled` | `0.26` | `1.70` | Not applicable | Unlabeled; owner unknown |
| Member 02 | `rg-datacenter` | `302.91` | `Not returned` | **Not observed** | Unattributed historical group |
| Member 02 | `rg-arcbox-swc01` | `273.71` | `93.62` | Observed (`58` resources) | Unattributed |
| Member 02 | `rg-university-krafo6` | `70.24` | `Not returned` | **Not observed** | Unattributed historical group |
| Member 02 | `rg-spike-b06` | `36.84` | `Not returned` | **Not observed** | Unattributed historical group |
| Member 02 | `rg-cp-harness-01-dev` | `35.51` | `29.37` | Observed (`33` resources) | Unattributed |
| Member 02 | `rg-university-f06nr8` | `23.34` | `Not returned` | **Not observed** | Unattributed historical group |
| Member 02 | `rg-university-m18f06` | `22.67` | `Not returned` | **Not observed** | Unattributed historical group |
| Member 02 | `rg-spike-b07` / `rg-autopilot-e2e-dev-swc` / `rg-azmig-swc01` / `rg-spoke` / `Unlabeled` | `5.62` | `1.77` | Only `rg-azmig-swc01` observed | Unattributed / historical |
| Member 03 | `rg-datacenter` | `31.44` | `Not returned` | **Not observed** | Unattributed historical group |
| Member 03 | `Unlabeled` | `0.00` | `0.46` | Not applicable | Unlabeled; owner unknown |

## Bounded retail sensitivity attempts

`03-Architect` also attempted two indicative retail pricing sensitivities (`A04` App Service `P0v3` one-to-two instance scale-out and `A09` SQL MI `BasePrice` versus `LicenseIncluded`). The App Service pricing worker exited before issuing any query due to an evidence-directory path conflict, and the SQL MI preflight stopped with an unsupported service-recipe error. Instead of guessing prices from model memory, APEX preserved both failure receipts and left all `18` action-register items `Not quantified`. For a completed pre-deployment retail pricing run on the same service stack, see [Architecture and retail pricing](/showcases/coe-archetype/architecture-and-pricing/).
