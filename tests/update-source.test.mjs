import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { updateSource } from "../scripts/update-source.mjs";

test("source update rejects failures, pins exact revisions and is idempotent", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "docs-pin-"));
  const target = path.join(directory, "pin.json");
  fs.writeFileSync(target, "original");
  try {
    await assert.rejects(
      updateSource(target, async () => ({ ok: false, status: 503 })),
      /503/,
    );
    await assert.rejects(
      updateSource(target, async () => ({ ok: true, json: async () => ({ sha: "main" }) })),
      /Invalid/,
    );
    assert.equal(fs.readFileSync(target, "utf8"), "original");
    const fetchImpl = async () => ({ ok: true, json: async () => ({ sha: "a".repeat(40) }) });
    assert.equal(await updateSource(target, fetchImpl), true);
    assert.equal(await updateSource(target, fetchImpl), false);
    assert.equal(JSON.parse(fs.readFileSync(target, "utf8")).commit, "a".repeat(40));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
