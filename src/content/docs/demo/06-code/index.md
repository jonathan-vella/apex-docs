---
title: "Infra-as-Code Overview"
description: "April 2026 infra-as-code overview record. Preserved historical output, not current workflow guidance."
sidebar:
  order: 6
---

:::note[Editorial context]
The historical CodeGen record lists generated files and reported checks. These
checks do not prove application readiness or compatibility with today's modules.
Current CodeGen also owns the required JSON deployment handoff.
:::

## IaC Templates Location

Code Location: `infra/bicep/malta-catering/`

## File Structure

```text
infra/bicep/malta-catering/
├── main.bicep
├── main.bicepparam
├── azure.yaml
├── deploy.ps1
└── modules/
    ├── app-insights.bicep
    ├── app-service-plan.bicep
    ├── budget.bicep
    ├── container-registry.bicep
    ├── key-vault.bicep
    ├── log-analytics.bicep
    ├── private-dns-zones.bicep
    ├── storage.bicep
    ├── virtual-network.bicep
    └── web-app.bicep
```

~12 resources provisioned across networking, compute, data, security, and monitoring — generated from the 10-module architecture defined in the implementation plan.
