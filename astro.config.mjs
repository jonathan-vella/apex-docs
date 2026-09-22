// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { unified } from "@astrojs/markdown-remark";
import starlightLinksValidator from "starlight-links-validator";
import rehypeMermaid from "rehype-mermaid-lite";
import remarkGlossaryAnchors from "./src/lib/remark-glossary-anchors.mjs";
import { demoSidebarItems } from "./src/data/demoSteps.mjs";
import { SITE_BASE } from "./src/data/siteConfig.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://apexops.pro",
  base: SITE_BASE || "/",
  trailingSlash: "always",
  // Astro 7 changed the compressHTML default from `true` to `'jsx'` (strips
  // whitespace between inline elements using JSX rules). Pin to `true` to
  // preserve the v6 HTML-aware whitespace behavior and avoid prose regressions.
  compressHTML: true,
  redirects: {
    "/project/": "/project/contributing/",
    "/guides/security-baseline/": "/reference/security-baseline/",
    "/guides/cost-governance/": "/reference/cost-governance/",
    "/guides/prompt-guide/best-practices/": "/reference/prompts/best-practices/",
    "/guides/prompt-guide/workflow-prompts/": "/reference/prompts/workflow-prompts/",
    "/guides/prompt-guide/repository-prompts/": "/reference/prompts/repository-prompts/",
    "/guides/prompt-guide/reference/": "/reference/prompts/skills-subagents/",
  },
  markdown: {
    // Astro 7's default Markdown processor is Sätteri. Use the unified()
    // processor from @astrojs/markdown-remark to keep the remark/rehype
    // pipeline (glossary anchors + mermaid) running. This replaces the
    // now-deprecated top-level markdown.remarkPlugins / rehypePlugins options.
    processor: unified({
      remarkPlugins: [remarkGlossaryAnchors],
      rehypePlugins: [rehypeMermaid],
    }),
  },
  integrations: [
    starlight({
      title: "APEX",
      description: "Plan and verify Azure infrastructure with GitHub Copilot agents and human approval.",
      favicon: "/images/favicon.svg",
      logo: {
        src: "./src/assets/images/logo.svg",
      },
      editLink: {
        baseUrl: "https://github.com/jonathan-vella/apex-docs/edit/main/",
      },
      lastUpdated: true,
      social: [
        {
          icon: "seti:graphql",
          label: "Architecture Explorer",
          href: "/reference/architecture-explorer/",
        },
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/jonathan-vella/apex",
        },
      ],
      head: [
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "https://apexops.pro/images/og-card.png",
          },
        },
        {
          tag: "meta",
          attrs: { property: "og:type", content: "website" },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:card",
            content: "summary_large_image",
          },
        },
        {
          tag: "script",
          attrs: {
            type: "module",
          },
          // Lazy Mermaid bootstrap — skip the CDN load entirely on pages that
          // contain no `.mermaid` elements. Saves ~150 KB of JS on the
          // majority of docs pages (FAQ, glossary, reference pages, etc.).
          content: [
            `(async()=>{`,
            `if(!document.querySelector('.mermaid'))return;`,
            `document.querySelectorAll('.mermaid').forEach((e,i)=>{e.tabIndex=0;e.setAttribute('role','region');e.setAttribute('aria-label','Diagram '+(i+1)+', scroll to view');});`,
            `const {default:mermaid}=await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs');`,
            `const d=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&window.matchMedia('(prefers-color-scheme:dark)').matches);`,
            // startOnLoad fires on DOMContentLoaded; the dynamic import resolves
            // after that, so the auto-run never triggers. Initialize with
            // startOnLoad:false and call mermaid.run() explicitly.
            `mermaid.initialize({startOnLoad:false,theme:'base',themeVariables:d?{background:'#0d1117',primaryColor:'#21262d',primaryTextColor:'#f0f6fc',primaryBorderColor:'#0078d4',lineColor:'#484f58',secondaryColor:'#161b22',tertiaryColor:'#30363d',noteBkgColor:'#161b22',noteTextColor:'#d0d7de',noteBorderColor:'#30363d',actorBkg:'#161b22',actorBorder:'#30363d',actorTextColor:'#f0f6fc',actorLineColor:'#484f58',signalColor:'#d0d7de',signalTextColor:'#d0d7de',labelBoxBkgColor:'#21262d',labelBoxBorderColor:'#30363d',labelTextColor:'#d0d7de',loopTextColor:'#8b949e',activationBorderColor:'#0078d4',activationBkgColor:'#21262d',sequenceNumberColor:'#f0f6fc',sectionBkgColor:'#161b22',altSectionBkgColor:'#21262d',sectionBkgColor2:'#21262d',excludeBkgColor:'#30363d',taskBorderColor:'#0078d4',taskBkgColor:'#21262d',taskTextColor:'#f0f6fc',activeTaskBorderColor:'#0078d4',activeTaskBkgColor:'#1e3a5f',gridColor:'#30363d',doneTaskBkgColor:'#1e3a5f',doneTaskBorderColor:'#0078d4',critBorderColor:'#f85149',critBkgColor:'#3d1f28',titleColor:'#f0f6fc',edgeLabelBackground:'#21262d',mainBkg:'#161b22',nodeBorder:'#30363d',clusterBkg:'#21262d',clusterBorder:'#30363d',defaultLinkColor:'#484f58',textColor:'#d0d7de',nodeTextColor:'#f0f6fc'}:{primaryColor:'#dbeafe',primaryTextColor:'#1b1b1f',primaryBorderColor:'#0078d4',lineColor:'#8b949e',secondaryColor:'#eaeef2',tertiaryColor:'#f6f8fa',background:'#ffffff',mainBkg:'#dbeafe',nodeBorder:'#0078d4',nodeTextColor:'#1b1b1f',textColor:'#1b1b1f'}});`,
            `await mermaid.run({querySelector:'.mermaid'});`,
            `document.querySelectorAll('.mermaid svg').forEach(s=>{s.removeAttribute('width');s.style.width='auto';s.style.maxWidth='none';});`,
            `})();`,
          ].join(""),
        },
      ],
      customCss: [
        "@fontsource/space-grotesk/400.css",
        "@fontsource/space-grotesk/700.css",
        "@fontsource/manrope/400.css",
        "@fontsource/manrope/700.css",
        "@fontsource/ibm-plex-mono/400.css",
        "./src/styles/custom.css",
      ],
      expressiveCode: {
        styleOverrides: { borderRadius: "0.5rem" },
      },
      components: {
        Footer: "./src/components/Footer.astro",
        MarkdownContent: "./src/components/MarkdownContent.astro",
      },
      plugins: [
        starlightLinksValidator({
          errorOnRelativeLinks: false,
          errorOnInvalidHashes: false,
        }),
      ],
      sidebar: [
        {
          label: "Get started",
          collapsed: true,
          items: [
            { label: "Start here", slug: "getting-started" },
            { label: "Quickstart", slug: "getting-started/quickstart" },
            {
              label: "Dev container setup",
              slug: "getting-started/dev-containers",
            },
            { label: "Azure access", slug: "getting-started/azure-setup" },
          ],
        },
        {
          label: "Run the workflow",
          collapsed: true,
          items: [
            { label: "Workflow overview", slug: "concepts/workflow" },
            { label: "Step 1: Requirements", slug: "concepts/workflow/step-1" },
            { label: "Step 2: Architecture", slug: "concepts/workflow/step-2" },
            { label: "Step 3: Design, optional", slug: "concepts/workflow/step-3" },
            { label: "Step 3.5: Governance", slug: "concepts/workflow/step-3-5" },
            { label: "Step 4: IaC plan", slug: "concepts/workflow/step-4" },
            { label: "Step 5: IaC code", slug: "concepts/workflow/step-5" },
            { label: "Step 6: Deploy", slug: "concepts/workflow/step-6" },
            { label: "Step 7: As-built", slug: "concepts/workflow/step-7" },
            { label: "Lessons learned", slug: "concepts/workflow/post-lessons" },
          ],
        },
        {
          label: "Concepts",
          collapsed: true,
          items: [
            {
              label: "How APEX works",
              collapsed: true,
              items: [
                {
                  label: "Overview",
                  slug: "concepts/how-it-works",
                },
                {
                  label: "System architecture",
                  slug: "concepts/how-it-works/architecture",
                },
                {
                  label: "Core concepts",
                  slug: "concepts/how-it-works/four-pillars",
                },
                {
                  label: "Agent architecture",
                  slug: "concepts/how-it-works/agents",
                },
                {
                  label: "Skills and instructions",
                  slug: "concepts/how-it-works/skills-and-instructions",
                },
                {
                  label: "Workflow engine and validation",
                  slug: "concepts/how-it-works/workflow-engine",
                },
                {
                  label: "MCP integration",
                  slug: "concepts/how-it-works/mcp-integration",
                },
                {
                  label: "SKU manifest",
                  slug: "concepts/how-it-works/sku-manifest",
                },
                { label: "Workflow deep dive", slug: "concepts/workflow-deep-dive" },
              ],
            },
          ],
        },
        {
          label: "Guides and troubleshooting",
          collapsed: true,
          items: [
            { label: "Updating APEX", slug: "guides/updating-apex" },
            { label: "Prompt guide", slug: "guides/prompt-guide" },
            { label: "Troubleshooting", slug: "guides/troubleshooting" },
            { label: "Session state debugging", slug: "guides/session-debugging" },
            { label: "Debug-log export", slug: "guides/apex-debug-log-export" },
            { label: "azd deployment", slug: "guides/azd-deployment" },
            { label: "Workflow validation", slug: "guides/e2e-testing" },
          ],
        },
        {
          label: "Reference",
          collapsed: true,
          items: [
            { label: "FAQ", slug: "reference/faq" },
            {
              label: "Validation and linting",
              slug: "reference/validation-reference",
            },
            { label: "Security baseline", slug: "reference/security-baseline" },
            { label: "Cost governance", slug: "reference/cost-governance" },
            {
              label: "Prompt reference",
              collapsed: true,
              items: [
                { label: "Prompting practices", slug: "reference/prompts/best-practices" },
                { label: "Workflow prompts", slug: "reference/prompts/workflow-prompts" },
                { label: "Repository slash prompts", slug: "reference/prompts/repository-prompts" },
                { label: "Skills and subagents", slug: "reference/prompts/skills-subagents" },
              ],
            },
            {
              label: "Architecture Explorer",
              slug: "reference/architecture-explorer",
            },
            { label: "Glossary", slug: "reference/glossary" },
            { label: "Resources and downloads", slug: "reference/resources" },
          ],
        },
        {
          label: "Contribute",
          collapsed: true,
          items: [
            { label: "Contributing", slug: "project/contributing" },
            { label: "Writing guide", slug: "project/style-guide" },
            { label: "Sensei branch", slug: "project/sensei-branch" },
            { label: "Changelog", slug: "project/changelog" },
            { label: "Agent hooks", slug: "guides/hooks" },
            { label: "Dev container hygiene", slug: "guides/devcontainer-hygiene" },
            { label: "Base-image validation", slug: "guides/devcontainer-base-validation" },
          ],
        },
        {
          label: "Case study: Il-Pastizzeria ta' Mario",
          collapsed: true,
          items: demoSidebarItems,
        },
      ],
    }),
  ],
});
