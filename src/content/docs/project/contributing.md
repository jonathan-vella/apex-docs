---
title: "Contributing"
description: "Choose the right APEX repository, make a scoped change, and run its checks before review."
---

To use APEX for a workload, start from
[apex-accelerator](https://github.com/jonathan-vella/apex-accelerator).
To contribute, first identify which repository owns the change.

## Where to contribute

| Repository | Scope |
|---|---|
| [apex](https://github.com/jonathan-vella/apex) | Product agents, skills, instructions, IaC procedures, and validators |
| [apex-accelerator](https://github.com/jonathan-vella/apex-accelerator) | Template contents and the new-project experience |
| [apex-docs](https://github.com/jonathan-vella/apex-docs) | Published pages under `src/content/docs/`, site components, navigation, and site checks |

The product no longer owns this site's source under `site/`. A product behavior
change may need a corresponding docs change, but the repositories have separate
commands and review requirements.

## Before you start

Search existing issues and discuss changes that affect workflow behavior, public
URLs, or the documentation structure. State the reader problem and the evidence
that supports the proposed change.

## Step-by-step contribution flow

### 1. Fork and clone

Clone your fork of the repository that owns the change. For site work:

```bash
git clone https://github.com/YOUR-OWNER/apex-docs.git
cd apex-docs
```

Use the repository's development container and README. Do not copy setup commands
from the product repository into a site-only checkout.

### 2. Create a branch

Use a branch scoped to the change. If your development client already created a
worktree and feature branch, use that branch rather than creating another one.
Follow any branch rules configured by the target repository.

### 3. Make your changes

For documentation, follow the [writing guide](/project/style-guide/). Verify claims
against the source revision, apply Unslop explicitly, and inspect the rendered page.

Preserve routes and anchors. Keep historical facts distinct from current behavior.
Do not overwrite imported binary assets; use a new filename for a replacement.
Never commit credentials or real secrets in examples.

For product code, use its `AGENTS.md` and applicable instructions. Keep changes
to agents, skills, registries, and validators consistent.

### 4. Validate locally

For apex-docs, run from its root in the Linux toolchain:

```bash
npm ci
npm run source:prepare
npm run build
npm run check:links
npm run check:docs
npm test
npm run test:browser
```

Run `npm run check:external-links` when external destinations change. Report
network restrictions separately from confirmed broken links.

Product validation commands belong in the APEX repository. A site build does not
validate generated infrastructure, and a product validator does not check site
navigation or rendered Markdown.

### 5. Commit with a conventional message

Use a message that explains the change, such as
`docs: correct optional GitHub authentication setup`. Follow the target repository's
commit conventions. Do not claim that every repository has the same commit hook
or release-version behavior.

### 6. Push and open a pull request

Push the intended feature branch and request review in the owning repository.
Describe the change, its source evidence, and checks performed. Call out untested
cloud behavior and any approved compatibility exceptions.

Required checks and reviewer rules come from the live repository configuration.
Do not bypass them to make a documentation change appear complete.

## PR checklist

- [ ] The correct repository owns the change.
- [ ] Substantive claims match cited source or clearly dated evidence.
- [ ] Source-pin changes include an impact review; `docs-review.json` advances only after the guidance review.
- [ ] Unslop was applied to the changed reader-facing prose.
- [ ] Routes, anchors, and historical records remain intact.
- [ ] Relevant checks passed, or limitations are reported explicitly.
- [ ] No credentials or unapproved cloud operations are included.

## Commit message reference

Use `docs` for prose, `fix` for a defect, `feat` for new behavior, and `test` for
test-only changes. Use `chore`, `ci`, or `build` for the corresponding maintenance
work. Follow the repository's actual release policy rather than inferring a version
bump from this guide.

## Getting help

File product questions in [APEX issues](https://github.com/jonathan-vella/apex/issues)
and site problems in [apex-docs issues](https://github.com/jonathan-vella/apex-docs/issues).
The [Sensei branch guide](/project/sensei-branch/) covers branch-specific product
contributor tooling, not the normal docs setup.

## Code of conduct

Keep discussion respectful and specific. Review the target repository's license
and contribution policies, and preserve third-party notices when importing material.
