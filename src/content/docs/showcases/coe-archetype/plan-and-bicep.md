---
title: "Implementation plan and AVM Bicep modules"
description: "Steps 4 and 5 subscription-scope Bicep orchestration, module dependency and runtime flows, AVM overrides, PowerShell 7 azd hooks, and ARM Provider validation."
---

In [Step 4: IaC plan](/concepts/workflow/step-4/) and [Step 5: IaC code](/concepts/workflow/step-5/), `05-IaC Planner` and `06b-Bicep CodeGen` translated the governed architecture into a single subscription-scope deployment under `infra/bicep/university/` (`36` planned ARM resources across `main.bicep` and `10` child modules, paired with cross-platform PowerShell 7 `azd` hooks).

## Module dependency graph (`04-dependency-diagram.svg`)

ARM executes a single subscription-scope deployment (`targetScope = 'subscription'`) and parallelizes independent branches while enforcing two strict ordering guarantees before the Linux container web app starts:

1. `identity.bicep` creates `id-university-<suffix>` first and passes `principalId` into `monitoring`, `registry`, `storage`, `messaging`, and `keyvault`, where all `6` UAMI RBAC assignments (`AcrPull`, `Storage Blob Data Contributor`, `Azure Service Bus Data Sender`, `Azure Service Bus Data Receiver`, `Key Vault Secrets User`, and `Monitoring Metrics Publisher`) and `7` deployer RBAC assignments are declared.
2. `private-endpoints.bicep` waits for the four PaaS target resources, and `web.bicep` declares an explicit `dependsOn: [privateEndpoints]` plus output references to all five service modules so every RBAC assignment and private endpoint exists before `app-university-<suffix>` initiates its first container pull.

![Bicep module dependency graph showing subscription-scope main.bicep ordering resource group, identity, data services, SQL MI, private endpoints, and web modules](/showcases/coe-archetype/04-dependency-diagram.svg)

[Open full-size SVG](/showcases/coe-archetype/04-dependency-diagram.svg)

## Runtime request and authentication flow (`04-runtime-diagram.svg`)

The runtime flow diagram separates initial deployment startup (pulling the pinned `.NET 10` sample image from `mcr.microsoft.com` through `afwp-hub` rule `app-to-mcr`) from steady-state private execution after `postprovision.ps1` imports the image into `cruniversity<suffix>` and switches the web app to Managed Identity pull (`acrUseManagedIdentityCreds: true` with ARM audience tokens enabled).

![Runtime flow diagram showing public HTTPS requests, UAMI authentication to ACR, Blob, Service Bus, Key Vault, and Application Insights, and VNet-local SQL MI connectivity](/showcases/coe-archetype/04-runtime-diagram.svg)

[Open full-size SVG](/showcases/coe-archetype/04-runtime-diagram.svg)

## Complete Bicep module catalog (`infra/bicep/university/`)

Eight modules consume exact-pinned Azure Verified Modules (`br/public:avm/...`), while `sql-mi.bicep` and the `6` metric-only `diagnosticSettings` use raw stable ARM types where AVM 0.5.1 lacked `databaseFormat: 'SQLServer2022'` or extension-scope wiring:

| File | Backing AVM module or ARM type | Key security and SKU overrides over module defaults |
| --- | --- | --- |
| `main.bicep` | `avm/res/resources/resource-group:0.4.4` | `targetScope = 'subscription'`; creates `rg-university-${suffix}` with the 9 lowercase tags; builds `snet-app`, `snet-pe`, and `snet-sqlmi` IDs via `resourceId()` without `existing` VNet writes. |
| `main.bicepparam` | `readEnvironmentVariable()` only | Zero tenant, subscription, workspace, or principal GUIDs stored on disk; reads `SUFFIX`, `AZURE_TENANT_ID`, `AZURE_LOCATION`, `LOG_ANALYTICS_WORKSPACE_ID`, `SQLMI_DIRECTORY_IDENTITY_ID`, `DEPLOYER_OBJECT_ID`, `DEPLOYER_UPN`, and optional `CONTAINER_IMAGE`. |
| `modules/identity.bicep` | `avm/res/managed-identity/user-assigned-identity:0.6.0` | Creates `id-university-${suffix}` and outputs `resourceId`, `principalId`, and `clientId`. |
| `modules/monitoring.bicep` | `avm/res/insights/component:0.8.0` | Workspace-based `appi-university-${suffix}` linked to `log-management`; overrides `disableLocalAuth: true` (AVM default `false`) and assigns `Monitoring Metrics Publisher` (`3913510d-42f4-4e42-8a64-420c390055eb`) to both the UAMI and deployer at component scope. |
| `modules/registry.bicep` | `avm/res/container-registry/registry:0.13.1` | `acrSku: 'Premium'`, `publicNetworkAccess: 'Disabled'`, `acrAdminUserEnabled: false`, `networkRuleBypassOptions: 'AzureServices'` (`ADR-0004`), `retentionPolicyStatus: 'disabled'`, and `azureADAuthenticationAsArmPolicyStatus: 'enabled'` (required for UAMI image pulls). Assigns `AcrPull` (`7f951dda-4ed3-4680-a7ca-43fe172d538d`) to UAMI, plus `AcrPush` (`8311e382-0749-4cb8-b61a-304f252e45ec`) and `Container Registry Data Importer and Data Reader` (`577a9874-89fd-4f24-9dbd-b5034d0ad23a`) to deployer. |
| `modules/storage.bicep` | `avm/res/storage/storage-account:0.33.1` | Overrides AVM `Standard_GRS` default to `Standard_LRS`, `allowSharedKeyAccess: false`, `allowBlobPublicAccess: false`, `defaultToOAuthAuthentication: true`, `minimumTlsVersion: 'TLS1_2'`, `publicNetworkAccess: 'Disabled'`, container `teaching-materials`, account `PT1M` metrics setting, and `Storage Blob Data Contributor` (`ba92f5b4-2d11-453d-a403-e96b0029c9fe`) for UAMI and deployer. |
| `modules/messaging.bicep` | `avm/res/service-bus/namespace:0.17.1` | Overrides AVM capacity `2` to `{ name: 'Premium', capacity: 1 }`, `disableLocalAuth: true`, `authorizationRules: []`, `publicNetworkAccess: 'Disabled'`, queue `notifications`, and `Azure Service Bus Data Sender` (`69a216fc-b8fb-44d8-bc22-1f3c2cd27a39`) + `Receiver` (`4f6d3b9b-027b-4f4c-9142-0e5a2a2247e0`) for UAMI and deployer. |
| `modules/keyvault.bicep` | `avm/res/key-vault/vault:0.14.2` | Overrides AVM `premium` and `enablePurgeProtection: true` defaults to `sku: 'standard'`, `enableRbacAuthorization: true`, `enableSoftDelete: true`, `enablePurgeProtection: false` (lab teardown), `publicNetworkAccess: 'Disabled'`, `Key Vault Secrets User` (`4633458b-17de-408a-b874-0445c86b69e6`) for UAMI, and `Key Vault Secrets Officer` (`b86a8fe4-44ce-4948-aee5-eccb2c155cd7`) for deployer. |
| `modules/private-endpoints.bicep` | `avm/res/network/private-endpoint:0.12.1` | Deploys `4` private endpoints (`pe-acr`, `pe-blob`, `pe-sbns`, `pe-kv`) in `snet-pe` with custom NIC names, omitting `privateDnsZoneGroup` so ALZ-lite DINE policies register central DNS records, plus `4` raw `Microsoft.Insights/diagnosticSettings@2016-09-01` metric sinks. |
| `modules/sql-mi.bicep` | Raw `Microsoft.Sql/managedInstances@2025-01-01` + `startStopSchedules@2025-01-01` | `GP_Gen5` `4` vCores, `64` GB, `licenseType: 'BasePrice'`, `requestedBackupStorageRedundancy: 'Local'`, `databaseFormat: 'SQLServer2022'`, `zoneRedundant: false`, `publicDataEndpointEnabled: false`, `minimalTlsVersion: '1.2'`, `azureADOnlyAuthentication: true`, `SystemAssigned,UserAssigned` identity with `primaryUserAssignedIdentityId: sqlMiDirectoryIdentityId`, and weekday schedule `default`. |
| `modules/web.bicep` | `avm/res/web/serverfarm:0.7.0` | Overrides AVM `skuCapacity: 3` / `zoneRedundant: true` defaults to `P0v3` `skuCapacity: 1`, `zoneRedundant: false`, adds plan `PT1M` metrics, and invokes `web-app.bicep`. |
| `modules/web-app.bicep` | `avm/res/web/site:0.24.0` | Isolated into its own module so `npm run validate:iac-security-baseline` can scope `--public-web-app infra/bicep/university/modules/web-app.bicep` to this single resource declaration. |

### ID-free parameter file and scanner-isolated web app

`main.bicepparam` keeps the public repository free of environment identifiers while preserving deterministic compilation:

```bicep title="infra/bicep/university/main.bicepparam"
using './main.bicep'

param suffix = readEnvironmentVariable('SUFFIX')
param tenantId = readEnvironmentVariable('AZURE_TENANT_ID')
param location = readEnvironmentVariable('AZURE_LOCATION')
param logAnalyticsWorkspaceId = readEnvironmentVariable('LOG_ANALYTICS_WORKSPACE_ID')
param sqlMiDirectoryIdentityId = readEnvironmentVariable('SQLMI_DIRECTORY_IDENTITY_ID')
param deployerObjectId = readEnvironmentVariable('DEPLOYER_OBJECT_ID')
param deployerPrincipalName = readEnvironmentVariable('DEPLOYER_UPN')
param containerImage = readEnvironmentVariable('CONTAINER_IMAGE', 'mcr.microsoft.com/dotnet/samples:aspnetapp-10.0')
```

In `modules/web-app.bicep`, `acrUseManagedIdentityCreds` activates automatically as soon as `postprovision.ps1` switches `containerImage` from `mcr.microsoft.com/...` to `${acrLoginServer}/...`:

```bicep title="Excerpt from infra/bicep/university/modules/web-app.bicep"
outboundVnetRouting: {
  allTraffic: true
  imagePullTraffic: true
}
siteConfig: {
  linuxFxVersion: 'DOCKER|${containerImage}'
  acrUseManagedIdentityCreds: startsWith(containerImage, '${acrLoginServer}/')
  acrUserManagedIdentityID: uamiClientId
  alwaysOn: true
  http20Enabled: true
  minTlsVersion: '1.2'
  scmMinTlsVersion: '1.2'
  ftpsState: 'Disabled'
  healthCheckPath: '/'
  remoteDebuggingEnabled: false
}
```

## Fail-closed PowerShell 7 `azd` hooks

`azure.yaml` wires cross-platform PowerShell 7 hooks (`continueOnError: false`) around `azd provision`:

- **`scripts/preflight.ps1` (`preprovision` hook).** Runs `10` read-only checks before any resource write: validates `SUFFIX` regex and 24-character Storage/Key Vault limits; verifies `rg-spoke/vnet-spoke` delegations and checks for leftover releasing SQL virtual clusters on `snet-sqlmi`; walks `vnet-spoke` peering to `vnet-hub` and enforces the EU region allowlist; verifies `log-management`, `budget-factory-workload` (`>= 1` email), and `afwp-hub` rules (`app-to-mcr`, `app-to-azure-monitor`, `app-to-entra-id`); checks deployer RBAC and global name availability (flagging soft-deleted Key Vault collisions with the exact `az keyvault purge` command without auto-purging); queries `/providers/Microsoft.Authorization/policyAssignments?api-version=2023-04-01&$filter=atScope()` via `Invoke-RestMethod` to confirm all `4` DINE DNS and `7` DINE diagnostics assignments; confirms `assign/action` on `id-sqlmi-directory`; and exports the derived values to `azd env`.
- **`scripts/postdeploy-tests.ps1` and `scripts/write-deployment-summary.ps1` (`postprovision` hook).** Verifies HTTP `200` on the MCR placeholder; confirms `allTraffic` and `imagePullTraffic` VNet routing; verifies DINE `privateDnsZoneGroup` attachment and resolves all four private FQDNs from `snet-app` via Kudu; runs `az acr import`; verifies `authentication-as-arm` is `enabled`, patches `linuxFxVersion` via ARM REST, restarts the web app on its private ACR copy, and verifies HTTP `200`; checks `log-management` diagnostic settings; and emits a redacted `06-deployment-summary.md` without automatically advancing Step 6 in `apex-recall`.

## Verification and ARM Provider preflight

`06b-Bicep CodeGen` and `bicep-validate-subagent` verified the implementation tree (`cc56dba426714db783391e1aff839c3bc09459781c7829a0e7f06e71fc8d4e1d`) without executing a live deployment:

| Validation check | Result | Recorded evidence |
| --- | --- | --- |
| `apex-recall check-gate university --action codegen --json` | Exit `0` | `exception-authorized` under `risk-authorization.r2.json` (`pass11` selected; findings preserved open) |
| `bicep build` and `bicep lint` on `main.bicep` | Exit `0` | `0` errors, `0` warnings across `main.bicep` and all `10` modules |
| `bicep-validate-subagent` review | `APPROVED` | L2 governance attestation: `20 / 20` Deny rows satisfied |
| `validate:iac-security-baseline` + `validate:sku-iac-coverage` | Exit `0` | Passed with `--public-web-app infra/bicep/university/modules/web-app.bicep` and full `sku-manifest.json` symbol coverage |
| Read-only `scripts/preflight.ps1` against live spoke | Exit `0` | All `10` check groups passed; derived region `swedencentral` |
| `az deployment sub validate --validation-level Provider` | Exit `0` (`Succeeded`) | Rendered template and parameters validated against Azure Resource Manager providers with zero errors |
| `az deployment sub what-if` (historical check against existing spoke) | Exit `0` (`Succeeded`) | Resolved all `10` modules with `0` `Delete` operations and `Standard_LRS` / non-zonal settings intact |
| `npm run validate:iac-handoff` on `05-iac-handoff.json` | Exit `0` | `0` errors, `0` warnings; tree SHA-256 digest verified unchanged |

```bash title="ARM Provider validation command (subscription and scratch path redacted)"
az deployment sub validate \
  --subscription <subscription-id> \
  --location swedencentral \
  --template-file <scratch-dir>/university-rendered.template.json \
  --parameters @<scratch-dir>/university-rendered.parameters.json \
  --validation-level Provider \
  --only-show-errors \
  --output json
```
