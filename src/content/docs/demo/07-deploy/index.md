---
title: "Deployment Overview"
description: "April 2026 deployment overview record. Preserved historical output, not current workflow guidance."
sidebar:
  order: 7
---

:::note[Editorial context]
The April 2026 run used azd and recorded an automatic S1-to-P0v3 substitution.
Current APEX requires escalation and approval for such a change.
The Succeeded status below is the provisioning result. Production and staging
application probes returned HTTP 503.
:::

## Preflight Validation

| Property             | Value                          | Status |
| -------------------- | ------------------------------ | ------ |
| **Project Type**     | `azd` project                  | Info   |
| **Deployment Scope** | `resourceGroup`                | Info   |
| **Validation Level** | `azd provision --preview`      | Info   |
| **Bicep Build**      | Passed before deployment       | Pass   |
| **Bicep Lint**       | Passed before deployment       | Pass   |
| **What-If Status**   | Preview succeeded before apply | Pass   |

## Deployment Details

| Field               | Value                                       |
| ------------------- | ------------------------------------------- |
| **Deployment Name** | `azd provision --no-prompt`                 |
| **Resource Group**  | `rg-malta-catering-dev`                     |
| **Location**        | `swedencentral`                             |
| **Duration**        | `5 minutes 1 second` (successful final run) |
| **Status**          | `Succeeded`                                 |

:::caution[SKU Adaptation]
The first App Service Plan deployment attempt failed because `S1` Linux was not available
to this subscription in `swedencentral`. The Deploy Agent autonomously adapted and the
successful deployment used `P0v3` instead. This is documented in the deployment summary
and reflected in the final outputs.
:::
