---
title: "Documentation writing guide"
description: "Write, verify, and maintain APEX documentation without breaking published links or historical records."
sidebar:
  order: 3
---

Write for an Azure platform engineer who needs to complete a task or understand a
specific APEX behavior. Start with the task, its prerequisites, and the expected
result. Put the mechanism before promotional claims.

Documentation lives in `src/content/docs/` in **apex-docs**. Product agents and
skills live in **apex**. New users start from **apex-accelerator**. Check the
repository before copying a path or command.

## H1 source of truth

Every page needs a frontmatter `title` and `description`. Starlight renders the
title as the page h1. Start the article body with `##`, not another h1. A custom
splash page must also have only one visible h1.

Use sentence case for headings. Preserve existing heading IDs when changing
wording, and check old fragment links against the built page. An unchanged URL
does not preserve a renamed heading.

## Terminology

Follow the [Microsoft Writing Style Guide](https://learn.microsoft.com/style-guide/welcome/).

| Use | Instead of |
|---|---|
| Microsoft Entra ID | Azure AD or AAD, except when identifying an old name |
| Select | Click, when a keyboard or pointer can perform the same action |
| Sign in | Log in |
| PowerShell | Powershell |
| GitHub | github, except in an exact identifier |

Keep code identifiers and commands unchanged, including `az login`,
`azd auth login`, and `azureADOnlyAuthentication`.

<span id="step-n-vs-phase"></span>

## Step and phase

Use Step for the cross-agent workflow, including Step 3.5 for Governance.
Use Phase only for a stage within a named agent, such as Architect Phase 6b.

Name the actor. The human selects a main agent and approves its handoff.
A skill provides instructions. A helper subagent performs only the work its
owning agent permits. Do not describe these as interchangeable mechanisms.

## Code blocks

Give commands a language and identify where they run. Explain required inputs,
expected output, and any side effects before a deployment or recovery command.
Never replace required values with plausible-looking secrets.

Use an Expressive Code title when a filename helps:

````md
```bicep title="main.bicep"
param location string = resourceGroup().location
```
````

Keep executable examples separate from illustrative output. Do not describe a
source-reviewed command as locally tested or an unexecuted deployment as verified.

## Images and diagrams

Use a visual when it explains a relationship, decision, or observed result.
Do not put a generic photograph between a task heading and its instructions.

Give informative images useful alt text and a nearby explanation. Complex
diagrams need a text account of their important relationships and access to a
readable full-size version. Decorative images should have empty alt text.

Keep editable diagram source. Use Mermaid for a small sequence or flow and the
existing Python diagrams tooling for Azure topology where appropriate. Check
both themes and a narrow viewport. Scrollable diagrams must work with a keyboard.

Imported binary assets are protected by migration tests. Keep their bytes and
URLs. Give new diagrams new filenames rather than overwriting historical assets.

## Links

Use root-relative paths with trailing slashes for pages, such as
`/concepts/workflow/`. Put the fragment after the slash:
`/concepts/workflow/#workflow-overview`, not `#workflow-overview/`.

Preserve published routes and valid anchors. Test redirects and old fragments
after changing headings. External links that open a new tab need `rel="noopener"`.

Link behavioral claims to the relevant source. Use a pinned revision when
documenting a specific contract. Use a clearly labeled current-source link for
an inventory that intentionally follows the upstream repository.

## Hard-coded counts

Avoid copying changing agent, skill, or tool counts into prose. Link to the
[Architecture Explorer](/reference/architecture-explorer/) or the product
registry instead. A historical count needs a date and source.

## Writing review

Apply the checked-in Unslop skill at `.github/skills/unslop/SKILL.md`
explicitly to every documentation change, including metadata, navigation labels,
and component text. Read the file directly if the client cannot load the skill.

Remove filler, decorative emphasis, and generic claims. Explain who does what
and what the reader should observe. Keep necessary caveats and exact technical
terms. A shorter sentence is not better if it omits a prerequisite.

Historical records need a different treatment. Edit introductions, captions,
and explanations for clarity, but preserve dates, measurements, original
findings, and quoted output. Label verbatim records and record their exemption
from prose changes in the review notes.

## Tooling

Run these commands from the apex-docs root in its Linux development environment:

```bash
npm ci
npm run source:prepare
npm run build
npm run check:links
npm run check:docs
npm test
npm run test:browser
```

The container provides Python, Graphviz, and browser dependencies. Outside it,
follow the [repository setup instructions](https://github.com/jonathan-vella/apex-docs#readme).
Do not assume a native Windows preview proves the full build is supported.

Run `npm run check:external-links` when links change. Distinguish confirmed
missing pages from authentication restrictions and network failures.

`npm run check:docs` checks metadata, article heading levels and the casing of
known agent, helper and skill names in headings and inline code. It checks
historical metadata but exempts generated demo bodies. It does not rewrite prose,
validate every identifier or replace the explicit Unslop review.

The browser suite includes selected axe checks in both themes on desktop and
mobile. Automated results do not establish complete accessibility conformance.

## Source updates and review evidence

`apex-source.json` controls generated product metadata. `docs-review.json` records
the separate product and template revisions used for the maintained guidance
review. Do not advance that record merely because the generated graph builds.
Its date is a review date, not a deployment-test date.

Source-update PRs compare the candidate APEX tree with the last guidance-review
baseline. Their impact report maps changed paths to likely documentation owners
and retains unmatched paths for manual review. Read the actual source changes.
For setup changes, compare the Accelerator separately.

After reviewing affected prose, record any execution limits, apply Unslop and
update `docs-review.json` with the revisions you actually reviewed. Preserve
historical exemptions. See [Updating APEX](/guides/updating-apex/) for how readers
interpret the compatibility information.

This repository does not provide the product's `lint:md`,
`lint:docs-frontmatter`, or `lint:no-hardcoded-counts` commands. Use the scripts
in its own `package.json`, then review rendered pages and apply Unslop manually.
