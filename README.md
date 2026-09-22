# APEX documentation

Astro Starlight documentation for [APEX](https://github.com/jonathan-vella/apex).
The complete site was imported from the commit recorded in [migration-source.json](migration-source.json).
The original repository retains its history. Runtime agents, skills, templates and product tooling remain in APEX.

## Build and test

<a id="vs-code-container-wsl-x86-64"></a>

### VS Code container on WSL x86-64

Clone this repository into the WSL Linux filesystem (for example `~/src/apex-docs`, not `/mnt/c`).
Enable Docker Desktop's WSL integration, open the folder through VS Code's WSL extension,
and run **Dev Containers: Reopen in Container**. The host needs the WSL and Dev Containers extensions.

The container supplies Node 24, Python 3.14 in an isolated virtual environment, Graphviz,
Git/GitHub CLI, and Chromium with its Linux dependencies. Setup installs locked npm dependencies,
diagram tooling and the pinned APEX source. It installs only Chromium, not additional browsers,
and includes no Azure CLI, Terraform, Docker daemon or production credentials.

Docs-focused VS Code extensions cover Astro, Markdown, YAML, Python, Playwright, Copilot and PR review.
Existing VS Code Git credentials can be forwarded; no token or sign-in is required for the public source checkout.
Initial setup requires network access and may take several minutes.

Run `npm run dev -- --host 0.0.0.0` for the site; VS Code forwards port 4321.
No server or deployment starts automatically. Rebuild the container after changing its Dockerfile or Playwright lock version.
The **Docs Dev Container** CI job builds and tests this configuration on x86-64; ARM is not a supported target.

### Local toolchain

Use Linux with Node 24, Python 3.14, and Graphviz. The build command uses POSIX shell
syntax. A native Windows dev preview does not establish full build compatibility.

```bash
npm ci
npm run test:setup
npm run source:prepare
npm run build
npm run check:links
npm test
npx playwright install --with-deps chromium
npm run test:browser
```

The build uses the exact APEX revision in [apex-source.json](apex-source.json), never an implicit parent checkout.
Explorer generation uses the product's explicit `--output` interface and writes directly to this repository.
The pinned APEX source contains no Astro site; schema validation runs against the exported graph before building.
Tests also require Python 3.14 and Graphviz. Diagram regeneration runs in a temporary directory and never
overwrites the byte-preserved imported images. The diagram source is an authored illustration, not generated
directly from the workflow graph; source updates require review for semantic alignment.
The source updater proposes reviewed changes from APEX main. Browser tests exercise desktop and mobile navigation,
search, diagrams, Explorer metadata and downloads; CI retains reports and traces.

## Reviewing source updates

The generated source pin in `apex-source.json` and the guidance baseline in
`docs-review.json` are separate. Automated pin updates do not certify that the
maintained prose matches the new source. The footer and
[update guide](src/content/docs/guides/updating-apex.mdx) expose that distinction.

Source-update PRs include a path-based impact report from the last guidance
review to the candidate pin. It suggests affected pages and lists unmatched
changes for manual review. It does not determine semantic impact or perform
cloud validation. Review Accelerator changes separately.

To inspect a local comparison after fetching both commits into `.apex-source`:

```bash
npm run source:impact
```

The command defaults to `docs-review.json` and `apex-source.json`; use `--base`
and `--head` after `--` to compare explicit full commit SHAs. Missing commits
are errors, not an empty report. Update `docs-review.json` only after reviewing
the guidance against the recorded product and template revisions.

## Writing documentation

Read the [writing guide](src/content/docs/project/style-guide.md) and apply the
[Unslop skill](.github/skills/unslop/SKILL.md) explicitly. If your client does not
expose the skill, read its file and apply the rules directly.

Check product claims against the pinned source and adopter setup against the
Accelerator template. Preserve exact commands and historical evidence. Keep
published routes, heading anchors, and imported binary assets. New diagrams should
use new filenames and editable source.

`npm run check:links` checks built local paths and fragments, including static
redirects. Run `npm run check:external-links` when changing external destinations.
Network restrictions are not proof that a page no longer exists.

`npm run check:docs` checks all pages' required metadata and checks maintained
prose for heading structure and known identifier casing. It excludes fenced
examples and historical demo bodies from prose checks. The Node suite runs the
same checks, so existing CI, weekly, container and publishing jobs enforce them.
Unslop remains an explicit editorial review, not an automatic prose replacement.

The browser suite also runs selected axe accessibility checks in light and dark
themes on desktop and mobile, including the Explorer dialog. Reports retain
violations and checks that require manual assessment. Passing does not certify
site-wide accessibility.

<a id="hosting-cutover"></a>

## Publishing

GitHub Pages for this repository serves `https://apexops.pro`. The domain cutover
was complete when checked on September 22, 2026, and `DOCS_PUBLISH_ENABLED` was true.
The workflow and repository settings control publication; a local build does not
publish anything.

Do not change the domain, publishing controls, or source repository as part of an
ordinary content edit. Preview and review the changes before merging to the
publishing branch.
