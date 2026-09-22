import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const pin = JSON.parse(fs.readFileSync(path.join(root, "apex-source.json"), "utf8"));
const source = path.join(root, ".apex-source");
const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: source, encoding: "utf8" }).trim();
if (sha !== pin.commit) throw new Error("APEX checkout does not match pin; run npm run source:prepare");
const output = path.join(root, "public/architecture-explorer-graph.json");
const previous = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, "utf8")) : null;
execFileSync(process.execPath, ["tools/scripts/generate-explorer-graph.mjs", "--output", output], {
  cwd: source,
  stdio: "inherit",
});
execFileSync(process.execPath, ["tools/scripts/validate-explorer-graph.mjs", "--input", output], {
  cwd: source,
  stdio: "inherit",
  env: { ...process.env, EXPLORER_GRAPH_STRICT: "1" },
});
const graph = JSON.parse(fs.readFileSync(output, "utf8"));
graph.sourceCommit = sha;
for (const node of graph.nodes) {
  if (node.links?.source) node.links.source = node.links.source.replace("/blob/main/", `/blob/${sha}/`);
}
if (
  previous &&
  JSON.stringify({ ...previous, generatedAt: null }) === JSON.stringify({ ...graph, generatedAt: null })
) {
  graph.generatedAt = previous.generatedAt;
}
fs.writeFileSync(output, `${JSON.stringify(graph, null, 2)}\n`);
