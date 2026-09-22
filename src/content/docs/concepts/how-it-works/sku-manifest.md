---
title: "SKU manifest"
description: "Single source of truth for creative Azure SKU decisions across environments and regions"
---

## What is the SKU manifest?

`agent-output/{project}/sku-manifest.{json,md}` is the per-project,
record of selected Azure SKUs, including App Service
plans, VMs / VMSS, SQL, Cosmos, AKS node pools, Redis, APIM, App
Gateway, and Storage replication tiers.

The JSON file is canonical; the markdown is a rendered view for human
review. Agents (CodeGen, Deploy, As-Built) read the JSON
programmatically. They never re-derive SKUs from artifact prose.

## Why a manifest?

The manifest records choices separately from narrative artifacts:

1. SKU choices previously lived in
   prose across `02-architecture-assessment.md`,
   `04-implementation-plan.md`, and IaC code. Drift between them was
   common.
2. Environments
   (dev/test/prod) and regions (primary + failover) get explicit shape
   without duplicating the whole assessment per env.
3. `cost-estimate-subagent` patches
   `cost_estimate_monthly_usd` per service via the same atomic-write
   discipline as governance constraints. This is not a transaction across all
   project artifacts. Architects must not substitute remembered prices.

## Scope: what belongs

In scope (`services[]`):

- App Service Plans / Web Apps / Function Apps
- VMs / VM Scale Sets
- SQL Database / Managed Instance
- Cosmos DB (where throughput is a SKU)
- AKS node pools (per-pool VM SKU)
- Redis Cache, API Management, Application Gateway
- Storage Account replication tier (LRS / ZRS / GRS / RA-GRS)

Explicitly **out of scope** (the exclude list):

bandwidth, Log Analytics, vnet, subnet, NSG, route table, public IP,
diagnostics. These remain documented in plan narrative; the coverage
validator treats SKU literals in these categories as legitimate
non-manifest entries.

## Lifecycle

| Step | Agent             | Action                                                              |
| ---- | ----------------- | ------------------------------------------------------------------- |
| 1    | `02-Requirements` | Rev 1 records user pins. `services[]` may be empty. |
| 2    | `03-Architect`    | Rev 2 authors choices from priced `candidate_sets[]`. |
| 3.5  | `04g-Governance`  | Emits findings against the manifest (read-only)                     |
| 4    | `05-IaC Planner`  | Rev 3 reconciles findings and checks `requires[]`. |
| 5    | `06b`/`06t`       | Reads JSON; resolves IaC via `iac_logical_names.{bicep\|terraform}` |
| 6    | `07b`/`07t`       | Pre-flight quota/region. Substitutions via block-with-escalation    |
| 7    | `08-As-Built`     | Bidirectional drift: manifest ↔ Azure ↔ IaC; writes `actual_sku`    |

Lifecycle status flows through `decisions.sku_manifest_status` in
session state:
`draft → reviewed → locked → deploying → deployed | drift`.

## User pins vs architect-derived

Every entry has a `source`:

- `user-pin` is a hard constraint the user volunteered at Step 1.
  Never auto-changed downstream. If a planner or deploy step needs to
  alter a pinned SKU, the workflow escalates to the Architect via the
  step-N → step-2 return edge.
- `architect-derived` identifies a choice by `03-Architect` at Step 2 from
  priced `candidate_sets[]`. Reconciled by the Planner at Step 4 for
  governance compliance; `source` stays `architect-derived`.
- `deploy-substitute` records a substitution at Step 6 when quota or
  regional capacity forces a change. Always paired with an
  `decisions.sku_overrides[]` entry recording the escalation
  resolution.

## Cost-estimate dual mode

`cost-estimate-subagent` accepts three exclusive input modes:

| Mode | Input              | Purpose                                                                |
| ---- | ------------------ | ---------------------------------------------------------------------- |
| A    | `resource_list`    | Back-compat per-resource list                                          |
| B    | `manifest_path`    | Per-service pricing **+ atomic `cost_estimate_monthly_usd` writeback** |
| C    | `candidate_sets[]` | A-vs-B comparison; emits `decisions[]`; **no writeback**               |

The Architect's workflow at Step 2 is:

1. Build `candidate_sets[]` of competing SKUs per decision.
2. Call cost-estimate in Mode C to price them.
3. Pick winners; compute `sla_achieved` from SKU + zonal + region.
4. Write rev 2 to the manifest.
5. Call cost-estimate in Mode B for deterministic price writeback.

## Block-with-escalation (step 6)

When pre-flight quota or regional SKU availability fails:

1. Deploy agent surfaces the conflict and available substitutes (via
   the `apex-azure-quotas` skill) to the human through the orchestrator.
2. The human chooses one of four `sku_conflict_resolution` enum values:
   `revert_to_plan` / `accept_substitute` / `change_region` / `abort`.
3. The workflow must expose an explicit abort option when the conflict remains unresolved.
4. On resolution, the deploy agent appends to `decisions.sku_overrides[]`
   as an array entry, not a dynamic key, and writes a new manifest revision
   with `source: "deploy-substitute"`.

## Validators

| Validator                   | Scope                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `validate:sku-manifest`     | Schema + semantic (unique IDs, monotonic revisions, env keys, stamps, allowlist cross-check, freshness) |
| `validate:sku-iac-coverage` | Bidirectional manifest ↔ IaC code (explicit SKU literals **plus** AVM module defaults)                  |
| `derive:sku-allowlist`      | Projects `04-governance-constraints.json` into the manifest's `sku_allowlist_snapshot`                  |

Both validators **hard-fail** on errors. The coverage validator runs
diff-aware in pre-push to keep CI fast. The legacy `.sku-manifest.skip` sentinel is a compatibility mechanism, not a
routine way to bypass a failed manifest check. Any exception needs explicit scope
and review.

## Governance allowlist projection

`04g-Governance` invokes `node tools/scripts/derive-sku-allowlist.mjs <project>`
after Step 3.5 (governance) discovery. The script translates Deny-effect policies with
`azurePropertyPath` ending in `.sku.name` / `.skuName` / `.sku_name` /
`.vmSize` into the manifest's `sku_allowlist_snapshot`. The downstream
validator cross-checks `services[].size` against the projection. The
derive script makes no change when re-run on unchanged input.

## Pricing freshness

`validate:sku-manifest` emits WARN when:

- `services[].cost_estimated_at` exceeds `APEX_SKU_PRICING_TTL_DAYS` (default 30 days)
- The manifest's `updated_at` exceeds `APEX_SKU_MANIFEST_TTL_DAYS` (default 90 days)

`cost-estimate-subagent` Mode B writeback patches both
`cost_estimate_monthly_usd` and `cost_estimated_at` per service,
keeping freshness deterministic.

## Multi-stamp manifests

Optional `stamps[]` top-level field lets a single workload describe
multiple independent deployments (per-tenant, per-region overlays).
Each stamp may pin different `regions[]`, an environment subset, and
sparse `service_overrides` (keyed by `services[].id`). Validator
checks uniqueness, environment subset, and service-id references.
When `stamps[]` is absent the manifest behaves as a single-stamp project.

## References

- Schema: `tools/schemas/sku-manifest.schema.json`
- Templates: `.github/skills/apex-azure-artifacts/templates/sku-manifest.template.{md,json}`
- Authoring rules: `.github/instructions/sku-manifest.instructions.md`
- Workflow DAG: `.github/skills/apex-workflow-engine/templates/workflow-graph.json`
  (Step 1 `produces`, Steps 2/4/6/7 `mutates`).
