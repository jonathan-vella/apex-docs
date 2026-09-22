# APEX Documentation

Astro Starlight documentation for [APEX](https://github.com/jonathan-vella/apex).
The complete site was imported from the commit recorded in [migration-source.json](migration-source.json).
The original repository retains its history. Runtime agents, skills, templates and product tooling remain in APEX.

## Build and Test

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
