---
title: "Skills and instructions"
description: "How skills and instructions guide agents"
---

## Skills system

Repository skill names and directories use exactly one `apex-` prefix, including
imported skills. Explicit integrations must use the new names: `azure-defaults`
becomes `apex-azure-defaults`. There are no old-name compatibility wrappers.
Agent names, public npm commands, instruction filenames, upstream identities,
and externally installed skills are unchanged. See the
[complete migration map and provenance][skill-migration].

[skill-migration]: https://github.com/jonathan-vella/apex/blob/main/tools/tests/exec-plans/active/apex-workflow-audit.md#skill-merger-and-retirement-plan

### Skill structure

Each skill follows a standard layout:

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

Skills use discovery metadata (`name` and `description`), then the full `SKILL.md`
when selected, then references or templates only when needed. There is no alternate
digest skill tier. Runtime artifact compression is a separate context-management concern.

### Invocation and harness boundaries

`user-invocable` defaults to `true`; `disable-model-invocation` defaults to `false`.
A hidden skill is absent from the slash menu. A manual-only skill cannot be selected
automatically by the model. These flags do not authorize tools or bypass human gates.

Local prompt files are adapters, not Agent Host entry points. Host manual entries include
`apex-host-workflow-start`, `apex-host-git-commit`, and `apex-host-debug-log-export`.
Select the owning agent first; skills inherit its model/tools. Workflow recovery uses
`apex-host-workflow-start` with an explicit `resume` operation. Source validation and
model labels do not prove native discovery, runtime attachment, or model eligibility.

### Skill catalog

The [Architecture Explorer](/reference/architecture-explorer/) lists skills from
the product revision pinned by this site. Inspect `.github/skills/*/SKILL.md` in
your own checkout for its installed inventory. The following groups are examples,
not an automatically updated catalog:

| Domain               | Skills                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Azure Infrastructure | `apex-azure-defaults`, `apex-azure-bicep-patterns`, `apex-terraform-patterns`, `apex-azure-validate`                                                                                                                                  |
| Azure Operations     | `apex-azure-diagnostics`, `apex-azure-adr`, `apex-azure-deploy`                                                                                                                                                                  |
| Diagram & Chart      | `apex-python-diagrams`, `apex-mermaid`                                                                                                                                                                                      |
| Artefact Generation  | `apex-azure-artifacts`, `apex-context-management`                                                                                                                                                                           |
| Workflow and State   | `apex-workflow-engine`, `apex-golden-principles`                                                                                                                                                                            |
| Deployment           | `apex-iac-common`                                                                                                                                                                                                      |
| GitHub Operations    | `apex-github-operations`                                                                                                                                                                                               |
| Terraform Tooling    | `apex-terraform-search-import`, `apex-terraform-test`                                                                                                                                                                       |
| Azure Plugin Skills  | `apex-azure-prepare`, `apex-azure-cost-optimization`, `apex-azure-compute`, `apex-azure-compliance`, `apex-azure-rbac`, `apex-azure-storage`, `apex-azure-kusto`, `apex-azure-quotas`, `apex-azure-resources`, `apex-azure-cloud-migrate`, `apex-entra-app-registration`, `apex-azure-kubernetes`, `apex-azure-reliability`, `apex-azure-upgrade` |
| Microsoft Learn      | `apex-microsoft-docs`                                                                                                                                                                                                  |
| Meta / Tooling       | `apex-agent-authoring`, `apex-context-management`                                                                                                                                                                           |

`apex-docs-writer` was archived when documentation moved to apex-docs. Follow this
site's [writing guide](/project/style-guide/) and explicit Unslop review instead.
`apex-agent-authoring` owns product customization assessments.
`apex-context-management` retains context audits, log export, and runtime compression;
`apex-workflow-engine` retains entry, recovery, and DAG routing.

For the authoritative
list of VS Code Copilot customization mechanisms (instructions, prompt
files, custom agents, agent skills, MCP servers, hooks, plugins) see
[`.github/copilot-instructions.md`](https://github.com/jonathan-vella/apex/blob/main/.github/copilot-instructions.md)
and the per-mechanism files under
[`.github/instructions/`](https://github.com/jonathan-vella/apex/tree/main/.github/instructions).

## Instruction system

### Glob-based auto-application

The `applyTo` glob declares a file-matching scope for automatic attachment. A matching
authoring file does not prove a rule is attached during runtime in either harness.
Agents must load missing required guidance; essential approval, security, output, and
stop rules remain in production agent bodies. The table summarizes scope rather than
duplicating every glob; exact patterns live in `.github/instructions/*.instructions.md`.

| Instruction                    | `applyTo`                                                            | Enforces                                                       |
| ------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| `iac-bicep-best-practices`     | `**/*.bicep`                                                         | Bicep: security baseline, AVM, cost monitoring, repeatability  |
| `iac-terraform-best-practices` | `**/*.tf`                                                            | Terraform: AVM-TF, provider pinning, naming, security baseline |
| `iac-plan-best-practices`      | `**/04-implementation-plan.md`                                       | IaC plan structure, governance alignment                       |
| `azure-artifacts`              | `**/agent-output/**/*.md`                                            | H2 template compliance for artefacts                           |
| `agent-authoring` | Agents and prompts | Frontmatter, handoffs, and body contracts |
| `agent-skills`                 | `**/.github/skills/**/SKILL.md`                                      | Skill file format standards                                    |
| `instructions`                 | `**/*.instructions.md`                                               | Meta: instruction file guidelines                              |
| `markdown`                     | `**/*.md`                                                            | Documentation standards                                        |
| `context-optimization`         | Agents, skills, instructions                                         | Context window management rules                                |
| `code-quality`                 | `**/*.{js,mjs,cjs,ts,tsx,jsx,py,ps1,sh,bicep,tf}`                    | Review priorities and comment quality                          |
| `governance-discovery`         | `**/04-governance-constraints.*`                                     | Azure Policy discovery requirements                            |
| `github-actions`               | `.github/workflows/*.yml`                                            | GitHub Actions workflow standards                              |
| `javascript`                   | `**/*.{js,mjs,cjs}`                                                  | JavaScript/Node.js conventions                                 |
| `json`                         | `**/*.{json,jsonc}`                                                  | JSON/JSONC formatting                                          |
| `lesson-collection` | Orchestrator agent definitions | Production lesson collection protocol |
| `no-hardcoded-counts` | Selected authoring, tooling, and docs files | Counts come from `count-manifest.json` |
| `python`                       | `**/*.py`                                                            | Python coding conventions                                      |
| `shell`                        | `**/*.sh`                                                            | Shell scripting best practices                                 |
| `powershell`                   | `**/*.ps1`, `**/*.psm1`                                              | PowerShell cmdlet best practices                               |
| `prompt`                       | `**/*.prompt.md`                                                     | Prompt file guidelines                                         |
| `no-heredoc` | Code and script files | Prevents terminal heredoc corruption |

When multiple instructions apply to the same file via overlapping `applyTo` globs,
precedence rules determine which takes priority. See
`.github/instructions/references/precedence-matrix.md` for the full matrix.
Short version: Azure Policy compliance (Tier 1) always wins over domain IaC (Tier 2),
which wins over cross-cutting cost rules (Tier 3), which wins over general code quality (Tier 4).

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

- [Core concepts](../four-pillars/)
- [Agent architecture](../agents/)
- [Workflow engine and validation](../workflow-engine/)
- [MCP integration](../mcp-integration/)
- [Validation reference](/reference/validation-reference/)

:::
