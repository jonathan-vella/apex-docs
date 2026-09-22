import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { impactAreas, renderImpactReport, sourceImpact } from "../scripts/source-impact.mjs";

const base = "a".repeat(40);
const head = "b".repeat(40);

test("impact review maps contracts and setup while retaining unmatched paths and review limits", () => {
  const report = renderImpactReport(base, head, [
    ".github/agents/07b-bicep-deploy.agent.md", ".devcontainer/devcontainer.json",
    ".github/instructions/references/iac-security-baseline.md", "other/<changed>.txt",
  ]);
  assert.match(report, /4 changed paths/);
  assert.match(report, /concepts\/workflow\/step-6.md/);
  assert.match(report, /getting-started\/quickstart.md/);
  assert.match(report, /Other upstream changes/);
  assert.match(report, /other\/&lt;changed&gt;\.txt/);
  assert.match(report, /does not determine semantic impact/);
  assert.match(report, /docs-review\.json only after/);
  assert.match(renderImpactReport(base, base, []), /No source-tree changes/);
  assert.throws(() => renderImpactReport("main", head, []), /Invalid/);
});

test("impact suggestions refer to documentation that exists", () => {
  for (const area of impactAreas) for (const file of area.docs) {
    assert.ok(fs.existsSync(path.join(import.meta.dirname, "../src/content/docs", file)), file);
  }
});

test("source impact compares exact trees and includes deletions without changing the checkout", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "apex-impact-"));
  const git = (...args) => execFileSync("git", args, { cwd: directory, encoding: "utf8" }).trim();
  try {
    git("init", "--quiet");
    git("config", "user.name", "Test");
    git("config", "user.email", "test@example.invalid");
    fs.writeFileSync(path.join(directory, "old.txt"), "old");
    git("add", ".");
    git("-c", "commit.gpgsign=false", "commit", "-qm", "baseline");
    const before = git("rev-parse", "HEAD");
    fs.unlinkSync(path.join(directory, "old.txt"));
    fs.writeFileSync(path.join(directory, "new.txt"), "new");
    git("add", "-A");
    git("-c", "commit.gpgsign=false", "commit", "-qm", "candidate");
    const after = git("rev-parse", "HEAD");
    const report = sourceImpact(directory, before, after);
    assert.match(report, /2 changed paths/);
    assert.match(report, /old\.txt/);
    assert.match(report, /new\.txt/);
    assert.equal(git("rev-parse", "HEAD"), after);
    assert.equal(git("status", "--porcelain"), "");
    assert.throws(() => sourceImpact(directory, "c".repeat(40), after));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
