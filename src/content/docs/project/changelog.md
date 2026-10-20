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

## October 2026

- On October 19, the owner approved adapting the existing
  `challenger-review-subagent` into one shared read-only structured JSON leaf for
  automatic producers, authorized Orchestrator calls, and optional manual
  `10-Challenger` reviews. The interactive owner captures metadata, invokes an
  actual synchronous native `APEX_REVIEW` task, records the attributed output
  centrally through `record-review.mjs`, and validates schema, freshness, and
  provenance. New receipts identify the actual leaf and hash its definition and
  the shared one-shot contract. Built-in `rubber-duck` remains a critic-prose
  reviewer, not a mandatory JSON producer or automatic fallback. Historical
  file-output receipts and readers remain compatible without rewriting evidence
  or resetting attempts.   Review budgets, lenses, gates, security, and approvals
  are unchanged. After reloading the VS Code window so updated agent definitions
  attached from disk (`7735cb43-97f0-4d6e-9a31-8edd63dcc75b`), the owner-authorized
  `cp-harness-01` end-to-end run completed `Steps 1 → 2 → 3.5 → 4 → 5 → 6 → 7 → Post-Lessons`
  with five synchronous `challenger-review-subagent` dispatches, strict
  `record-review.mjs` and `--verify-cache` validation, live Azure deployment to
  `rg-cp-harness-01-dev` (`swedencentral`, 32 resources), Step 7 as-built
  documentation (`$127.69/month`, `0.00%` drift), and `09-lessons-learned.{json,md}`
  (`LL-001`–`LL-004` applied). See the
  [review contract](/concepts/workflow/#review-finalization-and-recovery).

- Owner-authorized migration execution on October 18 in
  [#779](https://github.com/jonathan-vella/apex/pull/779) supersedes the earlier
  `PLAN_THEN_APPROVE` hold and permits evidence-based packet progression. It does
  not accept the proposed lead, skills, source implementation, or runtime pilot.
  The earlier
  [`a315279`](https://github.com/jonathan-vella/apex/tree/a315279aa5d09bfc7657c14536c1776cadcd6069)
  candidate is historical, not an approved or shipped contract. Main reverted
  the earlier [#767](https://github.com/jonathan-vella/apex/pull/767) cutover.
  Real-Azure deployment and E2E are authorized in principle only. The exact tenant,
  subscription, resource boundary, budget, and action scope are not established,
  so cloud execution remains blocked. Cleanup is not authorized. No merge or site
  publication is authorized by this documentation update.
  - The owner intentionally deleted APEX `.github/hooks/` runtime hooks. No runtime
    hooks are currently provided in the migration checkout. Do not restore or
    replace them. The old regex command guard and other hook protections are gone;
    native tool restrictions are not proven equivalent. Native permission
    boundaries must be verified. Git Lefthook, pre-commit checks, secret scanning,
    CI, and azd lifecycle hooks are separate and remain outside this retirement.
  - The target supports only the Copilot session target, Copilot SDK/Agent Host,
    inside VS Code. Other product runtimes are out of scope; historical archives
    and readers remain available.
  - The proposed shape is an optional short APEX engineering lead or native Agent,
    on-demand domain skills, a native bounded independent reviewer, and a separately
    permissioned deploy operator with Bicep and Terraform adapters. The existing
    roster is not a mandatory target.
  - Native Autopilot would handle routine engineering, tests, bounded repair,
    approved feature-branch commits and pushes, PR and issue updates, and scoped
    review fixes without repeated confirmations. It may answer blocking questions.
    Successful `ask_user` or form responses and `APEX_UNATTENDED=1` are not genuine
    human approval or proof of native Autopilot selection. Consequential changes
    and deployment approval need an independent owner boundary.
  - The owner subsequently reported migration of all current main and leaf
    bodies in the source worktree. That work was not committed when this docs
    update began, and source validation and runtime certification were incomplete.
    The body migration retains names, direct main-agent selection, native
    questions, and domain outputs. It does not implement the whole proposed
    role consolidation.
  - Directly selected Requirements, Architect, Design, and Governance retain
    their own material questions. Delegated main workers return structured
    `USER_INPUT_REQUIRED` requests to the interactive parent; leaves never ask
    users or delegate.
  - Active bodies and shared caller guidance no longer require worker-ready
    handshakes, nonce exchanges, `WORKER_EXECUTE`, mandatory verifiers, or log
    preflight. Old readers remain diagnostic and historical. Independent
    production review receipts, `record-review` attribution, and freshness checks
    remain unchanged.
  - The migration omits active UI `handoffs:` metadata. Native task results or
    explicit selection carry the workflow forward; `00-handoff.md` remains
    durable evidence. In the owner's October 18 Copilot-target probe, the
    explicitly selected Probe Source returned `SOURCE_READY_20261018` with no
    handoff controls. Read/search also appeared despite `tools: []`, so native
    restriction enforcement is not established. This was not a fleet handoff
    certification.
  - Tested Azure security, live governance, SKU and AVM contracts, cost provenance,
    durable decisions, atomic writes, and historical compatibility remain required.
    One independent technical review path is proposed; the owner must decide any
    change to the currently separate architecture cost-feasibility review. Deep
    review remains opt-in. Review history and unresolved findings stay intact.
  - Telemetry is optional and contextual. Missing usage is `UNKNOWN`, not zero.
    There are no established token, cost, or latency savings. Source and
    documentation checks are not native runtime end-to-end acceptance.
  - Prior READY evidence, including synthetic shutdown and leading approval prompts,
    is withdrawn. No runtime pilot or deployment acceptance is established.
  See the [planning section](/concepts/how-it-works/agents/#proposed-simplification-and-planning-gate)
  for the PRD, backlog, roadmap, and delivery gates.

- Lessons from the nordic-foods run changed the session tooling and several validators
  ([#764](https://github.com/jonathan-vella/apex/pull/764), open at the time of writing).
  Five changes can break existing projects:
  - **Reopening a step marks later steps stale.** `start-step --force` sets dependent
    steps to the new `stale` status and `plan_status` to `SUPERSEDED`. Treat unknown
    statuses as unfinished, complete each stale step again in order, and get a new
    Plan approval. See
    [Reopen a completed step](/guides/session-debugging/#reopen-a-completed-step).
  - **Step 2 cannot complete with leftovers.** `complete-step` and
    `transition --complete` exit 2 (`step2_residue`) while a `*.tmp.md` file or a
    `FAILED` cost estimate is in the project folder. Move failed or superseded cost files
    to `_meta/`, delete scratch files, and rerun.
  - **Reviews cannot freeze mutable files.** `sku-manifest.json`, `00-handoff.md`,
    `README.md`, recall state and `*-decisions.json` are rejected as supporting inputs,
    and existing reviews that declare them fail. Generate a new review without them and
    quote what you read, such as the manifest revision, in the review text.
  - **A `phase` parameter may not have a default.** Remove the default and pass the phase
    explicitly, then refresh the contract hashes.
  - **Raw resources need an exceptions row.** When the plan has a
    `### Raw Resource Exceptions` section, add one row per resource without an AVM
    module, then refresh the contract hashes.

  New and changed commands and checks: `review-audit --attempt-input`,
  `validate:iac-contract --stage` with `blocks`, contract fields `phase`, `consumes` and
  `target`, policy `status`, and `sync:draft-contract-hashes`. See the
  [validation reference](/reference/validation-reference/).

- The cost-estimate subagent now prices only through the Azure MCP `pricing_get` tool and no longer uses any Azure
  Resource Manager MCP tool; its deployed-cost mode is removed. The ARM MCP server keeps only the `CostManagement`
  toolset for the cost-optimization skill. The Architect prices candidate comparisons one decision per call, with exact
  meter hints, after a bundled call exhausted the 20-request budget in a live run. The public Retail Prices API
  fallback accepts `pricing_get` empty results
  ([#764](https://github.com/jonathan-vella/apex/pull/764), open at the time of writing). Estimates priced earlier
  through ARM MCP need a refresh to carry the new source label.

- Azure MCP moves from 2.0.5 to 3.0.0 ([#759](https://github.com/jonathan-vella/apex/pull/759), open at the time of
  writing). Version 3.0.0 rejects unknown tool parameters, so three skill examples were corrected. It lists
  `extension_azqr` only when azqr 3.0.0 or later is installed, so the dev container now installs a pinned, checksum-verified
  azqr. References to an Azure MCP `azd` tool, which never existed, were removed.

- Terraform planning and CodeGen use the Azure MCP `azureterraform` commands for module versions, READMEs and
  provider docs, with the Registry API as fallback
  ([#760](https://github.com/jonathan-vella/apex/pull/760), open at the time of writing).

- The committed governance baseline is now an offline-generated ALZ Corp default instead of a tenant snapshot, and
  Governance offers it as clearly labelled assumed governance next to live discovery
  ([#762](https://github.com/jonathan-vella/apex/pull/762), open at the time of writing). Policy discovery also
  evaluates the diagnostic-settings initiatives' conditional effects.

- The Azure deprecation fetcher moved to the live Azure Updates feed, and the AVM index was refreshed
  ([#761](https://github.com/jonathan-vella/apex/pull/761), open at the time of writing).

- Requirements, Architecture, IaC Planner, Challenger and Context Optimizer moved from GPT-6.1 Sol
  to Claude Sonnet 5.5, still at high effort. Their bodies now follow the Claude body contract.
  The utility prompts and the Luna subagents keep their models
  ([#758](https://github.com/jonathan-vella/apex/pull/758), open at the time of writing).

- Pending product change, reviewed on October 10: explicit signed risk acceptance for non-production lab Plans.
  Original findings and review verdicts remain unchanged. Kit permission can permit Plan approval and CodeGen;
  deployment needs separate adopter authority and human approval. Runtime completion, resume and downstream entry
  fail closed when evidence is missing, expired, revoked or changed; CI only warns. Step order is now checked, with a
  logged human override. See
  [explicit lab risk acceptance](/concepts/workflow-deep-dive/#explicit-lab-risk-acceptance).

- Four workflow bugs were fixed ([#743](https://github.com/jonathan-vella/apex/pull/743), open at
  the time of writing):
  - Windows clones now keep `.bicepparam` files with LF line endings, so the IaC handoff tree
    hash matches the dev container.
  - A confirmation review after several revisions can use any unused pass number, not just 1
    to 3. Earlier review files stay in place.
  - App Service apps that pull images from Azure Container Registry with a managed identity now
    get a registry that accepts ARM audience tokens. Deploy also checks this setting.
  - The SKU manifest renderer reads `actual_sku` as the schema defines it, by environment and
    then region, so As-Built no longer reports false drift.

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
- The step agents moved to Claude models. Claude Opus 5.5 (high effort) now runs requirements,
  architecture, IaC planning, challenger review and context optimization. Claude Sonnet 5.5
  (medium effort) runs design, governance, code generation, deployment, as-built documentation
  and diagnostics. The Orchestrator and subagents keep their models. Claude agents now follow a
  body contract, which the validator enforces
  ([#726](https://github.com/jonathan-vella/apex/pull/726), open at the time of writing).

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
