import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = path.resolve(import.meta.dirname, "..");
export const impactAreas = [
  {
    title: "Agent ownership, reviews and artifacts",
    pattern: /^(AGENTS\.md$|\.github\/(agents\/|skills\/apex-(workflow-engine|iac-common|azure-artifacts)\/)|tools\/apex-recall\/)/,
    docs: ["concepts/workflow.md", "concepts/workflow/", "concepts/how-it-works/agents.md", "guides/session-debugging.md", "reference/prompts/workflow-prompts.md"],
  },
  {
    title: "Setup, authentication and maintenance",
    pattern: /^(\.devcontainer\/|\.vscode\/|\.github\/workflows\/|package(-lock)?\.json$|tools\/scripts\/.*(setup|init|sync|container))/,
    docs: ["getting-started/quickstart.md", "getting-started/dev-containers.md", "getting-started/azure-setup.md", "guides/updating-apex.mdx"],
  },
  {
    title: "Security, policy, pricing and validation",
    pattern: /^(\.github\/(instructions\/|skills\/apex-(azure-defaults|azure-prepare|azure-deploy|azure-validate|azure-pricing|bicep|terraform)[^/]*\/)|tools\/(validators\/|scripts\/.*(validat|policy|cost|sku|preflight)))/,
    docs: ["reference/security-baseline.md", "reference/cost-governance.md", "reference/validation-reference.md", "concepts/workflow/step-6.md", "guides/azd-deployment.mdx"],
  },
  {
    title: "Skills, prompts, hooks and integrations",
    pattern: /^\.github\/(skills\/|prompts\/|hooks\/|plugins\/|copilot-instructions\.md$)/,
    docs: ["concepts/how-it-works/skills-and-instructions.md", "concepts/how-it-works/mcp-integration.md", "reference/prompts/skills-subagents.md", "reference/prompts/repository-prompts.md", "guides/hooks.md"],
  },
];

const code = value => `<code>${value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#13;").replace(/\n/g, "&#10;")}</code>`;
const validateCommit = value => {
  if (!/^[a-f0-9]{40}$/.test(value ?? "")) throw new Error(`Invalid source commit: ${value}`);
};

export function renderImpactReport(base, head, changedPaths) {
  validateCommit(base);
  validateCommit(head);
  const files = [...new Set(changedPaths)].sort();
  const sections = impactAreas.map(area => ({ ...area, files: files.filter(file => area.pattern.test(file)) }));
  sections.push({
    title: "Other upstream changes",
    docs: [],
    files: files.filter(file => !impactAreas.some(area => area.pattern.test(file))),
  });
  const lines = [
    "# APEX source update: documentation review",
    "",
    `Comparison baseline: [${base.slice(0, 12)}](https://github.com/jonathan-vella/apex/tree/${base}).`,
    `Candidate source: [${head.slice(0, 12)}](https://github.com/jonathan-vella/apex/tree/${head}).`,
    "",
    `[Compare source trees](https://github.com/jonathan-vella/apex/compare/${base}..${head}). ${files.length} changed paths, including deletions.`,
    "",
    "This report matches paths to likely documentation owners. It does not determine semantic impact, rewrite prose, or establish runtime correctness. A path can affect more than one section.",
    "By default, the baseline is the last recorded guidance review, not merely the previous Explorer pin, so unreviewed changes remain visible across pin updates. Explicit CLI commit overrides compare the revisions supplied by the caller.",
    "",
  ];
  if (!files.length) lines.push("No source-tree changes were found between these revisions.", "");
  for (const section of sections.filter(section => section.files.length)) {
    lines.push(`## ${section.title}`, "");
    if (section.docs.length) {
      lines.push(`Review these pages under ${code("src/content/docs/")}:`, ...section.docs.map(file => `- ${code(file)}`), "");
    } else {
      lines.push("Assess these paths manually. An unmatched path is not evidence that documentation is unaffected.", "");
    }
    lines.push("<details>", `<summary>${section.files.length} changed paths</summary>`, "");
    lines.push(...section.files.slice(0, 40).map(file => `- ${code(file)}`));
    if (section.files.length > 40) lines.push("", "Only the first 40 paths are shown here. Use the source comparison for the complete set.");
    lines.push("", "</details>", "");
  }
  lines.push(
    "## Human review before merge",
    "",
    "- [ ] Review changed contracts, setup requirements and unmatched paths. Record affected pages or explain why no prose change is needed.",
    "- [ ] Compare Accelerator behavior separately where adopter setup changes. An APEX pin update does not verify the template.",
    "- [ ] Apply Unslop to maintained prose and preserve routes, anchors, exact identifiers and historical records.",
    "- [ ] State which checks ran and which behavior was only source-reviewed. Site tests do not validate Azure operations.",
    "- [ ] Update docs-review.json only after completing the guidance review. Do not advance its baseline merely because metadata builds.",
    "",
    "Deployment remains the responsibility of the APEX agents and the owner's approvals. This update does not authorize cloud operations.",
    "",
  );
  return lines.join("\n");
}

export function sourceImpact(source, base, head) {
  validateCommit(base);
  validateCommit(head);
  const output = execFileSync("git", ["diff", "--name-only", "--no-renames", "-z", base, head, "--"], {
    cwd: source, encoding: "utf8", stdio: "pipe", maxBuffer: 16 * 1024 * 1024,
  });
  return renderImpactReport(base, head, output.split("\0").filter(Boolean));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({
    options: {
      base: { type: "string" },
      head: { type: "string" },
      output: { type: "string" },
    },
  });
  const review = JSON.parse(fs.readFileSync(path.join(root, "docs-review.json"), "utf8"));
  const pin = JSON.parse(fs.readFileSync(path.join(root, "apex-source.json"), "utf8"));
  const report = sourceImpact(path.join(root, ".apex-source"), values.base ?? review.apex.commit, values.head ?? pin.commit);
  if (values.output) fs.writeFileSync(values.output, report);
  else process.stdout.write(report);
}
