import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const pin = JSON.parse(fs.readFileSync(path.join(root, "apex-source.json"), "utf8"));
if (pin.repository !== "jonathan-vella/apex" || !/^[a-f0-9]{40}$/.test(pin.commit))
  throw new Error("Invalid APEX source pin");
const source = path.join(root, ".apex-source");
if (!fs.existsSync(source)) fs.mkdirSync(source);
const run = (command, args) => execFileSync(command, args, { cwd: source, stdio: "inherit" });
if (!fs.existsSync(path.join(source, ".git"))) run("git", ["init"]);
run("git", ["fetch", "--depth=1", "https://github.com/jonathan-vella/apex.git", pin.commit]);
run("git", ["checkout", "--detach", pin.commit]);
const provenance = JSON.parse(fs.readFileSync(path.join(root, "migration-source.json"), "utf8"));
if (!/^[a-f0-9]{40}$/.test(provenance.commit)) throw new Error("Invalid migration provenance");
if (provenance.commit !== pin.commit)
  run("git", ["fetch", "--depth=1", "https://github.com/jonathan-vella/apex.git", provenance.commit]);
run("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
