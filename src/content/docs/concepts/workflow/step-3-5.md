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

Governance resolves the private paths with `policy-source --show-private-scope`.
It checks the current tenant with `policy-source --verify-tenant` before running deterministic discovery.
A mismatch blocks the read. The agent must not switch credentials or select the active CLI subscription.
Raw scope, snapshots, previews and diagnostics stay in the private store with owner-only permissions.
Public artifacts contain anonymized summaries, not copied raw previews.

Recall binds the exact private snapshots through the existing `checkpoint --policy-feasibility` option.
Python and Node contract resolvers select canonical Governance JSON in that store.
Scope changes, missing files, partial coverage, expiry and changed evidence block reuse.
All approved subscriptions need separate coverage. One subscription's snapshot cannot represent the others.
Reviewers need actual authorized access to the required evidence or must report that limitation.
The review primary remains the public anonymized summary. Tenant-backed reviews also freeze the private index
and every subscription snapshot as opaque supporting references, with exact hashes. Governance includes its
canonical private JSON. A reference has the form
`apex-private-policy://<project>/<scope_ref>/subscription-1.json`.
Request preflight derives the required set and supplies temporary read paths for authorized reviewer dispatch.
Those paths and identifying native logs remain private. Public findings use opaque policy references.
Omitting evidence or changing private bytes invalidates the review; an editorial mapping cannot waive that check.

Before CodeGen or deployment starts, the owner records the target phase scope from actual stage/start authorization.
It must consume the current policy-source and read inputs, and stay within their authorized environments.
DEV-only policy evidence cannot authorize PROD entry. The owner reuses captured approval or asks only for missing
operation authorization. An earlier phase's scope is not approval of the next phase.

## Review

One `governance-reconciliation` review is mandatory when constraints exist. Use
the `10-Challenger` handoff. An empty policy array can skip this review, but failed
or incomplete discovery does not establish that the scope has no constraints.

:::note[Approval gate]
The user must approve governance constraints before proceeding to Step 4 planning.
:::

## Hand-off

After approving the constraints, select [Step 4: IaC plan](/concepts/workflow/step-4/).
