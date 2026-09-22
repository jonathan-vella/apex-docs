import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";

const root = path.resolve(import.meta.dirname, "..");
const parser = unified().use(remarkParse);
const plainText = node => node.value ?? (node.children ?? []).map(plainText).join("");

export function checkDocument(text, filename, identifiers = []) {
  const issues = [];
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) return ["Missing YAML frontmatter"];
  let metadata;
  try {
    metadata = load(frontmatter[1]);
  } catch (error) {
    return [`Invalid YAML frontmatter: ${error.message}`];
  }
  for (const field of ["title", "description"]) {
    if (typeof metadata?.[field] !== "string" || !metadata[field].trim()) issues.push(`Missing nonempty ${field}`);
  }
  if (filename.replaceAll("\\", "/").startsWith("demo/")) return issues;
  const canonical = new Map(identifiers.map(name => [name.toLowerCase(), name]));
  const offset = frontmatter[0].split("\n").length - 1;
  let previousDepth = 1;
  const walk = node => {
    const line = (node.position?.start.line ?? 1) + offset;
    if (node.type === "heading") {
      if (node.depth === 1) issues.push(`Line ${line}: use the frontmatter title, not an article H1`);
      else if (node.depth > previousDepth + 1) issues.push(`Line ${line}: heading skips from H${previousDepth} to H${node.depth}`);
      previousDepth = node.depth;
    }
    if (node.type === "heading" || node.type === "inlineCode") {
      const value = plainText(node);
      const expected = canonical.get(value.toLowerCase());
      if (expected && value !== expected) issues.push(`Line ${line}: use the exact identifier "${expected}", not "${value}"`);
    }
    if (node.type !== "code") for (const child of node.children ?? []) walk(child);
  };
  walk(parser.parse(text.slice(frontmatter[0].length)));
  return issues;
}

export function checkDocs() {
  const graph = JSON.parse(fs.readFileSync(path.join(root, "public/architecture-explorer-graph.json"), "utf8"));
  const identifiers = graph.nodes.filter(node => ["agent", "subagent", "skill"].includes(node.category)).map(node => node.label);
  const docs = path.join(root, "src/content/docs");
  const failures = [];
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(filename);
      else if (/\.mdx?$/.test(entry.name)) {
        const relative = path.relative(docs, filename);
        failures.push(...checkDocument(fs.readFileSync(filename, "utf8"), relative, identifiers).map(issue => `${relative}: ${issue}`));
      }
    }
  };
  visit(docs);
  return failures;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const failures = checkDocs();
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Documentation metadata, heading structure and known identifier casing passed. Unslop still requires editorial review.");
  }
}
