import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import * as yaml from "js-yaml";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, ".apex-source");
const origin = JSON.parse(fs.readFileSync(path.join(root, "migration-source.json"), "utf8"));
const pin = JSON.parse(fs.readFileSync(path.join(root, "apex-source.json"), "utf8"));
const hash = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const originalPaths = execFileSync(
  "git",
  ["ls-tree", "-r", "--name-only", origin.commit, "site/src/content/docs", "site/public", "site/src/assets"],
  { cwd: source, encoding: "utf8" },
)
  .trim()
  .split("\n");

test("import retains all source pages and binary assets with provenance", () => {
  for (const original of originalPaths) {
    const relative = original.slice("site/".length);
    assert.ok(fs.existsSync(path.join(root, relative)), relative);
    if (/\.(png|jpg|jpeg|svg|zip|PPTX|webp|gif)$/.test(relative)) {
      const bytes = execFileSync("git", ["show", `${origin.commit}:${original}`], {
        cwd: source,
        maxBuffer: 32 * 1024 * 1024,
      });
      assert.equal(hash(fs.readFileSync(path.join(root, relative))), hash(bytes), relative);
    }
  }
});

test("frontmatter and built routes preserve the original documentation URLs", () => {
  for (const original of originalPaths.filter((file) => /\/content\/docs\/.*\.mdx?$/.test(file))) {
    const relative = original.slice("site/".length);
    const text = fs.readFileSync(path.join(root, relative), "utf8");
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(match, relative);
    const frontmatter = yaml.load(match[1]);
    assert.ok(frontmatter.title && frontmatter.description, relative);
    let route = frontmatter.slug ?? relative.replace("src/content/docs/", "").replace(/\.mdx?$/, "");
    route = route.replace(/(^|\/)index$/, "").replace(/\/$/, "");
    const output = route === "404" ? "404.html" : path.join(route, "index.html");
    assert.ok(fs.existsSync(path.join(root, "dist", output)), route);
  }
});

test("Explorer source and edit links use their correct repositories", () => {
  assert.equal(fs.existsSync(path.join(source, "site/package.json")), false);
  assert.equal(fs.existsSync(path.join(source, "site/public/architecture-explorer-graph.json")), false);
  const graph = JSON.parse(fs.readFileSync(path.join(root, "public/architecture-explorer-graph.json"), "utf8"));
  assert.equal(graph.sourceCommit, pin.commit);
  assert.ok(graph.nodes.length && graph.edges.length);
  for (const node of graph.nodes) {
    if (node.links?.source) assert.ok(node.links.source.includes(`/apex/blob/${pin.commit}/`));
  }
  assert.match(fs.readFileSync(path.join(root, "astro.config.mjs"), "utf8"), /apex-docs\/edit\/main\//);
});

test("documentation dependencies retain portable registry URLs and integrity", () => {
  const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
  for (const [name, entry] of Object.entries(lock.packages)) {
    if (!entry.resolved?.startsWith("https://")) continue;
    assert.equal(new URL(entry.resolved).origin, "https://registry.npmjs.org", name);
    assert.ok(entry.integrity, name);
  }
});

test("repeated metadata exports are stable and never modify pinned APEX source", () => {
  const target = path.join(root, "public/architecture-explorer-graph.json");
  execFileSync(process.execPath, [path.join(root, "scripts/generate-metadata.mjs")], { cwd: root, stdio: "pipe" });
  const first = fs.readFileSync(target, "utf8");
  execFileSync(process.execPath, [path.join(root, "scripts/generate-metadata.mjs")], { cwd: root, stdio: "pipe" });
  assert.equal(fs.readFileSync(target, "utf8"), first);
  assert.equal(
    execFileSync("git", ["status", "--porcelain", "--untracked-files=no"], { cwd: source, encoding: "utf8" }).trim(),
    "",
  );
});
