---
title: "Challenger closures and action register"
description: "Independent WAF and cost-feasibility Challenger review closures, 2,321-cell workbook reconciliation, retained advisory findings, and the 18-item action register."
---

Before an operator can accept a standalone assessment bundle, `01-Orchestrator` runs two independent one-shot review lenses through `challenger-review-subagent`: a `comprehensive` architecture review on `02-architecture-assessment.md` and a `cost-feasibility` review on `03-cost-management-report.md`. Every review receives SHA-256 hashes of all supporting evidence files so stale or edited artifacts cannot pass silently.

## Independent Challenger review cycles

### WAF architecture review (`2 / 2` passes, `APPROVED`)

The initial `comprehensive` pass returned `NEEDS_REVISION` with four `should_fix` findings, all repaired before closure:

| Initial finding ID | Category | Issue caught by `challenger-review-subagent` | Repair verified in closure pass |
| --- | --- | --- | --- |
| `458f7755` | Cost Optimization | Scored Cost Optimization at `7.5 / 10` by counting three collected billing/forecast reports (`C040` to `C042`) as passing workload controls. | Excluded assessment-data availability from control denominators; marked Cost Optimization `Not assessed` (`1/4` observed workload controls, `Low` confidence) and regenerated `02-waf-posture.svg`. |
| `ec0bb711` | Reliability | Made SQL MI backup verification (`A05`) conditional on production objectives and dependent on the `A02` timed cutover test. | Split baseline backup-evidence verification (`A05`, unconditional) from conditional production resilience (`A18`), removing the `A02` dependency on `A05`. |
| `fb42926e` | Security | Listed only the web app, SQL MI, and Storage on `A01`, omitting ACR, Key Vault, Service Bus, and the four private endpoints. | Linked all `10` evidenced resources (`app`, `sqlmi`, `st`, `cr`, `kv`, `sbns`, and `4` private endpoints) to `A01` in JSON, Markdown, and `.xlsx`. |
| `6c310e67` | Performance Efficiency | Described the saturated `B1` plan (`asp-cp-harness-01-dev`) as having an "unrelated owner" when ownership was unknown. | Replaced unsupported ownership claims with `unattributed` and flagged owner identification in `A13`. |

The closure pass (`challenge-findings-architecture-closure.json`) returned `APPROVED` (`0` `must_fix`, `1` `should_fix`), retaining advisory finding `d377058c`: checks `C031`, `C032`, `C033`, and `C051` in Performance Efficiency and Operational Excellence still reflect metric and policy-state observation availability inside the `5/9` and `7/13` denominators.

### Cost-feasibility review (`3 / 3` passes, `APPROVED`)

After an initial worker execution failure and an operator-authorized single-pass extension receipt, the cost-feasibility lens audited `03-cost-management-report.md`, `03-amortized-cost-supplement.md`, `04-assessment-action-register.md`, and a deterministic **2,321-cell read-back** of `04-assessment-action-register.xlsx`.

`03-Architect` repaired empty-slice disclosures so Member 03's September query (`0` rows returned) is explicitly distinguished from Member 01's zero-dollar row (`0.00`), labeled the September-to-October delta (`$447.45`) as partial coverage, and verified exact workbook cell parity across all `18` actions and `3` scenario rows.

The closure pass (`challenge-findings-cost-estimate-closure-2.json`) returned `APPROVED` (`0` `must_fix`, `1` `should_fix`), retaining advisory finding `efb41a18`: the saved `03-cost-trends.svg` accurately displays the `NO ROWS` badge on Member 03 September, while the local project adapter script (`03-cost-trends.py`) expects legend text `'N/A (not assessed)'` instead of the shared renderer's `'Not assessed / throttled'`. Retaining both `d377058c` and `efb41a18` in the accepted bundle demonstrates APEX review integrity: advisory findings are preserved rather than erased.

## Complete 18-item nonbinding action register

All `18` actions (`A01` to `A18`, covering WAF findings `F01` to `F17`) carry status `Proposed - not started` and `Not quantified` monthly cost impact rather than unverified `$0.00` claims:

| Action ID | Finding | Priority | Disposition | WAF pillars | Proposed action and evidenced scope |
| --- | --- | --- | --- | --- | --- |
| `A01` | `F01` | High | `verification_followup` | Security, Reliability, Operations | Verify Private DNS resolution from `snet-app`, routing, identities, and data-plane grants across `app-university-cijshn`, `sqlmi-university-cijshn`, `stuniversitycijshn`, `cruniversitycijshn`, `kv-university-cijshn`, `sbns-university-cijshn`, and all `4` private endpoints (`Week 1`). |
| `A02` | `F02` | High | `production_readiness_gap` | Reliability, Operations | Validate Managed Instance Link replication health, timed under-one-hour registrar cutover, and documented rollback between `vm-app01` and `sqlmi-university-cijshn` (depends on `A01`; `Week 1`). |
| `A03` | `F03` | High | `verification_followup` | Reliability, Cost | Reconcile the three-member hackathon reference with live Member 02 and Member 03 inventories where `rg-spoke` is absent (`Week 1`). |
| `A04` | `F04` | Medium | `intentional_lab_tradeoff` | Reliability, Performance, Cost, Operations | Conditional on production HA requirements: evaluate scaling `asp-university-cijshn` beyond a single non-zonal `P0v3` instance after retail pricing and capacity checks (depends on `A03`; `Weeks 2-4`). |
| `A05` | `F05` | High | `verification_followup` | Reliability, Cost, Operations | Verify effective current backup storage redundancy on `sqlmi-university-cijshn` (where dedicated fields returned empty alongside the legacy `LRS` ARG signal) and review `stuniversitycijshn` recovery evidence (`Weeks 2-4`). |
| `A06` | `F06` | High | `intentional_lab_tradeoff` | Security, Reliability, Operations | Confirm the actual `enablePurgeProtection` setting on `kv-university-cijshn` (null in safe scalar projection) against teardown requirements and tenant guardrails (`Week 1`). |
| `A07` | `F07` | High | `verification_followup` | Security | Reconcile public HTTPS ingress on `app-university-cijshn` with effective tenant policy, exception authority, and edge authentication requirements (`Week 1`). |
| `A08` | `F08` | Medium | `verification_followup` | Security | Identify the owner of unattributed `rg-azmig-swc01` and review migrating `azmig-demo4559kv` from vault access policies to Azure RBAC (`Weeks 2-4`). |
| `A09` | `F09` | High | `verification_followup` | Cost, Operations | Verify Software Assurance SQL Server core entitlement and allocation backing `licenseType: BasePrice` on `sqlmi-university-cijshn` (`Week 1`). |
| `A10` | `F10` | Medium | `verification_followup` | Cost, Operations, Reliability | Conditional on validated cutover (`A02`): assess deallocating running `Standard_D8as_v6` VMs (`vm-app01` `$16.24` Oct VM spend; `vm-dev01` `$16.22` Oct VM spend), noting disks and IPs continue billing (`Weeks 2-4`). |
| `A11` | `F11` | Medium | `verification_followup` | Cost, Operations | Reconcile the nine October/November-billed resource groups absent from live inventory without assuming orphan cleanup authority (`Weeks 2-4`). |
| `A12` | `F12` | Medium | `verification_followup` | Operations, Security | Verify diagnostic category coverage, alert routing, and accountable recipient delivery for `app-university-cijshn` without exposing personal addresses in assessment artifacts (`Weeks 2-4`). |
| `A13` | `F13` | Medium | `verification_followup` | Performance | Identify the owner of `rg-cp-harness-01-dev` and inspect memory, latency, and sustained load on `asp-cp-harness-01-dev` (`B1` plan with `100%` max CPU sample; `Weeks 2-4`). |
| `A14` | `F14` | Medium | `verification_followup` | Operations, Security | Review the `146` `NonCompliant` subscription-scoped policy-state rows with policy owners to determine effective enforcement and exemptions (`Weeks 2-4`). |
| `A15` | `F15` | Medium | `verification_followup` | Operations, Security | Inventory guest OS, SQL Server, and .NET runtime versions on `vm-app01` and `app-university-cijshn` through authorized metadata checks (`Weeks 2-4`). |
| `A16` | `F16` | High | `verification_followup` | Security, Operations | Reconcile the missing shared-subscription Azure Bastion against the declared developer path to `vm-dev01` and verify whether `bas-datacenter` in Member 01 is intended (`Week 1`). |
| `A17` | `F17` | Medium | `verification_followup` | Operations | Review `northeurope` (`16` resources) and `westus2` (`8` resources) placements plus `eastus` RG metadata against the `swedencentral` / `germanywestcentral` regional preferences (`Weeks 2-4`). |
| `A18` | `F05` | High | `intentional_lab_tradeoff` | Reliability, Cost, Operations | Conditional on production objectives: evaluate ZRS/GZRS storage and geo-redundant SQL MI backups once recovery targets and change authority are established (depends on `A05`; `Weeks 2-4`). |

## Analytical scenario grouping

The action register models three analytical scenarios without claiming monetized savings:

- **Nonbinding verification baseline (`15` actions included, `3` excluded).** Includes all unconditional verification items (`A01` to `A03`, `A05` to `A09`, `A11` to `A17`) while excluding conditional production and post-cutover changes (`A04`, `A10`, `A18`).
- **Conditional production-readiness discussion (`17` actions included, `1` excluded).** Adds `A04` (App Service redundancy) and `A18` (storage and SQL MI backup resilience), excluding post-cutover VM deallocation (`A10`).
- **Conditional post-cutover discussion (`16` actions included, `2` excluded).** Adds `A10` (post-cutover VM deallocation assessment after `A02`), excluding `A04` and `A18`.
