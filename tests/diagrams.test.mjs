import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

test("imported diagram source regenerates valid images without replacing published assets", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "docs-diagrams-"));
  try {
    fs.copyFileSync(
      new URL("../src/assets/diagrams/workflow-deep-dive/gen.py", import.meta.url),
      path.join(directory, "gen.py"),
    );
    execFileSync("python3", ["gen.py"], { cwd: directory, stdio: "pipe" });
    for (const name of ["e2e-orchestration.png", "lessons-loop.png"]) {
      const image = sharp(path.join(directory, name));
      const metadata = await image.metadata();
      assert.ok(metadata.width > 100 && metadata.height > 100, name);
      const stats = await image.stats();
      assert.ok(
        stats.channels.some((channel) => channel.stdev > 5),
        name,
      );
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
