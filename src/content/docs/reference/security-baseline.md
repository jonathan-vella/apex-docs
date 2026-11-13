---
title: "Security baseline"
description: "Apply APEX security defaults, effective Azure Policy, and documented service-specific exceptions."
---

Apply the product's security defaults together with effective Azure Policy and
approved requirements. Source validation checks specific patterns; reviews and
runtime evidence cover requirements that source scans cannot establish.

The [pinned security baseline](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/instructions/references/iac-security-baseline.md) and [policy compliance reference](https://github.com/jonathan-vella/apex/blob/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/instructions/references/iac-policy-compliance.md) are the authoritative rules for `03-Architect`, `05-IaC Planner`, CodeGen, and `validate:iac-security-baseline`. Mandatory semantic reviews run through `challenger-review-subagent` (with `10-Challenger` available for optional manual sessions).

## Rules

| #   | Rule                                   | Bicep Property                         | Terraform Argument                        | WAF Pillar |
| --- | -------------------------------------- | -------------------------------------- | ----------------------------------------- | ---------- |
| 1   | TLS 1.2 minimum                        | `minimumTlsVersion: 'TLS1_2'`          | `min_tls_version = "1.2"`                 | SE:07      |
| 2   | HTTPS-only traffic                     | `supportsHttpsTrafficOnly: true`       | `https_traffic_only_enabled = true`       | SE:07      |
| 3   | No public blob access                  | `allowBlobPublicAccess: false`         | `allow_nested_items_to_be_public = false` | SE:05      |
| 4   | Managed Identity preferred             | `identity: { type: 'SystemAssigned' }` | `identity { type = "SystemAssigned" }`    | SE:05      |
| 5   | Microsoft Entra ID-only SQL auth       | `azureADOnlyAuthentication: true`      | `azuread_authentication_only = true`      | SE:05      |
| 6   | Private PaaS data services and APIs    | `publicNetworkAccess: 'Disabled'`      | `public_network_access_enabled = false`   | SE:06      |
| 7   | No shared key access on storage        | `allowSharedKeyAccess: false`          | `shared_access_key_enabled = false`       | SE:05      |
| 8   | App Service HTTP/2 enabled             | `http20Enabled: true`                  | `http2_enabled = true`                    | SE:07      |
| 9   | Container Registry admin user disabled | `adminUserEnabled: false`              | `admin_enabled = false`                   | SE:05      |

## Private networking

PaaS data services (`Storage`, `SQL`, `PostgreSQL`, `MySQL`, `Cosmos DB`, `Key Vault`, `Container Registry`, `Redis`, `Service Bus`, `Event Hubs`) require private endpoints and disabled public network access (`publicNetworkAccess: 'Disabled'` / `public_network_access_enabled = false`) in every environment, including development.

Two explicit service distinctions apply:

- **App Service web frontends vs. APIs.** App Service APIs must remain private. App Service instances hosting a public-facing web application may use public HTTPS ingress when isolated in a dedicated Web App module (`--public-web-app`), while retaining TLS 1.2, HTTP/2, Managed Identity, and VNet outbound integration.
- **Log Analytics and workspace-based Application Insights.** Authenticated public query and ingestion endpoints are permitted when effective Azure Policy and approved workload requirements allow them (recording query and ingestion flags separately while keeping HTTPS/TLS, Microsoft Entra ID authentication, and disabled local auth). Azure Monitor Private Link Scope (`AMPLS`) is required when policy or approved isolation requirements mandate private-only monitoring, not by default.

Private DNS resolution is mandatory for every private endpoint. Project IaC provisions private DNS zones, VNet links, and DNS zone groups unless verified central platform infrastructure or an effective `DeployIfNotExists` (`DINE`) policy owns those exact components. Verified DINE ownership avoids deploying duplicate DNS zones; it never waives DNS resolution itself. Verify assignment scope, parameters, zone IDs, managed identity permissions, and client resolution before omitting workload DNS modules. See [DINE policy evaluation][dine] and [private endpoint DNS][private-dns].

> **WAF pillar key**: SE:05 = Identity & access, SE:06 = Network security, SE:07 = Encryption.

## Extended checks

The validator also catches these anti-patterns:

| Pattern                 | Bicep                                 | Terraform                                 | Severity          |
| ----------------------- | ------------------------------------- | ----------------------------------------- | ----------------- |
| Redis non-SSL port      | `enableNonSslPort: true`              | `enable_non_ssl_port = true`              | Blocks deployment |
| FTPS allowed            | `ftpsState: 'AllAllowed'`             | `ftps_state = "AllAllowed"`               | Blocks deployment |
| Remote debugging        | `remoteDebuggingEnabled: true`        | `remote_debugging_enabled = true`         | Blocks deployment |
| Cosmos DB local auth    | `disableLocalAuth: false`             | `local_authentication_disabled = false`   | Blocks deployment |
| PostgreSQL SSL disabled | `sslEnforcement: 'Disabled'`          | `ssl_enforcement_enabled = false`         | Blocks deployment |
| MySQL SSL disabled      | `sslEnforcement: 'Disabled'`          | `ssl_enforcement_enabled = false`         | Blocks deployment |
| Key Vault network open  | `networkAcls.defaultAction: 'Allow'`  | `default_action = "Allow"`                | Warning           |
| Wildcard CORS           | `allowedOrigins: ['*']`               | `allowed_origins = ["*"]`                 | Warning           |
| Storage OAuth default   | `defaultToOAuthAuthentication: false` | `default_to_oauth_authentication = false` | Warning           |

## Enforcement points

The security baseline is checked at multiple points in the workflow:

1. CodeGen runs the required source checks before preparing the deployment handoff.
2. Deploy checks current code and evidence before preview and apply. Reuse requires
   matching inputs, scope, and freshness. A prior PASSED string alone is insufficient.
3. Product git hooks and CI run their configured checks. Inspect their actual scope
   rather than assuming every operation passed through them.

## Running the validator

```bash title="Run the security baseline validator" frame="terminal"
# Check all IaC files
npm run validate:iac-security-baseline

# Explicitly reviewed public web application, isolated in a known Web App resource/module file
npm run validate:iac-security-baseline -- --public-web-app infra/bicep/project/web-app.bicep

# Full validation suite (includes security baseline)
npm run validate:all
```

## Limitations

The validator uses regex-based single-line pattern matching. Nested or multi-line
property assignments (e.g., a property split across multiple lines) may not be caught.
Plan/code review must cover the requirements that the source scan cannot prove.
A review is not a substitute for actual connectivity or application-health checks.

The public-web flag accepts a dedicated known Web App resource or AVM-module file, not mixed-resource files.
Use the corresponding `.tf` path for Terraform. The flag declares reviewed scope; it does not approve an API's
public exposure. Automated runs without that scope remain fail-closed. Source scans cannot prove endpoint coverage,
module internals or DNS resolution. Those require plan/code review and actual connectivity evidence.

When refining previously approved requirements under this baseline, return to Requirements for reconciliation,
independent review and renewed approval. Do not silently rewrite approved project artifacts or treat old findings
as current evidence for changed inputs.

## Further reading

- [Microsoft Cloud Security Benchmark][mcsb]
- [WAF security pillar][waf-sec]
- [Validation reference](/reference/validation-reference/)
- [Cost governance](/reference/cost-governance/)
- [Workflow](/concepts/workflow/)

[mcsb]: https://learn.microsoft.com/security/benchmark/azure/overview
[waf-sec]: https://learn.microsoft.com/azure/well-architected/security/
[dine]: https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-deploy-if-not-exists
[private-dns]: https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-dns

## Related

- [Quickstart](/getting-started/quickstart/)
- [Troubleshooting](/guides/troubleshooting/)
