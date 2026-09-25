---
title: "Changelog"
description: "Read the main APEX product changes month by month, starting with the project's first release in May 2025."
---

This page summarizes the main product changes in APEX by month, newest first.
Each entry links to the pull request that made the change, where one exists.
For the complete list of changes, see the repository histories:

- [APEX product commits](https://github.com/jonathan-vella/apex/commits/main/)
- [apex-docs commits](https://github.com/jonathan-vella/apex-docs/commits/main/)
- [Accelerator template commits](https://github.com/jonathan-vella/apex-accelerator/commits/main/)

The site's generated reference data uses the revision recorded in
[`apex-source.json`](https://github.com/jonathan-vella/apex-docs/blob/main/apex-source.json).
It does not automatically describe the newest product commit.

## September 2026

- The documentation site moved to the apex-docs repository. APEX retired its copy of the site after the
  cutover was verified ([#701](https://github.com/jonathan-vella/apex/pull/701)) and then removed
  the site tooling ([#704](https://github.com/jonathan-vella/apex/pull/704)).
- Governance, IaC check and maintenance workflows for adopting repositories became inactive
  templates that APEX no longer runs itself. Governance runs only after an explicit opt-in
  ([#699](https://github.com/jonathan-vella/apex/pull/699)).
- The Azure skills were aligned with upstream azure-skills v1.2.51
  ([#709](https://github.com/jonathan-vella/apex/pull/709)) and then refreshed to v1.2.70
  ([#712](https://github.com/jonathan-vella/apex/pull/712)). A weekly report now lists upstream
  skill changes for manual review ([#710](https://github.com/jonathan-vella/apex/pull/710)).
- Agent model assignments moved to the GPT-6 models
  ([#706](https://github.com/jonathan-vella/apex/pull/706)). The GPT agents were then aligned with
  vendor prompting guidance ([#718](https://github.com/jonathan-vella/apex/pull/718)), and the
  instruction files were deduplicated and corrected
  ([#719](https://github.com/jonathan-vella/apex/pull/719)).
- Agent frontmatter now uses the `GPT-6 Sol (copilot)` and `GPT-6 Luna (copilot)` picker labels
  and sets `reasoning-effort` directly. Luna agents use `max` and all other agents use `default`
  ([#720](https://github.com/jonathan-vella/apex/pull/720), open at the time of writing).

## August 2026

- The orchestrator moved to a newer MAI Code Flash model
  ([#658](https://github.com/jonathan-vella/apex/pull/658)).
- Agent authoring guidance moved from an always-loaded instruction file into an on-demand skill,
  and the governance policy baseline is now stored compressed
  ([#659](https://github.com/jonathan-vella/apex/pull/659)).
- Microsoft's hosted Azure Resource Manager MCP server replaced the in-repository Azure Pricing
  MCP server for cost estimates. The Draw.io and Terraform MCP servers were retired, and the dev
  container now installs standalone Azure MCP
  ([#670](https://github.com/jonathan-vella/apex/pull/670)).
- A read-only scan classifies every tracked file before anything is archived, and archiving
  still needs human approval ([#672](https://github.com/jonathan-vella/apex/pull/672)). Redundant
  content was archived with checksums ([#671](https://github.com/jonathan-vella/apex/pull/671)).

## July 2026

- Agents moved to the 2026 model successors. Claude Opus 5 took over architecture and IaC
  planning. GPT-5.6 Luna took over governance, deployment, review and cost estimation, and GPT-5.6
  Terra took over diagnostics ([#635](https://github.com/jonathan-vella/apex/pull/635)).
- The dev container was validated on an Ubuntu 26.04 base
  ([#529](https://github.com/jonathan-vella/apex/pull/529)) and moved to Go 1.26 and TFLint 0.63.1.

## June 2026

- The project was renamed from azure-agentic-infraops to APEX, with the apexops.pro domain
  ([#458](https://github.com/jonathan-vella/apex/pull/458)).
- Agents that used Claude Sonnet 4.6 moved to Claude Sonnet 5
  ([#515](https://github.com/jonathan-vella/apex/pull/515)).
- A four-layer assessment harness now scores agent definitions
  ([#463](https://github.com/jonathan-vella/apex/pull/463)).
- CI enforces the per-step context budget
  ([#466](https://github.com/jonathan-vella/apex/pull/466)), and the model validators were merged
  into one script ([#471](https://github.com/jonathan-vella/apex/pull/471)). Orphaned scripts were
  removed and shared helpers were extracted.
- Agent hooks were reduced to the two with the most useful signal
  ([#478](https://github.com/jonathan-vella/apex/pull/478)). The tfsec scanner was removed, and
  gitleaks now runs only as a pre-commit hook.
- The documentation site was upgraded to Astro 7 and Starlight 0.41
  ([#506](https://github.com/jonathan-vella/apex/pull/506)).

## May 2026

- Workflow hardening added `apex-recall transition` for single-write step changes, a deploy
  approval block in the Bicep and Terraform deploy agents, a three-attempt retry limit, and a fixed
  prompt shape for execution subagents ([#431](https://github.com/jonathan-vella/apex/pull/431)).
- Skills no longer have tiers, and the Azure defaults live in one place
  ([#385](https://github.com/jonathan-vella/apex/pull/385)).
- GitHub operations use the `gh` CLI first and fall back to MCP
  ([#354](https://github.com/jonathan-vella/apex/pull/354)).
- The Azure Pricing MCP server became an independent fork at v5.0 to v5.4
  ([#356](https://github.com/jonathan-vella/apex/pull/356)).
- Handoffs between workflow agents gained validation
  ([#374](https://github.com/jonathan-vella/apex/pull/374)), and Dependabot now covers the dev
  container, actions, npm and pip ([#361](https://github.com/jonathan-vella/apex/pull/361)).
- The Requirements agent moved to GPT-5.5
  ([#388](https://github.com/jonathan-vella/apex/pull/388)).

## April 2026

- `apex-recall` replaced the session-resume skill for saving and restoring workflow state
  ([#328](https://github.com/jonathan-vella/apex/pull/328)).
- A deterministic skill replaced the governance discovery subagent
  ([#318](https://github.com/jonathan-vella/apex/pull/318)).
- Scripts, tests, schemas, registries and MCP servers moved under `tools/`
  ([#332](https://github.com/jonathan-vella/apex/pull/332),
  [#334](https://github.com/jonathan-vella/apex/pull/334),
  [#329](https://github.com/jonathan-vella/apex/pull/329)).
- Azure Developer CLI projects can live side by side in one repository, and the security baseline
  was expanded ([#303](https://github.com/jonathan-vella/apex/pull/303)).
- The Architecture Explorer was rebuilt on Cytoscape.js
  ([#311](https://github.com/jonathan-vella/apex/pull/311)).
- Model assignments were realigned to Claude Opus 4.6, Claude Sonnet 4.6 and GPT-5.4
  ([#307](https://github.com/jonathan-vella/apex/pull/307)).
- Workflows require Node.js 24 ([#344](https://github.com/jonathan-vella/apex/pull/344)).

## March 2026

- A context optimization program ran in three milestones
  ([#200](https://github.com/jonathan-vella/apex/pull/200),
  [#202](https://github.com/jonathan-vella/apex/pull/202),
  [#203](https://github.com/jonathan-vella/apex/pull/203)). It shortened agent bodies, moved long
  skill and instruction content into references, added CI validators and introduced the shared
  IaC skill.
- The Azure skills integration added a security baseline and stricter governance checks
  ([#257](https://github.com/jonathan-vella/apex/pull/257)).
- A documentation site was published with MkDocs Material
  ([#208](https://github.com/jonathan-vella/apex/pull/208)) and then migrated to Astro Starlight
  with the Nordic Fresh Foods demo ([#267](https://github.com/jonathan-vella/apex/pull/267)).
- CI was consolidated from eight workflows to five
  ([#248](https://github.com/jonathan-vella/apex/pull/248)).
- Agents that used GPT-5.4 moved to Claude Sonnet 4.6.

## February 2026

- A full Terraform track joined the Bicep track in the main workflow
  ([#183](https://github.com/jonathan-vella/apex/pull/183)).
- The Challenger agent was added for adversarial review of workflow artifacts
  ([#165](https://github.com/jonathan-vella/apex/pull/165)).
- Requirements discovery became interactive, with questions asked through the chat UI
  ([#100](https://github.com/jonathan-vella/apex/pull/100)).
- The Context Optimizer agent and the golden principles skill were added
  ([#188](https://github.com/jonathan-vella/apex/pull/188)).
- Artifact templates moved into the `azure-artifacts` skill
  ([#108](https://github.com/jonathan-vella/apex/pull/108)), and agent files gained numeric
  prefixes that follow the workflow order ([#159](https://github.com/jonathan-vella/apex/pull/159)).
- The GitHub and Microsoft Learn remote MCP servers were added
  ([#170](https://github.com/jonathan-vella/apex/pull/170)), and the Azure Pricing MCP server was
  upgraded to v3.1.0 ([#62](https://github.com/jonathan-vella/apex/pull/62)).
- After release 8.2.0, the project was re-versioned to 0.9.0 to mark it as pre-production
  ([#127](https://github.com/jonathan-vella/apex/pull/127)).

## January 2026

- The Deploy agent was activated and added to the workflow.
- The Requirements agent was added for Step 1.
- The Azure Resource Health Diagnostician agent was added.
- Artifact templates were introduced in two waves, with validation for template compliance.
- Versioning was automated and branch protection was added.
- Lefthook replaced Husky for Git hooks, and the dev container switched to uv for Python packages.
- The first Terraform support was removed. A full Terraform track returned in February.
- Releases 3.8.0 through 7.4.0 shipped during the month.

## December 2025

- Release 2.0.0 on December 1 restructured the repository around the agent workflow. It added the
  first custom agents, the Azure Pricing MCP server and the dev container.
- The project was rebranded as Agentic InfraOps in release 3.0.0, and the current GitHub repository
  was created on December 4.
- The workflow was standardized at seven steps, with `-des` and `-ab` suffixes for design and
  as-built artifacts.
- Presenter and workshop materials and a glossary were added.
- Releases 3.1.0 through 3.7.8 followed during the month.

## May to November 2025

The project started in May 2025 as azure-agentic-infraops. Its first release provided the initial
repository structure, basic Bicep templates, PowerShell deployment scripts and a GitHub Copilot
instructions file. The detailed history for this period is not in the current repository.
