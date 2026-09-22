import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
export async function updateSource(target, fetchImpl = fetch) {
  const response = await fetchImpl("https://api.github.com/repos/jonathan-vella/apex/commits/main");
  if (!response.ok) throw new Error(`APEX lookup failed: ${response.status}`);
  const { sha } = await response.json();
  if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("Invalid upstream commit");
  const content = `${JSON.stringify({ repository: "jonathan-vella/apex", commit: sha }, null, 2)}\n`;
  if (fs.readFileSync(target, "utf8") === content) return false;
  fs.writeFileSync(target, content);
  return true;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await updateSource(path.resolve(import.meta.dirname, "../apex-source.json"));
}
