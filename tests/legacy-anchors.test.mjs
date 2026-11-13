import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { JSDOM } from "jsdom";

const root = path.resolve(import.meta.dirname, "..");
const anchors = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "fixtures", "legacy-heading-anchors.json")));

test("published article heading anchors remain addressable on active pages and redirected routes resolve cleanly", () => {
  for (const [route, ids] of Object.entries(anchors)) {
    const file = path.join(root, "dist", route, "index.html");
    assert.ok(fs.existsSync(file), `${route} missing from dist/`);
    const html = fs.readFileSync(file, "utf8");
    const refreshMatch = html.match(/http-equiv="refresh"\s+content="0;url=([^"]+)"/i);
    if (refreshMatch) {
      const [targetPath, fragment] = refreshMatch[1].split("#");
      const normalized = targetPath.replace(/^\//, "").replace(/\/$/, "");
      const targetFile = normalized
        ? path.join(root, "dist", normalized, "index.html")
        : path.join(root, "dist", "index.html");
      assert.ok(fs.existsSync(targetFile), `${route} redirects to missing ${targetPath}`);
      if (fragment) {
        const targetDom = new JSDOM(fs.readFileSync(targetFile, "utf8"));
        assert.ok(targetDom.window.document.getElementById(fragment), `${route} -> ${targetPath}#${fragment}`);
        targetDom.window.close();
      }
      continue;
    }
    const dom = new JSDOM(html);
    for (const id of ids) {
      assert.ok(dom.window.document.getElementById(id), `${route}#${id}`);
    }
    dom.window.close();
  }
});
