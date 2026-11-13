---
title: "Skills and instructions"
description: "How skills and instructions guide agents"
---

## Skills system

Repository skill names and directories under [`.github/skills/`](https://github.com/jonathan-vella/apex/tree/7c195a1c8e06a5d0c3aa305d1870356e5829df92/.github/skills) use a single `apex-` prefix (`apex-azure-defaults`, `apex-workflow-engine`, and so on). There are no unprefixed compatibility aliases.

### Skill structure

Each skill follows a single-tier layout:

```text
.github/skills/{name}/
├── SKILL.md                    # Core overview (≤ 500 lines)
├── references/                 # Deep reference material (loaded on demand)
│   ├── detailed-guide.md
│   └── lookup-table.md
└── templates/                  # Template files (loaded on demand)
    └── artifact.template.md
```

### Progressive loading

Agents discover skills through YAML frontmatter (`name` and `description`), load `SKILL.md` on demand, and read `references/*.md` or `templates/*` only when `SKILL.md` directs them to a specific file. There is no digest or minimal skill tier; runtime artifact compression is handled separately by `apex-context-management`.

### Invocation and harness boundaries

`user-invocable` defaults to `true`, and `disable-model-invocation` defaults to `false`. Skills inherit the calling agent's model and tools without changing role permissions or bypassing human gates.

In the VS Code **Copilot** session target, legacy Local slash-adapter `.prompt.md` files are retired except `/waf-assess-existing` (`.github/prompts/waf-assess-existing.prompt.md`). User-invocable entry skills include `/apex-workflow-start` (start or `resume <project>`), `/apex-github-operations` (`gh` CLI-first GitHub workflows), and `/apex-debug-log-export` (privacy-redacted debug bundle export).

### Skill catalog

The [Architecture Explorer](/reference/architecture-explorer/) displays every skill from the pinned APEX commit. Inspect `.github/skills/*/SKILL.md` in your checkout for its installed set:

| Domain | Skills |
| --- | --- |
| Azure Infrastructure and Governance | `apex-azure-defaults`, `apex-azure-governance-discovery`, `apex-azure-bicep-patterns`, `apex-terraform-patterns`, `apex-azure-validate` |
| Azure Operations and Decisions | `apex-azure-diagnostics`, `apex-azure-adr`, `apex-azure-deploy`, `apex-iac-common` |
| Diagrams and Charts | `apex-python-diagrams`, `apex-mermaid` |
| Artifacts and Context | `apex-azure-artifacts`, `apex-context-management`, `apex-debug-log-export` |
| Workflow and Principles | `apex-workflow-engine`, `apex-workflow-start`, `apex-golden-principles` |
| GitHub and Terraform Tooling | `apex-github-operations`, `apex-terraform-search-import`, `apex-terraform-test` |
| Azure Workload Analysis | `apex-azure-prepare`, `apex-azure-cost-optimization`, `apex-azure-compute`, `apex-azure-compliance`, `apex-azure-rbac`, `apex-azure-storage`, `apex-azure-kusto`, `apex-azure-quotas`, `apex-azure-resources`, `apex-azure-cloud-migrate`, `apex-entra-app-registration`, `apex-azure-kubernetes`, `apex-azure-reliability`, `apex-azure-upgrade`, `apex-microsoft-docs` |
| Authoring and Prose Quality | `apex-agent-authoring`, `apex-vendor-prompting`, `apex-unslop` |

For workspace-wide VS Code Copilot rules, see [`.github/copilot-instructions.md`](https://github.com/jonathan-vella/apex/blob/main/.github/copilot-instructions.md) and [`.github/instructions/`](https://github.com/jonathan-vella/apex/tree/main/.github/instructions).

## Instruction system

### Glob-based auto-application

The `applyTo` glob declares a file-matching scope for automatic attachment. A matching
authoring file does not prove a rule is attached during runtime in either harness.
Agents must load missing required guidance; essential approval, security, output, and
stop rules remain in production agent bodies. The table summarizes scope rather than
duplicating every glob; exact patterns live in `.github/instructions/*.instructions.md`.

| Instruction                    | `applyTo`                                                        | Enforces                                                       |
| ------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `iac-bicep-best-practices`     | `**/*.bicep`                                                     | Bicep: security baseline, AVM, cost monitoring, repeatability  |
| `iac-terraform-best-practices` | `**/*.tf`                                                        | Terraform: AVM-TF, provider pinning, naming, security baseline |
| `iac-plan-best-practices`      | `**/04-implementation-plan.md`                                   | IaC plan structure, governance alignment                       |
| `azure-artifacts`              | `**/agent-output/**/*.md`                                        | H2 template compliance for artefacts                           |
| `sku-manifest`                 | `**/sku-manifest.{md,json}`                                      | SKU Manifest authoring rules                                   |
| `governance-discovery`         | `**/04-governance-constraints.*`                                 | Azure Policy discovery requirements                            |
| `azure-yaml`                   | `**/azure.yaml`                                                  | azd manifest conventions for co-located projects               |
| `agent-authoring`              | Agents and prompts                                               | Frontmatter, handoffs, and body contracts                      |
| `vendor-prompting`             | Agents and prompts                                               | Sourced vendor advice with rule IDs                            |
| `agent-operating-frame`        | `.github/agents/*.agent.md`                                      | Shared operating frame for main step agents                    |
| `lesson-collection`            | Orchestrator agent definitions                                   | Production lesson collection protocol                          |
| `agent-skills`                 | `**/.github/skills/**/SKILL.md`                                  | Skill file format standards                                    |
| `instructions`                 | `**/*.instructions.md`                                           | Meta: instruction file guidelines                              |
| `context-optimization`         | Agents, skills, instructions                                     | Context window management rules                                |
| `no-interactive-shell`         | Chat-loaded agents, skills, instructions, prompts, and root docs | No interactive prompts, bounded terminal output                |
| `docs-trigger`                 | Agents, skills, and `tools/scripts/*.mjs`                        | Required product documentation updates                         |
| `no-hardcoded-counts`          | Selected authoring, tooling, and docs files                      | Counts come from `count-manifest.json`                         |
| `no-heredoc`                   | Code and script files                                            | Prevents terminal heredoc corruption                           |
| `markdown`                     | Selected docs, templates, prompts, and root Markdown files       | Documentation standards                                        |
| `code-quality`                 | Code under `.github/`, `tools/`, and `infra/`                    | Review priorities and comment quality                          |
| `github-actions`               | `.github/workflows/*.{yml,yaml}`                                 | GitHub Actions workflow standards                              |
| `javascript`                   | `**/*.{js,mjs,cjs}`                                              | JavaScript/Node.js conventions                                 |
| `json`                         | `**/*.{json,jsonc}`                                              | JSON/JSONC formatting                                          |
| `python`                       | `**/*.py`                                                        | Python coding conventions                                      |
| `shell`                        | `**/*.sh`                                                        | Shell scripting best practices                                 |
| `powershell`                   | `**/*.ps1`, `**/*.psm1`                                          | PowerShell cmdlet best practices                               |

When multiple instructions apply to the same file via overlapping `applyTo` globs,
precedence rules determine which takes priority. See
`.github/instructions/references/precedence-matrix.md` for the full matrix.
Short version: Azure Policy constraints (Tier 1) always win. Domain instructions such as
the IaC tracks, `azure-artifacts`, and `agent-authoring` (Tier 2) win over cross-cutting
rules such as `context-optimization`, `no-interactive-shell`, and `docs-trigger` (Tier 3),
which win over general style: `code-quality`, `markdown`, and the language files (Tier 4).
Files under `references/` have no `applyTo`. They are canonical sources that instructions
link to, not an extra precedence layer.

**`iac-bicep-best-practices.instructions.md`** and
**`iac-terraform-best-practices.instructions.md`** are the
track-specific instructions that enforce
two mandatory rules across all IaC projects (Bicep and Terraform):

1. **Cost Monitoring**: Every deployment must implement the governed budget
   notification contract, Action Group routing, anomaly detection, and
   parameterised notification inputs.
2. **Repeatability (zero hardcoded values)**: Templates must deploy to any
   tenant/region/subscription without source-code modification. `projectName` must
   be a parameter with no default; all tag values reference parameters;
   `.bicepparam`/`terraform.tfvars` is the only place for project-specific defaults.

### Enforcement over documentation

Deterministic validators enforce structural contracts where possible. Advisory guidance,
runtime attachment, and human approvals still need execution evidence and review;
not every instruction has an executable check.

## Creating a custom skill

This section walks through creating a new skill from scratch.

### Step 1: scaffold

Copy an existing skill (for example
[`apex-azure-defaults`](https://github.com/jonathan-vella/apex/tree/main/.github/skills/apex-azure-defaults))
as a starting point and rename the directory:

```bash
cp -r .github/skills/apex-azure-defaults .github/skills/apex-my-new-skill
```

The expected structure is:

```text
.github/skills/apex-my-new-skill/
├── SKILL.md          # Core overview (≤ 500 lines)
├── references/       # Deep reference material
└── templates/        # Template files for artifact generation
```

Authoring rules live in
[`agent-skills.instructions.md`](https://github.com/jonathan-vella/apex/blob/main/.github/instructions/agent-skills.instructions.md).
After scaffolding, review frontmatter against the authoring rules, then run
`npm run validate:skills` plus `npm run validate:agents` to verify.

### Step 2: write SKILL.md

The SKILL.md file requires YAML frontmatter:

```yaml
---
name: apex-my-new-skill
description: "Short description of the skill's purpose.
  USE FOR: keyword triggers.
  DO NOT USE FOR: anti-triggers."
compatibility: List of compatible agents
---
# My New Skill

Quick-reference tables, decision frameworks, and pointers to deeper content.
```

**Frontmatter rules** (from `.github/instructions/agent-skills.instructions.md`):

- `name` must match the folder name, use kebab-case and exactly one `apex-` prefix, and stay within 64 characters
- `description` must be an inline string (not a YAML block scalar)
- Keep SKILL.md under 500 lines. Move detailed content to `references/`.

### Step 3: add references and templates

Use the three levels of disclosure:

| Level | Directory     | Loaded When                   | Content                            |
| ----- | ------------- | ----------------------------- | ---------------------------------- |
| 1     | `SKILL.md`    | Agent reads the skill         | Overview, quick-reference tables   |
| 2     | `references/` | Sub-task needs deep knowledge | Detailed guides, lookup tables     |
| 3     | `templates/`  | Output generation phase       | Structural skeletons for artifacts |

Example: a pricing skill might have `SKILL.md` with a service-to-tool
mapping table, `references/pricing-guidance.md` with detailed MCP tool
usage, and `templates/cost-estimate.template.md` with the output skeleton.

### Step 4: wire into agent bodies

Add a skill reference in the relevant agent's `.agent.md` body:

```markdown
## MANDATORY: Read Skills First

1. **Read** `.github/skills/apex-my-new-skill/SKILL.md`
```

The reference declares the intended use. The static
`tools/scripts/validate-orphaned-content.mjs` check scans references; it is not a
runtime discovery mechanism. Exercise the skill in the intended client after
validating its source.

> Earlier versions of the registry carried a `skills` (and
> `capability_skills`) array on each entry. Those fields were removed in
> the context-window-optimization pass. They duplicated information
> already present in agent bodies and made every agent edit a two-file
> change.

### Step 5: validate

```bash
# Check skill format, size, and references
npm run validate:skills

# Check skill body size and cross-references
npm run validate:skill-checks

# Verify agent registry consistency
npm run validate:agent-registry
```

### How skill discovery works

Write descriptions that identify the task and when the skill should not apply.
Discovery depends on client configuration and invocation flags. A matching
description does not prove that the skill loaded. Read required guidance explicitly
when discovery does not provide it.

---

:::tip[Further reading]

- [How APEX works](../)
- [Agent architecture](../agents/)
- [Workflow engine and validation](../workflow-engine/)
- [MCP integration](../mcp-integration/)
- [Validation reference](/reference/validation-reference/)

:::
