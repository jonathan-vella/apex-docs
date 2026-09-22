# APEX Documentation

Astro Starlight documentation for [APEX](https://github.com/jonathan-vella/apex).
The complete site was imported from the commit recorded in [migration-source.json](migration-source.json).
The original repository retains its history. Runtime agents, skills, templates and product tooling remain in APEX.

## Build and Test

### VS Code Container (WSL x86-64)

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

### Local Toolchain

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

## Hosting Cutover

The intended domain remains `https://apexops.pro`, with existing paths unchanged.
Pages publication is disabled until a human approves the cutover and sets `DOCS_PUBLISH_ENABLED=true`.
Do not set that variable or move the domain while the old APEX site is still the active publisher.
The original site must remain available until preview checks and post-cutover live tests pass.
Removal of the old site is a separate reviewed APEX change, not part of this import.
APEX documentation and Astro Starlight site
