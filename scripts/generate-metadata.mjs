import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const pin = JSON.parse(fs.readFileSync(path.join(root, "apex-source.json"), "utf8"));
const source = path.join(root, ".apex-source");
const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: source, encoding: "utf8" }).trim();
if (sha !== pin.commit) throw new Error("APEX checkout does not match pin; run npm run source:prepare");
execFileSync(process.execPath, ["tools/scripts/generate-explorer-graph.mjs"], { cwd: source, stdio: "inherit" });
const graph = JSON.parse(fs.readFileSync(path.join(source, "site/public/architecture-explorer-graph.json"), "utf8"));
graph.sourceCommit = sha;
for (const node of graph.nodes) {
  if (node.links?.source) node.links.source = node.links.source.replace("/blob/main/", `/blob/${sha}/`);
}
fs.writeFileSync(path.join(root, "public/architecture-explorer-graph.json"), `${JSON.stringify(graph, null, 2)}\n`);
