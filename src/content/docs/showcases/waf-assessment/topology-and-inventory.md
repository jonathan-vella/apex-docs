---
title: "Existing-state topology and inventory"
description: "Exhaustive 22-resource-group, 211-resource, 59-type, 5-VNet, and 10-subnet reconciliation across eight deterministic Python SVG views."
---

In standalone assessment mode, `04-Design` generates an existing-state visual inventory from the verified scalar JSON files rather than drawing target-state wishlists. Using `apex-python-diagrams` (`dlib.py`), `03-des-diagram.py` asserts exact count equality across every subscription before emitting eight 1920x1080 SVG diagrams and a machine-readable `assessment-diagram-coverage-v1` ledger.

## Estate-wide reconciliation summary

Every resource container and resource list returned in a single unpaginated response with zero duplicate ARM IDs and exact before-and-after count parity:

| Metric | Reconciled count | Breakdown across the four subscriptions |
| --- | ---: | --- |
| Subscriptions | `4` | Shared (`21` resources), Member 01 (`75`), Member 02 (`112`), Member 03 (`3`) |
| Resource-group containers | `22` | Shared (`7` RGs), Member 01 (`6` RGs), Member 02 (`6` RGs), Member 03 (`3` RGs); `13` unique RG names |
| Total ARM resources | `211` | `162` in `swedencentral`, `25` `global`, `16` in `northeurope`, `8` in `westus2` |
| Distinct ARM resource types | `59` | `114` `(resource_group, resource_type)` family combinations rendered across the 6 inventory views |
| Observed virtual networks | `5` | `vnet-hub`, `vnet-datacenter`, `vnet-spoke`, `ArcBox-VNet`, `vnet-cp-harness-01-dev` |
| Observed subnets | `10` | Every subnet mapped with NSG and route-table attachment presence |

Resource-group container location metadata (`eastus` on `Default-ActivityLogAlerts` in all four subscriptions) differed from contained resource locations (`global` action groups). The diagrams label both so operators never mistake resource-group metadata for regional data residency.

## Overview and spoke connectivity views

### 1. Four-subscription overview (`03-des-diagram.svg`)

The estate overview places all four subscriptions on one canvas, contrasting observed VNet peerings (`vnet-hub` connected to `vnet-datacenter` and `vnet-spoke`) with the four unverified critical-flow sketches along the bottom band.

![Existing-state four-subscription assessment overview diagram](/showcases/waf-assessment/03-des-diagram.svg)

[Open full-size SVG](/showcases/waf-assessment/03-des-diagram.svg)

### 2. Member 01 private connectivity configuration (`03-des-network-01.svg`)

Member 01 splits network ownership across two resource groups:

- **`rg-spoke` (`10` resources, declared workload).** Owns `vnet-spoke` (`snet-app`, `snet-pe`, `snet-sqlmi`), three NSGs, three route tables, a network intent policy, a service endpoint policy, and the platform-created SQL virtual cluster.
- **`rg-university-cijshn` (`19` resources, inferred reference).** Owns `app-university-cijshn`, `sqlmi-university-cijshn`, four approved private endpoints (`pe-acr-university-cijshn`, `pe-blob-university-cijshn`, `pe-kv-university-cijshn`, `pe-sbns-university-cijshn`), their four NICs, and the four target PaaS services.

Even though the four private endpoints and the SQL Managed Instance are injected into `snet-pe` and `snet-sqlmi` inside `rg-spoke`, their ARM resource-group parent remains `rg-university-cijshn`. Meanwhile, the four Private DNS zones (`privatelink.azurecr.io`, `privatelink.blob.core.windows.net`, `privatelink.servicebus.windows.net`, `privatelink.vaultcore.azure.net`) live in Shared `rg-hub` with `Completed` VNet links to `vnet-hub`, not directly to `vnet-spoke`. Without runtime DNS forwarding tests from `snet-app`, private name resolution remains `Unverified`.

![Member 01 observed private connectivity configuration diagram showing cross-resource-group subnet placement between rg-university-cijshn and rg-spoke](/showcases/waf-assessment/03-des-network-01.svg)

[Open full-size SVG](/showcases/waf-assessment/03-des-network-01.svg)

## Exhaustive family-level inventory views

Each of the `22` observed resource groups is drawn exactly once across the six inventory views below. An assertion in `write_coverage()` fails the build if any resource group, ARM resource family, or subnet is omitted or drawn twice.

### 3. Shared and minimal Member 03 (`03-des-inventory-shared-member03.svg`)

Shared holds `21` resources across `7` groups: `rg-hub` (`12` resources including `afw-hub`, `afwp-hub`, `pip-afw-hub`, `vnet-hub` with `AzureFirewallSubnet`, and `4` Private DNS zones plus `4` VNet links), `rg-management` (`log-management` and `id-factory-pipeline`), `McapsGovernance` (`3` resources in `westus2`), `Default-ActivityLogAlerts`, `NetworkWatcherRG`, `rg-apexe2e-prereq-swc`, and `rg-cicd`. Member 03 is not empty: it holds `3` resources (`Default-ActivityLogAlerts`, `McapsGovernance`, and `NetworkWatcherRG`), with no `rg-spoke` container.

![Inventory diagram for Shared subscription (7 resource groups, 21 resources) and Member 03 subscription (3 resource groups, 3 resources)](/showcases/waf-assessment/03-des-inventory-shared-member03.svg)

[Open full-size SVG](/showcases/waf-assessment/03-des-inventory-shared-member03.svg)

### 4. Member 01 datacenter and baseline groups (`03-des-inventory-member01-datacenter.svg`)

`rg-datacenter` contains `43` resources in `swedencentral` across `15` ARM families: `2` virtual machines (`vm-app01`, `vm-dev01`), `15` VM run commands (`app-00` to `app-07`, `dev-00` to `dev-05`, `arc-onboard`), `3` managed disks, `1` Arc machine with `3` extensions, `3` Arc SQL Server instances with `5` Arc SQL databases, `bas-datacenter`, `nat-datacenter`, `2` public IPs, `2` NICs, `2` NSGs, `1` route table, and `vnet-datacenter` (`AzureBastionSubnet` and `snet-servers`).

![Inventory diagram for Member 01 rg-datacenter (43 resources) and three unattributed baseline resource groups](/showcases/waf-assessment/03-des-inventory-member01-datacenter.svg)

[Open full-size SVG](/showcases/waf-assessment/03-des-inventory-member01-datacenter.svg)

### 5. Member 01 spoke and university services (`03-des-inventory-member01-spoke.svg`)

Pairs `rg-spoke` (`10` networking and SQL virtual cluster resources) with `rg-university-cijshn` (`19` application, data, messaging, identity, monitoring, and private-endpoint resources), explicitly labeling the cross-resource-group subnet placement inside `snet-pe` and `snet-sqlmi`.

![Inventory diagram for Member 01 rg-spoke (10 resources) and rg-university-cijshn (19 resources)](/showcases/waf-assessment/03-des-inventory-member01-spoke.svg)

[Open full-size SVG](/showcases/waf-assessment/03-des-inventory-member01-spoke.svg)

### 6. Member 02 ArcBox environment (`03-des-inventory-member02-arcbox.svg`)

`rg-arcbox-swc01` is the largest single resource group in the assessment (`58` resources in `swedencentral` across `21` ARM types), including `ArcBox-Client` VM, `5` Azure Arc machines with `20` extensions, `2` Arc SQL instances with `6` databases, `ArcBox-Bastion`, `ArcBox-VNet` (`ArcBox-Subnet` and `AzureBastionSubnet`), Key Vault, Log Analytics workspace, data collection rules, and Monitor workbooks. Its relationship to the hackathon factory is unattributed.

![Inventory diagram for Member 02 rg-arcbox-swc01 showing 58 resources across 21 ARM resource families](/showcases/waf-assessment/03-des-inventory-member02-arcbox.svg)

[Open full-size SVG](/showcases/waf-assessment/03-des-inventory-member02-arcbox.svg)

### 7. Member 02 Azure Migrate and baseline groups (`03-des-inventory-member02-migration.svg`)

`rg-azmig-swc01` holds `16` Azure Migrate discovery, assessment, dependency-map, replication-vault, and Key Vault (`azmig-demo4559kv`) resources. Despite the `-swc01` suffix in the resource-group name, all `16` resources reside in `northeurope`, illustrating why APEX checks resource `location` properties rather than inferring regions from names.

![Inventory diagram for Member 02 rg-azmig-swc01 (16 resources in North Europe) and three baseline resource groups](/showcases/waf-assessment/03-des-inventory-member02-migration.svg)

[Open full-size SVG](/showcases/waf-assessment/03-des-inventory-member02-migration.svg)

### 8. Member 02 control-plane harness (`03-des-inventory-member02-harness.svg`)

`rg-cp-harness-01-dev` holds `33` resources (`21` in `swedencentral`, `12` `global`), including two App Service apps (`app-api-cp-harness-01-dev-lrn4rt` with public access disabled and `app-web-cp-harness-01-dev-lrn4rt` with public access enabled) integrated with `snet-app-integration`, an Azure SQL logical server with two databases, three approved private endpoints in `snet-pe`, three Private DNS zones linked to `vnet-cp-harness-01-dev`, and four metric alerts.

![Inventory diagram for Member 02 rg-cp-harness-01-dev showing 33 resources, two App Service apps, three private endpoints, and three Private DNS zones](/showcases/waf-assessment/03-des-inventory-member02-harness.svg)

[Open full-size SVG](/showcases/waf-assessment/03-des-inventory-member02-harness.svg)
