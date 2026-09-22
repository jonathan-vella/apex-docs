---
title: "Core concepts"
description: "Distinguish APEX agents, skills, instructions, registries, and external tools."
---

APEX stores task ownership, procedures, authoring rules, and configuration in
different files. Knowing which file owns a decision makes changes easier to review.

## 1. Agents

An agent definition describes a role, selected model, allowed tools, and handoff
targets. Its body defines the task, expected output, and stop conditions.
Main agents live under `.github/agents/`; helpers live under `_subagents/`.

You select main agents in Copilot Chat. Production main agents use
`disable-model-invocation: true`. A helper allowlist must not turn a main agent
into a nested worker.

## 2. Skills

A skill provides a procedure and supporting reference material in
`.github/skills/{name}/SKILL.md`. References and templates load when the task
needs them. A skill does not choose a different agent or grant permission to use tools.

Discovery depends on the client, configuration, and skill metadata. If a required
skill did not load, the agent must read it explicitly rather than assume the
procedure is already in context.

## 3. Instructions

Instruction files under `.github/instructions/` describe rules for a declared
file scope. Their `applyTo` patterns express intended matching behavior.
A matching authoring file does not prove that the instruction attached during
every runtime operation.

Keep essential approval, output, security, and stop rules in the main agent's
instructions. Use validators where a rule can be checked deterministically,
and verify runtime behavior separately.

## 4. Configuration registries

| File | Purpose |
|---|---|
| `tools/registry/agent-registry.json` | Agent paths, roles, and source metadata |
| `.github/skills/apex-workflow-engine/templates/workflow-graph.json` | Step dependencies, gates, artifacts, and review defaults |

The [Architecture Explorer](/reference/architecture-explorer/) displays metadata
generated from the product revision pinned by this site. It does not query a
running agent session.

<span id="agentsmd--the-table-of-contents"></span>

## Agents.md

The product's root `AGENTS.md` introduces repository structure, commands,
conventions, and workflow boundaries. Follow its references for detailed domain
procedures rather than copying them into each agent.

<span id="copilot-instructionsmd--the-vs-code-bridge"></span>

## Copilot-instructions.md

The product's `.github/copilot-instructions.md` supplies repository-wide guidance
and links to the relevant customization files. This documentation repository has
its own instructions for writing and validation. They are not interchangeable.

## Tools and MCP servers

Tools perform operations such as reading a file, running a validator, or querying
Azure pricing. Tool availability and authentication are distinct from authorization
for a particular action.

The configured integrations include hosted Azure Resource Manager MCP for pricing
and cost queries, workspace stdio Azure MCP, and GitHub MCP. The old custom Python
pricing server is not the current integration.

See [MCP integration](/concepts/how-it-works/mcp-integration/) for configuration and
access requirements, and [skills and instructions](/concepts/how-it-works/skills-and-instructions/)
for authoring guidance.
