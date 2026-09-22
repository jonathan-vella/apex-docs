import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import * as yaml from "js-yaml";

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const config = JSON.parse(read(".devcontainer/devcontainer.json"));

test("docs container targets amd64 with isolated Python and browser prerequisites", () => {
  assert.ok(config.runArgs.includes("--platform=linux/amd64"));
  assert.ok(config.runArgs.includes("--shm-size=1g"));
  assert.equal(config.remoteUser, "vscode");
  assert.equal(config.waitFor, "postCreateCommand");
  assert.ok(config.forwardPorts.includes(4321));
  const dockerfile = read(".devcontainer/Dockerfile");
  assert.match(dockerfile, /FROM node:24-bookworm-slim AS node/);
  assert.match(dockerfile, /FROM python:3\.14-slim-bookworm/);
  assert.match(dockerfile, /python3 -m venv \/home\/vscode\/\.venv/);
  assert.equal(config.customizations.vscode.settings["python.defaultInterpreterPath"], "/home/vscode/.venv/bin/python");
  assert.match(dockerfile, /git graphviz/);
  assert.match(dockerfile, /playwright install-deps chromium/);
  assert.match(dockerfile, /packages\["node_modules\/@playwright\/test"\]\.version/);
  assert.doesNotMatch(dockerfile, /azure-cli|terraform|docker\.sock/);
});

test("setup uses locked dependencies and prepares tests without deployment", () => {
  const setup = read(".devcontainer/post-create.sh");
  const syntax = spawnSync("bash", ["-n"], { input: setup, encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr);
  const pkg = JSON.parse(read("package.json"));
  for (const [, command] of setup.matchAll(/npm run ([\w:-]+)/g)) assert.ok(pkg.scripts[command], command);
  assert.match(setup, /npm ci/);
  assert.match(setup, /npm run source:prepare/);
  assert.match(setup, /playwright install chromium/);
  assert.doesNotMatch(setup, /gh auth|deploy|npm run dev|npm run preview/);
  for (const extension of ["astro-build.astro-vscode", "ms-playwright.playwright", "ms-python.python"])
    assert.ok(config.customizations.vscode.extensions.includes(extension));
});

test("CI builds the actual container and runs docs acceptance on an x86 runner", () => {
  const workflow = yaml.load(read(".github/workflows/devcontainer.yml"));
  assert.equal(workflow.jobs.smoke["runs-on"], "ubuntu-latest");
  const step = workflow.jobs.smoke.steps.find((entry) => entry.uses === "devcontainers/ci@v0.3");
  assert.equal(step.with.push, "never");
  for (const command of ["npm run build", "npm run check:links", "npm test", "npm run test:browser"])
    assert.ok(step.with.runCmd.includes(command));
});
