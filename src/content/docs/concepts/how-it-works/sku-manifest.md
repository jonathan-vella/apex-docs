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

| Step | Agent | Action |
| --- | --- | --- |
| 1 | `02-Requirements` | Revision 1 records optional partial `user-pin` SKUs and, for existing workloads, evidenced `observed-current` SKUs. `services[]` may remain empty after preference capture. |
| 2 | `03-Architect` | Revision 2 selects `architect-derived` SKUs from priced `candidate_sets[]` and writes back verified `cost_estimate_monthly_usd` values. |
| 3.5 | `04g-Governance` | Projects policy SKU allowlists (`derive-sku-allowlist.mjs`) and emits read-only compliance findings. |
| 4 | `05-IaC Planner` | Revision 3 reconciles governance findings, binds `iac_logical_names`, and cross-checks `requires[]`. |
| 5 | `06b-Bicep CodeGen` / `06t-Terraform CodeGen` | Reads `sku-manifest.json` directly so Bicep and Terraform modules match declared SKUs (`validate:sku-iac-coverage`). |
| 6 | `07b-Bicep Deploy` / `07t-Terraform Deploy` | Verifies quota and regional availability; any substitution requires block-with-escalation approval. |
| 7 | `08-As-Built` | Compares deployed Azure SKUs against the manifest in both directions and populates `actual_sku` by environment and region. |

Lifecycle status flows through `decisions.sku_manifest_status` in `apex-recall`: `draft`, `reviewed`, `locked`, `deploying`, `deployed`, or `drift`. Standalone WAF assessments (`workflow_mode=assessment`) inspect existing resources directly without requiring a forward-looking deployment `sku-manifest.json`.

## User pins vs architect-derived

Every manifest service entry records its `source`:

- `user-pin` marks a hard SKU constraint specified by the owner at Step 1. Downstream agents never overwrite it silently; changing a pinned SKU requires returning to Step 2 via the workflow graph's return edge.
- `observed-current` records an evidenced SKU already running in an existing workload captured during Step 1 modernization intake.
- `architect-derived` marks a SKU selected by `03-Architect` at Step 2 from priced `candidate_sets[]` and reconciled at Step 4.
- `deploy-substitute` marks an approved Step 6 replacement when Azure quota or regional SKU restrictions block the planned SKU, paired with an entry in `decisions.sku_overrides[]`.

## Cost-estimate dual mode

`cost-estimate-subagent` supports three monthly-estimate input modes (`cost-estimate-v2`) plus explicit rate-only quotes:

| Mode | Input | Purpose |
| --- | --- | --- |
| Mode A | `resource_list` | Standalone or compatibility per-resource list |
| Mode B | `manifest_path` (plus `manifest_usage` and `supplemental_resources[]`) | Complete workload estimate (`02-cost-estimate.json`) plus atomic `cost_estimate_monthly_usd` writeback on manifest `services[]` |
| Mode C | `candidate_sets[]` | Option-by-option SKU comparison (`decisions[]`) with no manifest writeback |
| Rate quote | `purpose: "rate-quote"` | Indicative meter unit rates (`retail-rate-quote-v1`) when monthly usage is unknown; never writes back to `sku-manifest.json` |

At Step 2, `03-Architect` prices competing options in Mode C (one decision per call with explicit meter hints), writes revision 2 of `sku-manifest.json`, and runs Mode B once with `manifest_path`, `manifest_usage`, and project-deployed `supplemental_resources[]` so `02-cost-estimate.json` and `sku-manifest.{json,md}` stay synchronized.

<span id="block-with-escalation-step-6"></span>

## Block-with-escalation at Step 6

When pre-flight quota or regional SKU availability fails:

1. Deploy agent surfaces the conflict and available substitutes (via
   the `apex-azure-quotas` SKU availability check, which reports `AVAILABLE`,
   `RESTRICTED`, `NOT_OFFERED` or `UNKNOWN`) to the human through the orchestrator.
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
