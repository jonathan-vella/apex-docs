import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import test from "node:test";
import { checkLinks } from "../check-links.mjs";

function fixture(context, files) {
  const root = mkdtempSync(join(tmpdir(), "apex-docs-links-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    const file = join(root, name);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  return root;
}

test("checks local, encoded, same-origin and redirect fragments without parsing script strings", (context) => {
  const root = fixture(context, {
    "index.html": `<h2 id="local"></h2>
      <a href="#local">Local</a><a href="/target/?q=x#caf%C3%A9">Encoded</a>
      <a href="https://apexops.pro/target/#café">Absolute</a>
      <a href="/old/#café">Redirect</a><a href="/asset.svg#drawing">Asset</a>
      <a href="https://example.test/#unknown">External</a>
      <script>const text = '<a href="/not-a-link/">';</script>`,
    "target/index.html": '<h2 id="café">Target</h2>',
    "old/index.html": '<meta http-equiv="refresh" content="0;url=/target/">',
    "asset.svg": '<svg xmlns="http://www.w3.org/2000/svg"><g id="drawing"/></svg>',
  });
  assert.deepEqual(checkLinks(root).failures, []);
});

test("reports missing pages, fragment-only links, malformed encoding and redirect cycles", (context) => {
  const root = fixture(context, {
    "index.html": '<a href="#absent">Hash</a><a href="/gone/">Gone</a><a href="#%zz">Bad</a><a href="/loop/">Cycle</a>',
    "loop/index.html": '<meta http-equiv="refresh" content="0;url=/loop/">',
  });
  const { failures } = checkLinks(root);
  assert.equal(failures.length, 5);
  assert.ok(failures.some(({ reason }) => reason.includes("Missing fragment")));
  assert.ok(failures.some(({ reason }) => reason.includes("Missing target")));
  assert.ok(failures.some(({ reason }) => reason.includes("Redirect cycle")));
});

test("resolves a non-root site base and preserves an explicit redirect fragment", (context) => {
  const root = fixture(context, {
    "index.html": '<a href="/docs/old/#removed">Old</a><a href="/outside/">Outside</a>',
    "old/index.html": '<meta http-equiv="refresh" content="0;url=/docs/target/#current">',
    "target/index.html": '<a name="current"></a>',
  });
  const { failures } = checkLinks(root, { base: "/docs" });
  assert.equal(failures.length, 1);
  assert.match(failures[0].reason, /outside the site base/);
});
