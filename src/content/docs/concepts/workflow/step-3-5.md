---
title: "Step 3.5: Governance"
description: "Discover Azure Policy assignments and emit a machine-readable governance constraint set."
sidebar:
  order: 4
  label: "Step 3.5: Governance"
---

## Purpose

Discover **effective** Azure Policy assignments (including management-group-inherited ones),
classify their effects, and emit the `04-governance-constraints.{md,json}` artifacts that gate
downstream IaC planning and deployment.

## Agent

[`04g-Governance`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/04g-governance.agent.md)
uses the
[`apex-azure-governance-discovery`](https://github.com/jonathan-vella/apex/blob/main/.github/skills/apex-azure-governance-discovery/SKILL.md)
skill.

## Invocation

```text
Select: 04g-Governance in Copilot Chat
Output: agent-output/{project}/04-governance-constraints.md
        agent-output/{project}/04-governance-constraints.json
```

## What gets discovered

- Policy assignments at subscription + management-group scope.
- Policy definitions and exemptions referenced by assignments.
- Effect classification (`Deny`, `Audit`, `Modify`, `DeployIfNotExists`).
- Property mapping through `bicepPropertyPath` and `azurePropertyPath` for downstream validation.
- SKU allowlist projection via `derive-sku-allowlist.mjs`, written into
  `sku-manifest.sku_allowlist_snapshot`.

## Baseline instead of live discovery

The shared `.github/data/alz-corp-policy-baseline.json.gz` describes the default policies inherited through
the pinned ALZ `root`, `landing_zones` and `corp` archetypes. It contains a synthetic subscription and
tenant-unverified provenance. Regenerate it with `npm run generate:governance-baseline-alz`.
The Accelerator sync permits this shared file while excluding private tenant snapshots.

The separate `.github/data/governance-policy-baseline.json.gz` belongs to the adopter.
When it covers the actual target and meets completeness, scope, signature and freshness checks,
Governance can offer cached rendering instead of live discovery. Collecting tenant policy does not replace
the shared file. Test fixtures never establish a usable workflow baseline.

For `corp-policy-v1`, source selection happens before
[Architecture approval](/concepts/workflow/step-2/#choose-policy-evidence-before-architecture).
Explicit Corp assumptions permit qualified Architecture approval without identifiers.
They never establish target compatibility or satisfy implementation readiness.
Missing or ineligible tenant evidence does not silently fall back to assumptions.

## Private scope and evidence

When you select tenant verification, the interactive owner asks for missing non-secret tenant and
subscription identifiers, environments and explicit subscription-plus-inherited-policy read authorization.
It reuses settled answers. You do not prepare a JSON file or provide a custom scope-file path.
Never provide passwords, tokens or keys.

For anonymous artifacts, the owner passes your actual native response to the managed capture command:

```bash
apex-recall policy-source <project> --tenant "<confirmed-tenant-guid>" \
  --subscription "<confirmed-subscription-guid>" --authorize-policy-read \
  --owner "<actual-owner-role>" --request-id "<actual-request-id>" --environment dev --json
```

The command records your response in an owner-only local store outside the repository.
Project state retains an opaque scope reference and digest. The command performs no Azure reads,
and creates the private subscription/path index without user-authored JSON.
Its flags do not replace genuine owner authorization or the active agent's tool permissions.
`XDG_STATE_HOME`, if configured, must be absolute and outside the repository.

Governance resolves the private paths with `policy-source --show-private-scope`
and verifies the active CLI tenant with `policy-source --verify-tenant` before
running deterministic discovery (`discover.py --retain-rule-evidence`, or
`render_cached_governance.py --retain-rule-evidence` when a bound snapshot already
retains verified full-rule evidence). `--retain-rule-evidence` preserves complete
policy definitions, assignment lineage, parameters, and `Audit` or `Disabled` rules
inside owner-only private snapshots (`subscription-1.json` and `04-policy-feasibility.json`)
with `umask 077`. A tenant mismatch blocks the read; the agent never switches
credentials or selects the active CLI subscription automatically. Public repository
artifacts contain anonymized summaries rather than raw tenant previews.

Recall binds the exact private snapshots through `checkpoint --policy-feasibility`.
Python and Node contract resolvers select canonical `04-governance-constraints.json`
in that private store. Scope changes, missing files, partial coverage, TTL expiry,
and byte drift block reuse. Multi-subscription runs require separate snapshots for
every authorized subscription.

For independent reviews, the public anonymized summary remains the primary artifact,
while the bound private index and subscription snapshots are frozen as opaque
`supporting_inputs` (`apex-private-policy://<project>/<scope_ref>/subscription-1.json`)
with exact SHA-256 hashes. `record-review.mjs --preflight` supplies transient read
paths to `challenger-review-subagent` without persisting identifying values in
repository findings.

Before Step 5 CodeGen or Step 6 deployment starts, the owner records the target phase
scope from granted authorization, binding `policy_source` and `azure_read_scope` for
each target environment. Development-only policy evidence never authorizes production
entry.

## Review

One `governance-reconciliation` review via `challenger-review-subagent` is mandatory
whenever policies apply. An empty verified policy array can skip this review, whereas
failed or incomplete discovery blocks completion.

:::note[Approval gate]
Human approval of `04-governance-constraints.md` is required before advancing to Step 4 planning.
:::

## Hand-off

After approving the governance constraints, transition to [Step 4: IaC plan](/concepts/workflow/step-4/).
