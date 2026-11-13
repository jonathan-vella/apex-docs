---
title: "Five-pillar WAF posture"
description: "Bounded Well-Architected Framework pillar scores, control-only rubric rules, and policy compliance observations across four brownfield Azure subscriptions."
---

`03-Architect` evaluated the four-subscription snapshot against a reproducible check catalog (`56` applicable workload-control checks across the five Azure Well-Architected Framework pillars). Unverified runtime checks were excluded from the score denominator rather than counted as zero, and any pillar with fewer than two observed workload controls remained `Not assessed`.

## Bounded scoring rubric

Each applicable workload-control check receives one of four states from the scalar evidence:

- **Observed passing (`1.0` point).** Control-plane configuration directly satisfies the check (for example, `httpsOnly: true`, `allowSharedKeyAccess: false`, or `azureADOnlyAuthentication: true`).
- **Intentional lab trade-off (`0.5` points).** An explicitly declared hackathon simplification is confirmed in configuration (for example, single-instance `P0v3` without zone redundancy or `Standard_LRS` blob durability).
- **Observed risk (`0.0` points).** Configuration or telemetry exposes an unmitigated gap or drift (for example, missing declared shared Bastion, an unattributed Key Vault using legacy access policies, or historical billed groups absent from live inventory).
- **Unknown (excluded from score).** Authorized scalar reads cannot prove runtime behavior, data-plane RBAC grants, restore execution, or licensing entitlement.

Collecting billing views or forecast tables counts as assessment data availability, not as a passing workload cost control. Coverage confidence maps observed checks divided by total applicable checks into `High` (`70%` or above), `Medium` (`35%` to `69%`), and `Low` (below `35%`).

## Pillar score summary

![Bounded WAF pillar scores and 100% stacked control evidence coverage chart across Security, Reliability, Performance Efficiency, Cost Optimization, and Operational Excellence](/showcases/waf-assessment/02-waf-posture.svg)

[Open full-size SVG](/showcases/waf-assessment/02-waf-posture.svg)

| Pillar | Status | Score | Observed / total checks | Passing | Trade-off | Risk | Unknown | Confidence |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Security | Scored | `7.3 / 10` | `11 / 18` (`61.1%`) | `8` | `0` | `3` | `7` | Medium |
| Reliability | Scored | `5.0 / 10` | `7 / 12` (`58.3%`) | `2` | `3` | `2` | `5` | Medium |
| Performance Efficiency | Scored | `5.0 / 10` | `5 / 9` (`55.6%`) | `2` | `1` | `2` | `4` | Medium |
| Cost Optimization | Not assessed | `N/A` | `1 / 4` (`25.0%`) | `0` | `0` | `1` | `3` | Low |
| Operational Excellence | Scored | `5.7 / 10` | `7 / 13` (`53.8%`) | `4` | `0` | `3` | `6` | Medium |

## Pillar-by-pillar evidence findings

### Security (`7.3 / 10`, Medium confidence)

In Member 01 (`rg-university-cijshn`), the web app enforces `httpsOnly: true` and HTTP/2. SQL Managed Instance enforces `azureADOnlyAuthentication: true`. Storage disables public network access and shared keys, ACR disables public access and its admin account, Service Bus disables public access and local SAS authentication, Key Vault enables RBAC and soft delete, and all four private endpoint connections report `Approved`.

Three observed risks and seven unknowns bound the pillar score:

- **Public web ingress (`F07`).** `app-university-cijshn` has `publicNetworkAccess: Enabled` per the hackathon brief, which requires reconciliation against assumed corporate landing-zone guardrails and missing WAF or edge authentication.
- **Unattributed access-policy Key Vault (`F08`).** `azmig-demo4559kv` in Member 02 (`rg-azmig-swc01`) uses vault access policies instead of Azure RBAC.
- **Missing shared Bastion (`F16`).** The brief declares developer access through a shared Azure Bastion, but zero Bastion hosts exist in the Shared subscription. A separate `bas-datacenter` exists in Member 01 (`rg-datacenter`), without verified target routing or operator access to `vm-dev01`.
- **Null Key Vault purge flag (`F06`).** The safe scalar projection returned `null` for `kv-university-cijshn` purge protection; disabled purge protection remains a user declaration rather than an observed false boolean.
- **Unverified runtime grants (`F01`, `F12`, `F14`).** Private DNS resolution from `snet-app`, data-plane role assignments, minimum TLS enforcement on every endpoint, and policy exemptions remain unverified.

### Reliability (`5.0 / 10`, Medium confidence)

Reciprocal VNet peerings (`vnet-hub` to `vnet-datacenter` and `vnet-hub` to `vnet-spoke`) report `Connected`, and `sbns-university-cijshn` reports zone redundancy enabled.

 Intentional lab trade-offs and readiness gaps account for the `5.0` score:

- **Single-instance compute and local redundancy (`F04`, `F05`).** `asp-university-cijshn` runs a single non-zonal `P0v3` instance, `stuniversitycijshn` uses `Standard_LRS`, and `sqlmi-university-cijshn` is non-zonal.
- **Partial SQL MI backup signal (`F05`).** Azure Resource Graph legacy `storageAccountType` reports `LRS` on `sqlmi-university-cijshn`, while dedicated current and requested backup-redundancy properties returned empty. No point-in-time restore test was authorized or observed.
- **Missing member spokes and untested cutover (`F02`, `F03`).** Member 02 and Member 03 contain no `rg-spoke` resource group, so simultaneous three-team lab readiness is not established. Managed Instance Link replication health and the under-one-hour registrar cutover target remain untested.

### Performance Efficiency (`5.0 / 10`, Medium confidence)

Hourly CPU telemetry was available for `asp-university-cijshn` and `sqlmi-university-cijshn`. However, the legacy VM metric series contained only `50` October hourly samples and `22` November month-to-date samples (missing hours are treated as uncollected intervals, not zero utilization). In Member 02, an unattributed `B1` App Service plan (`asp-cp-harness-01-dev`) recorded a `100%` hourly maximum CPU sample (`F13`), flagged for owner follow-up rather than automatic resizing.

### Cost Optimization (`Not assessed`, Low confidence)

Although `ActualCost`, `AmortizedCost`, and resource-group billing series were collected across all four subscriptions, initial Challenger review (`458f7755`) caught that billing data collection is an assessment input, not a workload cost-governance control. When restricted to workload controls, only `1` of `4` checks was observed:

1. **Lifecycle and attribution drift (`C043` / `F11`, observed risk).** Several October-billed resource groups (`rg-datacenter` in Member 02 and Member 03, `rg-spike-b06`, `rg-university-krafo6`, and others) no longer exist in live inventory, preventing clean factory-only cost attribution.
2. **Azure Hybrid Benefit entitlement (`C045` / `F09`, unknown).** `sqlmi-university-cijshn` sets `licenseType: BasePrice`, but Software Assurance core entitlement and allocation records are outside Azure scalar state.
3. **Post-cutover VM deallocation (`C046` / `F10`, unknown).** Both `vm-app01` and `vm-dev01` (`Standard_D8as_v6`) were running during collection, and cutover completion is unverified.
4. **Budget cap and cost owners (`C047`, unknown).** Neither a monthly budget cap nor accountable cost owners were supplied.

With only one observed check (`1/4`, below the two-check minimum), `03-Architect` marked Cost Optimization `Not assessed` instead of manufacturing a score.

### Operational Excellence (`5.7 / 10`, Medium confidence)

`appi-university-cijshn` links to the shared `log-management` workspace and enabled action groups exist in scope, but alert recipient delivery, diagnostic category completeness, guest OS and SQL Server build versions (`F15`), and regional differences across `westus2` and `northeurope` (`F17`) require owner verification.

## Scoped Azure Policy compliance state rows

Within the permitted `policy` category, `03-Architect` queried subscription-scoped policy compliance states (including inherited assignment references where exposed to the subscription reader). These counts represent raw policy-state evaluation rows, not distinct non-compliant resources or a Step 3.5 Governance discovery run:

| Subscription role | Synthetic subscription ID | Total policy-state rows | Rows marked `NonCompliant` |
| --- | --- | ---: | ---: |
| Shared | `00000000-0000-4000-8000-000000000001` | `67` | `15` |
| Member 01 | `00000000-0000-4000-8000-000000000002` | `338` | `43` |
| Member 02 | `00000000-0000-4000-8000-000000000003` | `283` | `77` |
| Member 03 | `00000000-0000-4000-8000-000000000004` | `51` | `11` |
| **Total across 4 scopes** | | **`739`** | **`146`** |

Policy definitions, parameter values, `DeployIfNotExists` identity permissions, and active exemptions were outside the standalone assessment read boundary (`F14` / `A14`). Compare this read-only observation model with full management-group policy reconciliation in [Policy reconciliation and lab risk contract](/showcases/coe-archetype/governance-and-risk/).
