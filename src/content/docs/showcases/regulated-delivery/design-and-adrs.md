---
title: "Architecture decisions and network design"
description: "Step 3 spoke network topology, central DeployIfNotExists Private DNS integration, hub firewall egress paths, and ADR-0001 through ADR-0008."
---

In [Step 3: Design](/concepts/workflow/step-3/), `04-Design` produced rendered architecture and network topology diagrams alongside eight Architecture Decision Records (`ADR-0001` to `ADR-0008`). Each ADR passed dedicated `challenger-review-subagent` passes (`pass1` to `pass3`) to strip unsupported comparative claims and bind every trade-off to Step 1 and Step 2 evidence.

## Service and spoke network topology

### Service boundary (`03-des-diagram.svg`)

Every workload resource deploys into `rg-university-<suffix>` while attaching to subnets inside the vended `rg-spoke/vnet-spoke` (`10.20.1.0/24`). No public IP addresses, virtual networks, subnets, NSGs, route tables, or Private DNS zones exist in the workload template.

![Service architecture diagram showing rg-university resources, vended vnet-spoke subnets, and shared hub dependencies](/showcases/regulated-delivery/03-des-diagram.svg)

[Open full-size SVG](/showcases/regulated-delivery/03-des-diagram.svg)

### Network routing, Private Link, and firewall egress (`03-des-network-diagram.svg`)

The network diagram traces the five distinct traffic and control paths across the vended spoke and shared hub:

1. **Inbound public HTTPS (`443`).** Training attendees reach `app-university-<suffix>` over HTTPS (`httpsOnly: true`, `minTlsVersion: '1.2'`, FTPS and SCM basic auth disabled).
2. **Spoke-local private data plane (`snet-app` to `snet-pe` and `snet-sqlmi`).** Regional VNet integration on `snet-app` (`10.20.1.0/26`) with `outboundVnetRouting.allTraffic: true` and `imagePullTraffic: true` sends container pulls, Blob reads/writes, Service Bus messages, and Key Vault secret lookups directly to the four private endpoints in `snet-pe`, and sends TDS traffic directly to `sqlmi-university-<suffix>` in delegated `snet-sqlmi` (`nsg-sqlmi` + `rt-sqlmi` owned by `B08`).
3. **Central Private DNS (`10.100.0.4`).** `vnet-spoke` uses the hub DNS forwarder (`10.100.0.4`). Landing-zone `DeployIfNotExists` policies register the four private endpoints into central Private DNS zones (`privatelink.azurecr.io`, `privatelink.blob.core.windows.net`, `privatelink.servicebus.windows.net`, `privatelink.vaultcore.azure.net`) in `rg-hub`.
4. **Filtered outbound internet egress (`afw-hub` / `afwp-hub`).** Default-route traffic from `snet-app` traverses `peer-spoke-to-hub` to the Standard Azure Firewall in Shared `rg-hub`, where rule collection group `rcg-member-1` permits `app-to-mcr` (`mcr.microsoft.com`, `*.data.mcr.microsoft.com`), `app-to-azure-monitor` (Application Insights ingestion and live metrics), and `app-to-entra-id` (`AzureActiveDirectory` service tag on TCP `443`).
5. **Cross-network Managed Instance Link (`B07`/`B08` migration path).** Legacy SQL Server 2022 on `vm-app01` (`vnet-datacenter`) replicates through the hub firewall to `snet-sqlmi` over TCP `5022` and `11000-11999` until `C7` cutover completes.

![Network topology diagram illustrating snet-app VNet integration, snet-pe private endpoints, snet-sqlmi delegation, hub firewall rules, and central Private DNS resolution](/showcases/regulated-delivery/03-des-network-diagram.svg)

[Open full-size SVG](/showcases/regulated-delivery/03-des-network-diagram.svg)

## Architecture Decision Records (`ADR-0001` to `ADR-0008`)

### Summary index

| ADR | Decision title | Primary WAF impact | Bicep / operational binding |
| --- | --- | --- | --- |
| `ADR-0001` | Use Linux App Service (`P0v3`) now; defer AKS to a future archetype | Security up, Operations up | `modules/web.bicep` + `modules/web-app.bicep` (`P0v3`, `1` instance) |
| `ADR-0002` | Use SQL Managed Instance `GP_Gen5` over Azure SQL Database for MI-link migration | Security neutral, Operations neutral | `modules/sql-mi.bicep` (`GP_Gen5`, `SQLServer2022`, `snet-sqlmi`) |
| `ADR-0003` | Use Service Bus Premium and ACR Premium for mandatory private endpoints | Security up, Cost down (`$727.77/mo` combined) | `modules/messaging.bicep` (`Premium`, `1` MU) + `modules/registry.bicep` (`Premium`) |
| `ADR-0004` | Enable ACR `networkRuleBypassOptions: AzureServices` for `az acr import` | Security down (accepted), Reliability up | `modules/registry.bicep` + `postdeploy-tests.ps1` step 4 |
| `ADR-0005` | Keep Azure Hybrid Benefit (`BasePrice`) on by default for SQL MI | Cost up (`-$291.90/mo` vs `LicenseIncluded`) | `modules/sql-mi.bicep` (`licenseType: 'BasePrice'`) + README toggle |
| `ADR-0006` | Inherit subscription cost monitoring (`budget-factory-workload`) from vending | Cost Optimization up, Operations up | `cost_monitoring_mode = deferred` until `2027-01-03`; `preflight.ps1` step 5 |
| `ADR-0007` | Keep single-instance non-zonal compute/SQL MI and derive region from `vnet-hub` | Reliability down (accepted), Cost up | `zoneRedundant: false` on ASP and SQL MI; `Standard_LRS` on Storage |
| `ADR-0008` | Use native `Microsoft.Sql/managedInstances/startStopSchedules` for weekday hours | Cost up (`-$314.32/mo` post-C7), Operations up | `modules/sql-mi.bicep` child resource `default` (Mon to Fri `07:30` to `18:30`) |

### `ADR-0001`: Linux App Service (`P0v3`) over AKS

For a single containerized `.NET 10` web app serving fewer than `50` training attendees, Linux App Service `P0v3` (`$64.97/month`) provides verified regional VNet integration, managed-identity ACR pulls, and zero cluster control-plane overhead. AKS was deferred to a separate future archetype rather than adding unassessed node-pool, ingress, and cluster-upgrade operational work. The ADR explicitly notes that public web ingress lacks a WAF and Easy Auth because end-user authentication belongs to application tracks `B06`/`B10`.

### `ADR-0002`: SQL Managed Instance `GP_Gen5` for Managed Instance Link

Capability 5 requires online replication from `vm-app01` (SQL Server 2022) using Managed Instance Link into `snet-sqlmi`, with explicit `databaseFormat: 'SQLServer2022'`, Entra-only authentication, and `publicDataEndpointEnabled: false`. Azure SQL Database does not satisfy the Managed Instance Link requirement, and SQL MI Business Critical does not support native stop/start schedules. Selecting `GP_Gen5` preserves both online MI-link migration before `C7` and weekday stop/start cost control after `C7`.

### `ADR-0003`: Policy-mandated Premium tiers on ACR and Service Bus

`mg-factory-corp` enforces Deny policies prohibiting public network access on Container Registries and Service Bus namespaces. Because Basic and Standard SKUs do not support Azure Private Link, `ACR Premium` (`$50.69/month`) and `Service Bus Premium` (`1` MU, `$677.08/month`) are mandatory compliance choices rather than throughput sizing choices. Both services keep `publicNetworkAccess: 'Disabled'` and gain automatic zone redundancy in `swedencentral` at no extra cost.

### `ADR-0004`: ACR trusted-services bypass for `az acr import`

Microsoft Learn specifies that importing container images into a network-restricted registry requires allowing trusted Azure services to bypass network rules. `ADR-0004` keeps `publicNetworkAccess: 'Disabled'` and sets `networkRuleBypassOptions: 'AzureServices'` on ACR so the deployer (holding `Container Registry Data Importer and Data Reader`) can import `mcr.microsoft.com/dotnet/samples:aspnetapp-10.0` into the private registry. Post-deploy readiness tests gate on both `az acr import` succeeding and the web app restarting cleanly from the private ACR image over `snet-app` before readiness is claimed.

### `ADR-0005`: Default-on Azure Hybrid Benefit (`BasePrice`)

Setting `licenseType: 'BasePrice'` prices 4-vCore `GP_Gen5` compute at `$488.92/month` (`730` hours) versus `$780.82/month` for `LicenseIncluded`, keeping the full platform at `$1.81/hour` under the `$1.83/hour` brief target. Because AHB depends on the partner holding eligible SQL Server core licenses with Software Assurance, the generated `infra/bicep/university/README.md` documents the exact `az sql mi update --license-type LicenseIncluded` fallback command.

### `ADR-0006`: Inherited landing-zone budget (`cost_monitoring_mode = deferred`)

Landing-zone vending (`B08`) already provisions subscription budget `budget-factory-workload` with an `80%` email notification. Duplicating workload budgets and Action Groups would violate the three-input adopter contract (`cost_alert_emails = []`). `ADR-0006` records `cost_monitoring_mode = deferred` with an explicit governance expiration date of `2027-01-03` and enforces a fail-closed read check in `preflight.ps1` verifying that `budget-factory-workload` and at least one contact email exist before provisioning.

### `ADR-0007`: Non-zonal lab posture and hub-derived EU region

To keep lab cost bounded and preserve compatibility with SQL MI stop/start schedules (Microsoft Learn prohibits stopping zone-redundant SQL Managed Instances), `ADR-0007` disables optional zone redundancy on the App Service plan (`zoneRedundant: false`, `skuCapacity: 1`) and SQL MI (`zoneRedundant: false`, `requestedBackupStorageRedundancy: 'Local'`), pairs them with `Standard_LRS` storage, and derives `location` dynamically from `vnet-hub` (restricted by `@allowed(['swedencentral', 'germanywestcentral'])`).

### `ADR-0008`: Native SQL MI `startStopSchedules` child resource

Instead of deploying Azure Automation runbooks or Logic Apps with privileged start/stop identities, `ADR-0008` declares a single free `Microsoft.Sql/managedInstances/startStopSchedules@2025-01-01` child resource (`name: 'default'`, Monday to Friday `07:30` to `18:30` `W. Europe Standard Time`). While the Managed Instance Link is active before `C7`, Azure blocks scheduled stops; once `C7` removes the link, compute billing drops from `$488.92/month` to `$174.61/month` (`-$314.32/month`), with a documented ~20-minute cold-start window when starting an instance out of hours.
