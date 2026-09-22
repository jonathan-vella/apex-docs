---
title: "As-Built Documentation Overview"
description: "April 2026 as-built documentation overview record. Preserved historical output, not current workflow guidance."
sidebar:
  order: 8
---

:::note[Editorial context]
These records describe the observed resources and open issues after provisioning.
Production and staging returned HTTP 503 during evidence collection.
A generated runbook or compliance matrix is not proof that its procedures were
executed or that the workload met all requirements.
:::

## Document Package Contents

| Document                                | Description                        | Status    |
| --------------------------------------- | ---------------------------------- | --------- |
| [Design Document](./design/)            | Comprehensive architecture design  | Generated |
| [Operations Runbook](./runbook/)        | Day-2 operational procedures       | Generated |
| [Resource Inventory](./design/)         | Complete deployed resource listing | Generated |
| [Backup & DR Plan](./runbook/)          | Recovery procedures and failover   | Generated |
| [Compliance Matrix](./compliance/)      | Security controls mapping          | Generated |
| [As-Built Cost Estimate](./compliance/) | Deployed pricing baseline          | Generated |
| As-Built Diagram                        | Rendered architecture snapshot      | Preserved |

## Source Artifacts

These documents were generated from the following agentic workflow outputs:

| Artifact            | Source                           | Generated  |
| ------------------- | -------------------------------- | ---------- |
| Requirements        | `01-requirements.md`             | 2026-04-14 |
| WAF Assessment      | `02-architecture-assessment.md`  | 2026-04-14 |
| Cost Estimate       | `03-des-cost-estimate.md`        | 2026-04-14 |
| Implementation Plan | `04-implementation-plan.md`      | 2026-04-14 |
| Bicep Code          | `05-implementation-reference.md` | 2026-04-14 |
| Deployment Summary  | `06-deployment-summary.md`       | 2026-04-15 |

```mermaid
%%{init: {'theme':'neutral'}}%%
graph LR
    S1["01 Requirements"] --> S7a["07 Design Doc"]
    S2["02 Architecture"] --> S7a
    S2 --> S7c["07 Runbook"]
    S3["03 Cost Estimate"] --> S7e["07 Cost (As-Built)"]
    S4["04 Impl Plan"] --> S7d["07 Resource Inventory"]
    S5["05 Impl Reference"] --> S7d
    S6["06 Deployment"] --> S7c
    S6 --> S7b["07 Compliance Matrix"]
    style S7a fill:#0078D4,color:#fff
    style S7b fill:#0078D4,color:#fff
    style S7c fill:#0078D4,color:#fff
    style S7d fill:#0078D4,color:#fff
    style S7e fill:#0078D4,color:#fff
```

## Project Summary

| Attribute          | Value                                       |
| ------------------ | ------------------------------------------- |
| **Project Name**   | `malta-catering`                            |
| **Environment**    | `dev`                                       |
| **Primary Region** | `swedencentral`                             |
| **Compliance**     | `GDPR`                                      |
| **Monthly Cost**   | `$139.06/month` baseline, medium confidence |

## Architecture Overview — Cost Distribution

| Category      | Monthly Cost (USD) | Share |
| ------------- | -----------------: | ----: |
| Compute       |              64.97 | 46.7% |
| Data Services |              50.69 | 36.5% |
| Networking    |              23.40 | 16.8% |

![Monthly Cost Distribution](/demo/07-ab-cost-distribution.png)

![6-Month Cost Projection](/demo/07-ab-cost-projection.png)

## Related Resources

- **Infrastructure Code**: `infra/bicep/malta-catering/`
- **ADRs**: `03-des-adr-0001-app-service-s1-compute.md`, `03-des-adr-0002-table-storage-persistence.md`, `03-des-adr-0003-public-network-posture.md`
- **External**: [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/) | [AVM Index](https://aka.ms/avm/index)
