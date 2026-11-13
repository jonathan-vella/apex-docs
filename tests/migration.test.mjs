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

const retiredSourcePaths = new Set([
  "src/content/docs/concepts/how-it-works/four-pillars.md",
  "src/content/docs/guides/e2e-testing.md",
  "src/content/docs/guides/hooks.md",
  "src/content/docs/project/sensei-branch.md",
  "src/content/docs/reference/prompts/repository-prompts.md",
]);

const isRetiredSourcePath = (relative) =>
  relative.startsWith("src/content/docs/demo/") ||
  relative.startsWith("public/demo/") ||
  retiredSourcePaths.has(relative);

test("import retains active source pages and shared binary assets with provenance", () => {
  for (const original of originalPaths) {
    const relative = original.slice("site/".length);
    if (isRetiredSourcePath(relative)) continue;
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

test("frontmatter, built routes, and static redirects preserve all original documentation URLs", () => {
  for (const original of originalPaths.filter((file) => /\/content\/docs\/.*\.mdx?$/.test(file))) {
    const relative = original.slice("site/".length);
    const defaultRoute = relative
      .replace("src/content/docs/", "")
      .replace(/\.mdx?$/, "")
      .replace(/(^|\/)index$/, "")
      .replace(/\/$/, "");

    if (isRetiredSourcePath(relative)) {
      const redirectHtmlPath = path.join(root, "dist", defaultRoute, "index.html");
      assert.ok(fs.existsSync(redirectHtmlPath), `missing redirect for ${defaultRoute}`);
      const redirectHtml = fs.readFileSync(redirectHtmlPath, "utf8");
      const refreshMatch = redirectHtml.match(/http-equiv="refresh"\s+content="0;url=([^"#?]+)/i);
      assert.ok(refreshMatch, `expected static meta-refresh redirect in ${defaultRoute}`);
      const targetRoute = refreshMatch[1].replace(/^\//, "").replace(/\/$/, "");
      const targetHtmlPath = targetRoute
        ? path.join(root, "dist", targetRoute, "index.html")
        : path.join(root, "dist", "index.html");
      assert.ok(fs.existsSync(targetHtmlPath), `redirect target missing: ${defaultRoute} -> ${refreshMatch[1]}`);
      const targetHtml = fs.readFileSync(targetHtmlPath, "utf8");
      assert.ok(!/http-equiv="refresh"/i.test(targetHtml), `redirect chain detected: ${defaultRoute} -> ${refreshMatch[1]}`);
      continue;
    }

    const text = fs.readFileSync(path.join(root, relative), "utf8");
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(match, relative);
    const frontmatter = yaml.load(match[1]);
    assert.ok(frontmatter.title && frontmatter.description, relative);
    let route = frontmatter.slug ?? defaultRoute;
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
