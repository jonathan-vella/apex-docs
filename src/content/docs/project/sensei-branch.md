---
title: "Sensei branch"
description: "Scope and historical context for the optional APEX skill-audit branch."
---

This is contributor background for the APEX branch `feat/skills-sensei`, not a
requirement for using APEX or editing this site. The branch still existed at the
audit, at `be4528b813e38b8c114ba433d227cdd989eba57c`.
Do not assume its tooling is installed on product main.

## What sensei is

[Sensei](https://github.com/spboyer/sensei) provides skill-quality assessment tooling.
The branch integration uses a submodule at `.github/skills/sensei` and wrappers
for its audit procedures. Inspect that branch's `.gitmodules`, scripts, and package
manifest before running them.

## Why sensei lives on `feat/skills-sensei` only

The audit dependency and its generated reports are separate from the product's
normal workflow. They add setup and maintenance requirements that users do not
need for requirements, planning, or deployment.

## What ships to `main` from a sensei branch

Reviewed improvements to product skills can ship independently of the audit
tooling. Classify changes before preparing a main-bound pull request:

| Change | Treatment |
|---|---|
| Submodule, wrappers, bootstrap, and audit-only commands | Keep separate unless their promotion is explicitly approved. |
| Audit reports and parser/test shims | Establish whether they are required product inputs before including them. |
| Skill content and related product fixes | Review against current main and its validators. |

## Merging sensei-bearing work into `main`

The branch's `merge-sensei-free-pr` procedure describes excluding audit-only
material. Verify that the prompt exists in the selected revision before invoking it.

Inspect every proposed exclusion and preserve unrelated work. Obtain approval
before destructive changes and requested GitHub writes. Do not bypass validators
to force the resulting branch through.

### Why squash-merge

Squashing a reviewed diff can avoid adding the source branch's intermediate
tooling commits to main's ancestry. It does not erase those commits from other
branches or GitHub, and it is not a remedy for committed secrets.

### Common failure modes

| Failure | Response |
|---|---|
| Wrapper or submodule missing | Verify the selected branch instead of installing undocumented dependencies. |
| Orphan references after exclusions | Repair references and repeat the affected validators. |
| GitHub authentication fails | Check `gh auth status` in the executing environment. |
| Uncommitted work conflicts with the procedure | Preserve it and resolve scope before applying exclusions. |

For optional `GH_TOKEN` forwarding, the `${localEnv:GH_TOKEN}` container setting
reads the host VS Code process environment. Integrated-terminal settings do not
populate it. See [container setup](/getting-started/dev-containers/).

## Running sensei audits locally

Use a separate checkout of the intended branch, inspect its setup, and run only
commands that its package manifest declares. Treat scores as evidence from that
revision and assessment method, not certification of current skill behavior.

The historical claim that every skill scored `1.00` is not a current acceptance
criterion. Product source tests and runtime verification remain separate.

## Related references

- [Contributing](/project/contributing/)
- [Skills and instructions](/concepts/how-it-works/skills-and-instructions/)
- [Workflow validation](/guides/e2e-testing/)
