---
title: "Requirements Overview"
description: "April 2026 requirements overview record. Preserved historical output, not current workflow guidance."
sidebar:
  order: 1
---

:::note[Editorial context]
The historical Requirements output records the workload scope, business context,
and initial architecture assumptions. The generated record below is preserved;
it is not a template for current approval or discovery requirements.
:::

## Project Overview

| Field                   | Value                                                                     |
| ----------------------- | ------------------------------------------------------------------------- |
| **Project Name**        | malta-catering                                                            |
| **Project Type**        | Full-Stack (SPA + API)                                                    |
| **Timeline**            | 2026-04-14 → Demo (30-min live session)                                   |
| **Primary Stakeholder** | Catering outlet owner (Malta)                                             |
| **Business Context**    | Online ordering app for a Malta catering outlet selling local specialties |

`iac_tool: Bicep`

### Business Context

| Field               | Value                                                                      |
| ------------------- | -------------------------------------------------------------------------- |
| Industry / Vertical | Food & Beverage / Hospitality                                              |
| Company Size        | Small (1-50 employees)                                                     |
| Current State       | Greenfield                                                                 |
| Migration Source    | N/A (greenfield)                                                           |
| Business Drivers    | Expand reach with online ordering; reduce phone-based order errors         |
| Success Criteria    | Customers can browse a menu, place orders, and receive delivery at address |

### State Transition

```mermaid
flowchart LR
    A["🏢 Current State<br/>Phone / walk-in orders only"] -->|"Build online ordering app"| B["☁️ Desired State<br/>Azure-hosted React ordering portal"]
    B --> C["✅ Success Criteria<br/>Customers order pastizzi, Cisk & Kinnie online"]
```

### Architecture Pattern

| Field              | Value                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Workload Pattern   | SPA + API (containerized React front-end with lightweight API)                                                                               |
| Recommended Option | App Service S1 (Linux containers) + ACR Premium + VNet + Table Storage + Key Vault                                                           |
| Tier               | Cost-Optimized                                                                                                                               |
| Justification      | Small outlet, low TPS (1/s), dev-only, always-on compute, VNet integration for private connectivity, staging slot for blue-green deployments |
