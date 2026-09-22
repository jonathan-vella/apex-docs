---
title: "Glossary"
description: "Terms and definitions used in APEX"
tableOfContents:
  maxDepth: 2
---

Quick reference for terms used throughout APEX documentation.

**Jump to:** [A](#a) · [B](#b) · [C](#c) · [D](#d) ·
[G](#g) · [H](#h) · [I](#i) · [J](#j) · [K](#k) · [M](#m) · [N](#n) ·
[O](#o) · [P](#p) · [S](#s) · [T](#t) · [U](#u) · [W](#w) · [Y](#y) ·
[Numbers \& Symbols](#numbers--symbols)

## A

### Microsoft Entra ID (formerly Azure Active Directory / AAD)

Microsoft's cloud-based identity and access management service. Used for
authentication and RBAC across Azure resources. SQL databases in this project
require Microsoft Entra ID-only authentication (no SQL auth).

External: [Microsoft Entra ID](https://learn.microsoft.com/entra/fundamentals/whatis)

### ADR (Architecture Decision Record)

A document that captures an important architectural decision along with its context and consequences.
Used to record "why" decisions were made for future reference.

Output: `agent-output/{project}/03-des-adr-*.md`, `07-ab-adr-*.md`

### Agent (Custom)

A specialized AI assistant defined in `.github/agents/` that focuses on a specific
workflow step or supporting role. Select main agents through the client's agent picker. The catalog spans
top-level workflow agents (Orchestrator plus the Requirements → As-Built chain),
cross-cutting agents (Governance, Context Optimizer, Diagnose, Challenger), and
non-user-invocable subagents under `.github/agents/_subagents/`. The authoritative
inventory lives in `tools/registry/agent-registry.json` and `count-manifest.json`.

See: [.github/agents/](https://github.com/jonathan-vella/apex/tree/main/.github/agents)

### APEX

The methodology of using coordinated AI agents and skills to transform requirements into deploy-ready
Azure infrastructure. Combines GitHub Copilot with custom agents and reusable skills.

### apex-recall

A pip-installable Python CLI (`tools/apex-recall/`) that indexes `agent-output/` into SQLite + FTS5
for low-token session context recovery. Owns the full session lifecycle (read + write) via commands
like `show`, `init`, `checkpoint`, `decide`, and `finding`. All agents use it instead of
direct `00-session-state.json` manipulation.

Source: `tools/apex-recall/`

### AVM (Azure Verified Modules)

Microsoft's official library of pre-built, tested IaC modules that follow Azure best
practices. Available for both Bicep (`br/public:avm/res/`) and Terraform
(`registry.terraform.io/Azure/avm-res-*/azurerm`). AVM reduces custom implementation, but module choice and configuration still need
policy, security, and compatibility checks.

External: [Azure Verified Modules Registry](https://aka.ms/avm)

### AVM-TF (Azure Verified Modules for Terraform)

The Terraform variant of Azure Verified Modules, published to the Terraform Registry
under the `Azure` namespace. Module sources follow the pattern
`Azure/avm-res-<provider>-<resource>/azurerm`.

External: [AVM-TF on Terraform Registry](https://registry.terraform.io/namespaces/Azure)

### AKS (Azure Kubernetes Service)

Managed Kubernetes container orchestration service on Azure. Simplifies deploying,
managing, and scaling containerised applications.

External: [AKS Documentation](https://learn.microsoft.com/azure/aks/)

### API (Application Programming Interface)

A set of defined rules and protocols that allows software components to communicate.
In this project, agents interact with Azure and GitHub APIs via MCP servers.

### ARM (Azure Resource Manager)

Azure's deployment and management layer. Data-plane operations use service-specific endpoints.
Bicep compiles to ARM templates (JSON). The Azure MCP server queries ARM directly.

External: [ARM Overview](https://learn.microsoft.com/azure/azure-resource-manager/management/overview)

## B

### Bicep

Azure's domain-specific language (DSL) for deploying Azure resources declaratively. Compiles to ARM
templates but with cleaner syntax and better tooling support.

External: [Bicep Documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)

### Bicep Lint

Static analysis tool that checks Bicep files for best practices, security issues, and common mistakes.
Run with `bicep lint main.bicep` or automatically via VS Code extension.

## C

### CAF (Cloud Adoption Framework)

Microsoft's methodology for cloud adoption, including naming conventions, governance,
and landing zone architecture. This project follows CAF naming prefixes (e.g. `rg-` for
resource groups, `vnet-` for virtual networks).

External: [Azure CAF](https://learn.microsoft.com/azure/cloud-adoption-framework/)

### CDN (Content Delivery Network)

A distributed network of servers that caches and delivers content from edge locations
closest to users. Azure CDN / Azure Front Door accelerate static asset delivery.

### Challenger

Adversarial review agent that challenges requirements, architecture assessments, and
implementation plans. Finds untested assumptions, governance gaps, WAF blind spots,
and architectural weaknesses. Returns structured JSON findings with severity ratings.
The owner selects `10-Challenger` for required reviews. It is not an automatically
invoked Orchestrator subagent.

See: [.github/agents/10-challenger.agent.md](https://github.com/jonathan-vella/apex/blob/main/.github/agents/10-challenger.agent.md)

### Copilot Chat

The conversational interface for GitHub Copilot in VS Code. Open Chat and use
the agent picker to select a custom agent. Keyboard shortcuts depend on your
platform and keybindings.

### CLI (Command-Line Interface)

A text-based interface for interacting with software. This project uses several CLIs:
Azure CLI (`az`), Bicep CLI (`bicep`), Terraform CLI (`terraform`), GitHub CLI (`gh`),
and PowerShell (`pwsh`).

### Content Tabs

A documentation feature that renders tabbed content blocks, showing Bicep and
Terraform examples side-by-side without duplicating page structure.

### Context Management

Unified skill covering two context-window concerns. Mode A (Runtime Compression)
defines `full`, `summarized`, and `minimal` artifact tiers used by Orchestrator
and CodeGen before loading large artifacts. Mode B (Diagnostic Audit)
provides log parsing, token profiling, and hand-off gap analysis used by the
11-Context Optimizer agent. Replaces the legacy `context-shredding` and
`context-optimizer` skills.

See: `.github/skills/apex-context-management/SKILL.md`

### Circuit Breaker

A failure-handling pattern that stops execution when specified conditions fail.
APEX Deploy agents have explicit stopping rules for authentication, policy,
preview, ownership, and approval failures.

See: [.github/skills/apex-iac-common/](https://github.com/jonathan-vella/apex/tree/main/.github/skills/apex-iac-common)

## D

### DAG (Directed Acyclic Graph)

A directed graph with no cycles. APEX's workflow graph describes dependencies
and includes separate return/escalation behavior. Read its edge semantics rather
than treating every workflow relationship as a forward-only execution instruction.

### Design Agent

Step 3 agent that generates architecture diagrams and Architecture Decision Records (ADRs).
Optional step in the workflow. Uses `apex-python-diagrams` for architecture
diagrams and charts, and `apex-azure-adr` for decision records.

Output: `agent-output/{project}/03-des-*.{py,png,svg,md}`

### Dev Container

A Docker-based development environment defined in `.devcontainer/`. Provides consistent tooling
(Azure CLI, Bicep, PowerShell) across all machines.

External: [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)

### DSL (Domain-Specific Language)

A programming language designed for a specific problem domain rather than general-purpose
use. Bicep is a DSL for Azure resource deployment; HCL is a DSL for infrastructure
configuration.

### ERD (Entity-Relationship Diagram)

A visual diagram showing how data entities relate to each other. Used in the Design step
(Step 3) to model data architectures.

## G

### Governance Constraints

Azure policies and organizational rules that affect resource deployment. Governance
discovers them at Step 3.5 and records `04-governance-constraints.md` and `.json`.
The planner consumes that evidence.

## H

### HCL (HashiCorp Configuration Language)

The declarative language used by Terraform to define infrastructure resources.
File extension: `.tf`. Supports variables, modules, data sources, and provider blocks.

External: [HCL Documentation](https://developer.hashicorp.com/terraform/language)

### HIPAA (Health Insurance Portability and Accountability Act)

US regulation governing protected health information. A service selection or
generated architecture does not establish workload compliance. Applicable
agreements, configuration, operations, and organizational controls also matter.

### Hub-Spoke Network

Azure networking pattern where a central "hub" VNet contains shared services (firewall, VPN gateway)
and "spoke" VNets contain workloads. Spokes peer with the hub for connectivity.

## I

### IaC (Infrastructure as Code)

Practice of managing infrastructure through code files (Bicep, Terraform, ARM) rather than manual
portal clicks. Enables version control, automation, and repeatability. This project supports two
IaC tracks: **Bicep** (Azure-native DSL) and **Terraform** (multi-cloud HCL).

## J

### JSON (JavaScript Object Notation)

A lightweight data interchange format. Used throughout this project for configuration
files (`agent-registry.json`, `workflow-graph.json`, `session-state.json`),
MCP communication (JSON-RPC), and Azure ARM templates.

External: [JSON Specification](https://www.json.org/)

## K

### KQL (Kusto Query Language)

Query language used in Azure Monitor, Log Analytics, and Application Insights. Used for
troubleshooting and diagnostics.

External: [KQL Reference](https://learn.microsoft.com/azure/data-explorer/kusto/query/)

## M

### MCP (Model Context Protocol)

Protocol for extending AI assistants with external tools and data sources. This project
declares its configured servers in `.vscode/mcp.json`. Available tools depend on
the selected client, agent, and authentication.

See: [MCP Integration](../../concepts/how-it-works/mcp-integration/)

### MJS (ECMAScript Module)

A JavaScript file using modern `import`/`export` syntax (as opposed to `.cjs` which
uses `require()`). This project's validation scripts in `tools/scripts/` use the `.mjs` extension.

### MTTR (Mean Time To Recovery)

Average time to restore service after an incident. This glossary makes no measured
claim about APEX's effect on recovery time.

## N

### NSG (Network Security Group)

Azure resource that filters network traffic with allow/deny rules. Applied to subnets or NICs.
Essential for microsegmentation and defense-in-depth.

## O

### Orchestrator

The main agent that inspects workflow evidence and recommends the next handoff.
The owner selects the next main agent and supplies required approvals.

See: [.github/agents/01-orchestrator.agent.md](https://github.com/jonathan-vella/apex/blob/main/.github/agents/01-orchestrator.agent.md)

## P

### PCI-DSS (Payment Card Industry Data Security Standard)

Security standard for organizations handling payment-card data. Generated code
does not establish compliance with the standard.

### Private Endpoint

An Azure network interface with a private IP used to reach a supported service
through Private Link. Creating one does not itself disable the service's public
endpoint. DNS and a reachable client path also need configuration.

### PRD (Product Requirements Document)

A document defining a product's requirements. APEX captures its workload requirements
in `01-requirements.md`; it does not use a Ralph task list for the production workflow.

### RBAC (Role-Based Access Control)

Azure's authorization system that assigns permissions based on roles (Owner, Contributor,
Reader). Managed through Microsoft Entra ID (formerly Azure AD). The Azure MCP server is RBAC-aware.

External: [Azure RBAC](https://learn.microsoft.com/azure/role-based-access-control/)

### REST (Representational State Transfer)

An architectural style for web APIs using standard HTTP methods (GET, POST, PUT, DELETE).
The governance agent queries Azure Policy assignments via REST API.

### ROI (Return on Investment)

A financial metric measuring the gain or loss from an investment relative to its cost.
Used in presenter materials to quantify the value of APEX.

### RPC (Remote Procedure Call)

A protocol for executing functions on a remote server. MCP servers communicate using
JSON-RPC, a lightweight RPC protocol encoded in JSON.

### Ralph Loop

A general iterative agent pattern based on the [RALPH pattern](https://ghuntley.com/ralph/).
APEX production workflows retain human approval gates; this pattern does not authorize autonomous deployment.

See: [Workflow Validation](../../guides/e2e-testing/)

## S

### SDK (Software Development Kit)

A collection of libraries and tools for building applications that interact with a
service. Azure SDKs exist for Python, .NET, JavaScript, Go, and Java.

### SKU (Stock Keeping Unit)

In Azure, a SKU defines the pricing tier and capabilities of a resource (e.g.
`Standard_LRS` for storage, `P1v3` for App Service). The Architect agent recommends
SKUs based on requirements and pricing data.

### SLA (Service Level Agreement)

A formal commitment from a cloud provider guaranteeing a minimum level of availability
(e.g. 99.95% uptime). SLA requirements drive SKU and architecture decisions.

### SOC 2 (System and Organization Controls 2)

An auditing framework for service organisations covering security, availability,
processing integrity, confidentiality, and privacy. Azure services hold SOC 2
certifications.

### SQL (Structured Query Language)

A language for managing relational databases. Azure SQL Database is a managed
relational database service used in several example architectures in this project.

### SRE (Site Reliability Engineering)

An engineering discipline that applies software practices to infrastructure and
operations. Recovery-time measurements need an explicit incident dataset and method.

### SBOM (Software Bill of Materials)

Inventory of all software components in an application, including dependencies and versions.
Used to inspect software provenance and dependency risk.

### SI Partner (System Integrator Partner)

Microsoft partner organization that implements Azure solutions for customers. Primary audience
for APEX methodology.

### Skill (Copilot)

A reusable knowledge module stored in `.github/skills/` that agents can invoke. Unlike agents,
skills provide reusable guidance within the caller's model and tool context.
Skills are organized across conventions, document creation, infrastructure patterns,
workflow automation, and troubleshooting categories.

See: [.github/skills/](https://github.com/jonathan-vella/apex/tree/main/.github/skills)

### Subagent

A helper called by an allowed parent for a bounded task such as validation, pricing,
or preview. The pinned Explorer lists the inventory. Challenger is a human-selected
main agent, not one of these helpers.

See: [.github/agents/\_subagents/](https://github.com/jonathan-vella/apex/tree/main/.github/agents/_subagents)

## T

### Tags (Azure Resource Tags)

Key-value pairs applied to Azure resources for organization, cost tracking, and policy enforcement.
Effective policy and the approved plan determine required tags. Use the current
product fallback only when applicable; do not copy a historical four-tag list.
See `iac-bicep-best-practices.instructions.md` or `iac-terraform-best-practices.instructions.md`
for the canonical tag rule.

### Terraform

HashiCorp's open-source Infrastructure as Code tool using HCL (HashiCorp Configuration Language).
Supports multi-cloud deployments. In this project, Terraform is the alternative IaC track
alongside Bicep. Both tracks use the shared planner; CodeGen and Deploy are
track-specific. The approved contract specifies provider versions and state design.

External: [Terraform Documentation](https://developer.hashicorp.com/terraform)

### Terraform State

The JSON file that tracks the mapping between Terraform configuration and real-world
resources. Stored remotely in an Azure Storage Account for team collaboration.
State locking prevents concurrent modifications.

### TLS (Transport Layer Security)

Cryptographic protocol that provides secure communication over networks. This project's
security baseline mandates TLS 1.2 minimum on all Azure services.

### TTL (Time To Live)

The duration for which a cache entry or evidence item is considered fresh under
its contract. Use the relevant tool's actual configuration rather than assuming
a shared pricing-cache lifetime.

## U

### UAT (User Acceptance Testing)

Final testing phase where end users verify the system meets business requirements.

## W

### WAF (Well-Architected Framework)

Microsoft's guidance for building reliable, secure, efficient Azure workloads. Five pillars:
Reliability, Security, Cost Optimization, Operational Excellence, Performance Efficiency.

External: [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)

### What-If Deployment

Azure deployment preview that shows what resources will be created, modified, or deleted without
making actual changes. Run with `az deployment group create --what-if`.

### VPN (Virtual Private Network)

An encrypted network tunnel connecting on-premises networks to Azure virtual networks.
Azure VPN Gateway sits in the hub VNet in a hub-spoke topology.

### WSL (Windows Subsystem for Linux)

A Windows feature for running Linux environments. WSL2 uses a managed virtual
machine. The primary APEX setup uses Docker Desktop's WSL2 integration.

External: [WSL Documentation](https://learn.microsoft.com/windows/wsl/)

## Y

### YAML (YAML Ain't Markup Language)

A human-readable data serialisation format used for configuration files. In this project,
YAML is used in agent and instruction frontmatter and GitHub Actions workflows.
`astro.config.mjs` is JavaScript, not YAML.

External: [YAML Specification](https://yaml.org/)

## Numbers & Symbols

### Multi-Step Agentic Workflow

The core APEX workflow: `requirements` → `architect` → Design Artifacts →
Governance → IaC Plan → IaC Code → Deploy → Documentation. Step 3.5 (Governance)
runs between optional Design and IaC Plan. One planner serves both tracks.
Bicep and Terraform have separate CodeGen and Deploy agents. Each step produces
artifacts in `agent-output/`, and the owner selects each main-agent handoff.

See: [Workflow Guide](../../concepts/workflow/)

## Quick Reference Table

| Term    | Full Name                                    | Category       |
| ------- | -------------------------------------------- | -------------- |
| AAD     | Azure Active Directory (Entra ID)            | Identity       |
| ADR     | Architecture Decision Record                 | Documentation  |
| Agent   | Copilot Custom Agent                         | AI             |
| AKS     | Azure Kubernetes Service                     | Compute        |
| API     | Application Programming Interface            | General        |
| ARM     | Azure Resource Manager                       | Azure          |
| AVM     | Azure Verified Modules                       | IaC            |
| AVM-TF  | Azure Verified Modules for Terraform         | IaC            |
| CAF     | Cloud Adoption Framework                     | Methodology    |
| CDN     | Content Delivery Network                     | Networking     |
| CLI     | Command-Line Interface                       | Tooling        |
| DAG     | Directed Acyclic Graph                       | Architecture   |
| DSL     | Domain-Specific Language                     | General        |
| ERD     | Entity-Relationship Diagram                  | Documentation  |
| HCL     | HashiCorp Configuration Language             | IaC            |
| IaC     | Infrastructure as Code                       | Methodology    |
| JSON    | JavaScript Object Notation                   | Data Format    |
| KQL     | Kusto Query Language                         | Monitoring     |
| MCP     | Model Context Protocol                       | AI Integration |
| MJS     | ECMAScript Module                            | JavaScript     |
| MTTR    | Mean Time To Recovery                        | Operations     |
| NSG     | Network Security Group                       | Networking     |
| PCI-DSS | Payment Card Industry Data Security Standard | Compliance     |
| PRD     | Product Requirements Document                | Documentation  |
| RBAC    | Role-Based Access Control                    | Security       |
| REST    | Representational State Transfer              | Architecture   |
| ROI     | Return on Investment                         | Business       |
| RPC     | Remote Procedure Call                        | Architecture   |
| SBOM    | Software Bill of Materials                   | Security       |
| SDK     | Software Development Kit                     | Tooling        |
| Skill   | Copilot Skill Module                         | AI             |
| SKU     | Stock Keeping Unit                           | Azure          |
| SLA     | Service Level Agreement                      | Operations     |
| SOC 2   | System and Organization Controls 2           | Compliance     |
| SQL     | Structured Query Language                    | Data           |
| SRE     | Site Reliability Engineering                 | Operations     |
| TLS     | Transport Layer Security                     | Security       |
| TTL     | Time To Live                                 | Caching        |
| UAT     | User Acceptance Testing                      | QA             |
| VPN     | Virtual Private Network                      | Networking     |
| WAF     | Well-Architected Framework                   | Architecture   |
| WSL     | Windows Subsystem for Linux                  | Tooling        |
| YAML    | YAML Ain't Markup Language                   | Data Format    |

---

**See also:** [FAQ](../faq/) · [How It Works](../../concepts/how-it-works/) · [Troubleshooting](../../guides/troubleshooting/)

_Missing a term? [Open an issue](https://github.com/jonathan-vella/apex/issues) or add it via PR._
