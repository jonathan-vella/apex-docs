import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { checkDocument, checkDocs } from "../scripts/check-docs.mjs";

const metadata = '---\ntitle: "Example"\ndescription: "A test page."\n---\n';
const names = ["apex-azure-defaults", "01-Orchestrator"];

test("editorial checks validate metadata and heading structure without inspecting fenced examples", () => {
  assert.match(checkDocument("No metadata", "example.md")[0], /frontmatter/);
  assert.match(checkDocument("---\ntitle: [\n---\n", "example.md")[0], /Invalid YAML/);
  assert.match(checkDocument("---\ntitle: 12\ndescription: ''\n---\n", "example.md").join("\n"), /title[\s\S]*description/);
  assert.match(checkDocument(metadata + "# Duplicate\n\n### Skipped\n", "example.md").join("\n"), /article H1[\s\S]*skips/);
  assert.deepEqual(checkDocument(metadata + "## Example\n\n````md\n# Sample\n```text\n### Sample\n```\n````\n", "example.mdx"), []);
});

test("editorial checks preserve exact known identifiers and exempt historical bodies, not metadata", () => {
  assert.match(checkDocument(metadata + "## APEX-Azure-defaults\n\nSelect `01-orchestrator`.", "example.md", names).join("\n"), /apex-azure-defaults[\s\S]*01-Orchestrator/);
  assert.deepEqual(checkDocument(metadata + "## apex-azure-defaults\n\nSelect `01-Orchestrator`.", "example.md", names), []);
  assert.deepEqual(checkDocument(metadata + "# Historical\n\n`APEX-Azure-defaults`", "demo/record.md", names), []);
  assert.match(checkDocument("---\ntitle: Demo\n---\n# Historical", "demo/record.md")[0], /description/);
});

test("all site pages pass the mechanical editorial checks", () => {
  assert.deepEqual(checkDocs(), []);
});

test("guidance review records explicit source evidence independently of the generated pin", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const review = JSON.parse(fs.readFileSync(path.join(root, "docs-review.json"), "utf8"));
  assert.equal(review.evidence, "source-review");
  assert.match(review.reviewedOn, /^\d{4}-\d{2}-\d{2}$/);
  for (const key of ["apex", "accelerator"]) {
    assert.equal(review[key].repository, key === "apex" ? "jonathan-vella/apex" : "jonathan-vella/apex-accelerator");
    assert.match(review[key].commit, /^[a-f0-9]{40}$/);
  }
});
