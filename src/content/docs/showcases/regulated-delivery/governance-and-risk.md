---
title: "Policy reconciliation and lab risk contract"
description: "Step 3.5 live Azure Policy discovery across 25 assignments and 19 Deny blockers, 9-tag fallback rules, and hash-bound risk-envelope-v1 lab authorization."
---

In [Step 3.5: Governance](/concepts/workflow/step-3-5/), `04g-Governance` ran `discover.py` (`apex-azure-governance-discovery`) against the live workload subscription and its management-group hierarchy (`Tenant Root Group` and `mg-factory-corp`). Later, during Step 4 planning reviews (`pass1` through `pass11`), `challenger-review-subagent` surfaced two non-production lab findings that could not be technically closed within the archetype's fixed scope, triggering APEX's cryptographic lab risk-authorization workflow (`risk-envelope-v1`).

## Live Azure Policy discovery summary

`discover.py` discovered `28` policy assignments, filtered `3` automatic Microsoft Defender for Cloud subscription assignments by default (later verified separately as `deployIfNotExists` only, adding zero `Deny` rules), and retained **`25` active assignments** containing **`19` Deny blocker findings** across **`17` unique policy definitions**:

| Policy effect / category | Discovered count | Reconciliation against the `university` design |
| --- | --- | --- |
| `Deny` blockers (applicable to deployed types) | `8` unique definitions | **100% satisfied by design (`0` conflicts).** Every required Bicep property path is wired explicitly in `04-implementation-plan.md` and attested in `05-iac-handoff.json`. |
| `Deny` blockers (not applicable to deployed types) | `9` unique definitions (`11` findings incl. `3x` `Block VM SKU Sizes`) | **Not applicable.** Targets VMs, VMSS, AKS, Azure SQL logical servers, Cognitive Services/OpenAI, Sentinel workspaces, Key Vault Managed HSM, or retired ASM `Microsoft.Classic*` types. |
| `Modify` assignments | `13` policies | **Aligned explicitly.** Templates set `allowBlobPublicAccess: false`, `allowSharedKeyAccess: false`, `disableLocalAuth: true`, and `publicNetworkAccess: 'Disabled'` upfront so create requests match `Modify` mutations with zero drift. |
| `DeployIfNotExists` (DINE) assignments | `33` policies (`4` Private DNS + `7` ALZ-lite diagnostics + `22` Defender/MCAPSGov) | **Unverified at plan time; gated post-deploy.** Templates omit `privateDnsZoneGroup` on PEs and omit duplicate log settings on DINE-covered types, then verify zone groups, private IP resolution, and `log-management` sinks in `postdeploy-tests.ps1`. |
| Tag enforcement policies | `0` policies | **9-tag APEX lowercase fallback applied** explicitly to `rg-university-<suffix>` and every created resource; vended `rg-spoke` is never retagged. |

## Reconciling the applicable `Deny` blockers

Every active `Deny` policy affecting a resource type in `infra/bicep/university/` maps to an explicit Bicep property in the Step 4 governance compliance matrix:

| Policy display name | Inherited scope | Enforced target and property path | Planned Bicep value |
| --- | --- | --- | --- |
| Storage accounts should disable public network access | `mg-factory-corp` | `Microsoft.Storage/storageAccounts` -> `properties.publicNetworkAccess` | `'Disabled'` |
| Public network access should be disabled for Container registries | `mg-factory-corp` | `Microsoft.ContainerRegistry/registries` -> `properties.publicNetworkAccess` | `'Disabled'` |
| Azure Key Vault should disable public network access | `mg-factory-corp` | `Microsoft.KeyVault/vaults` -> `properties.publicNetworkAccess` | `'Disabled'` |
| Service Bus Namespaces should disable public network access | `mg-factory-corp` | `Microsoft.ServiceBus/namespaces` -> `properties.publicNetworkAccess` and `networkRuleSets.properties.publicNetworkAccess` | `'Disabled'` on both |
| Azure SQL Managed Instances should disable public network access | `mg-factory-corp` | `Microsoft.Sql/managedInstances` -> `properties.publicDataEndpointEnabled` | `false` |
| Network interfaces should not have public IPs | `mg-factory-corp` | `Microsoft.Network/networkInterfaces` -> `ipConfigurations[*].publicIpAddress.id` | Absent (zero public IPs declared) |
| SFI-ID4.2.4 SQL Managed Instance - Safe Secrets Standard | `Tenant Root Group` | `Microsoft.Sql/managedInstances` -> `properties.administrators.azureADOnlyAuthentication` | `true` (Entra admin = deployer) |
| Resources should not be created in West Europe | `Tenant Root Group` | All resources -> `location` | `@allowed(['swedencentral', 'germanywestcentral'])` |

In addition, `ALZ-lite: Allowed locations` and `ALZ-lite: Audit resource location matches resource group location` at `mg-factory-corp` were verified via `az policy assignment show` as `Audit` effect (`enforcementMode: Default`), and co-locating `rg-university-<suffix>` and all regional resources in the hub's EU region satisfies both.

## Explicit 9-tag fallback contract

Because `tags_required` returned empty at both subscription and management-group scopes, the archetype applies the canonical 9-tag lowercase contract from `apex-azure-defaults` as a constant object on `rg-university-<suffix>` and every taggable workload resource:

```bicep title="Tag contract in main.bicep"
var tags = {
  environment: 'dev'
  owner: 'lab-admin'
  costcenter: 'apex-factory'
  application: 'university'
  workload: 'university'
  sla: 'best-effort'
  'backup-policy': 'platform-default'
  'maint-window': 'system-default'
  'technical-contact': 'ghostbusters'
}
```

## Challenger pass 11 and the `risk-envelope-v1` lab contract

During iterative plan hardening (`challenge-findings-plan.json` through `challenge-findings-plan-pass11.json`), `05-IaC Planner` resolved nine passes of technical findings (including ARM `atScope()` policy discovery on Windows, multi-IP ACR private DNS verification, ARM audience token checks for UAMI ACR pulls, and fail-closed SQL virtual cluster checks).

Pass 11 returned `NEEDS_REVISION` on two genuine security boundaries intrinsic to the owner's hackathon kit architecture:

| Finding ID | Classification | Rule / boundary | Residual exposure preserved in `risk-authorization.r2.json` |
| --- | --- | --- | --- |
| `bc629836` | `mandatory-with-exception` | [IaC security baseline](/reference/security-baseline/): public HTTPS web apps require authentication and edge security controls | End-user auth (`Easy Auth`) and WAF were excluded from `B09` by owner decision (`public_edge_auth=none`; app auth belongs to `B06`/`B10`). If an adopter deploys an unauthenticated app that invokes `id-university-<suffix>`, anonymous callers could trigger its Blob, Service Bus, or Key Vault RBAC permissions within that lab RG. |
| `a749666a` (prior `569fbf8e`) | `residual-risk` | Managed identity attachment boundary on shared `id-sqlmi-directory` | SQL MI needs Microsoft Graph read (`User.Read.All`, `GroupMember.Read.All`, `Application.Read.All`) so `C7` can create Entra database users. Vending (`B08`) grants members `Managed Identity Operator` on shared `id-sqlmi-directory`, which allows attaching that UAMI to another resource in their lab subscription to obtain tenant-wide Graph read tokens. |

### Why APEX uses signed risk envelopes instead of suppressing findings

APEX forbids rewriting `NEEDS_REVISION` to `APPROVED` or marking unmitigated risks "closed by prose." Instead, for non-production lab kits, `apex-recall` enforces a cryptographic `risk-envelope-v1` / `risk-authorization-v1` workflow (`agent-output/university/risk/`):

1. **Review integrity stays untouched.** `challenge-findings-plan-pass11.json` remains `NEEDS_REVISION`, and both findings remain explicitly open and risk-accepted rather than closed.
2. **SHA-256 input binding.** `risk-authorization.r2.json` binds its Ed25519 signature (`key_id: "lab-kit-owner"`) to the exact SHA-256 digests of `challenge-findings-plan-pass11.json`, `04-implementation-plan.md`, `04-iac-contract.json`, `04-policy-property-map.json`, `04-environment-manifest.json`, `04-governance-constraints.md/.json`, `risk-eligibility-bc629836.r2.json`, `risk-exception-bc629836.r2.json`, and `risk-eligibility-a749666a.r2.json`. Editing a single byte of the plan or contract invalidates the authorization (`revocation_conditions: ["input-change", "scope-change", "authority-revoked", "authorization-revoked", "validity-expired"]`).
3. **Kit-only action ceiling.** `actions` is restricted strictly to `["plan-complete", "codegen", "code-complete"]` (`expires_at: "2026-11-19T12:23:00Z"`). Running `apex-recall check-gate university --action codegen --json` returns `exception-authorized`, whereas any deployment gate check blocks because kit authoring permission never authorizes deployment.
4. **Binding adopter obligations.** Two mandatory `obligations[]` travel with the kit:
   - `adopter-deployment-authorization` (`before-deploy`): each adopting team must obtain a separate signed deployment authorization bound to their own tenant, subscription, event window, cleanup owner, and teardown deadline before running Step 6.
   - `adopter-teardown-verification` (`after-teardown`): after the event, the cleanup owner must independently verify and collect post-teardown evidence that all SQL MI consumers, `id-sqlmi-directory` and its Graph grants, and the public web app have been deleted.
