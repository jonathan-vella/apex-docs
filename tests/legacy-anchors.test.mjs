import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { JSDOM } from "jsdom";

const root = path.resolve(import.meta.dirname, "..");
const anchors = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "fixtures", "legacy-heading-anchors.json")));

test("published article heading anchors remain addressable after the refresh", () => {
  for (const [route, ids] of Object.entries(anchors)) {
    const file = path.join(root, "dist", route, "index.html");
    const dom = new JSDOM(fs.readFileSync(file, "utf8"));
    for (const id of ids) {
      assert.ok(dom.window.document.getElementById(id), `${route}#${id}`);
    }
    dom.window.close();
  }
});
