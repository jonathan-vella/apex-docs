import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { JSDOM } from "jsdom";

test("explorer drawer renders effective invocation metadata as text only for supported categories", async (context) => {
  const html = fs.readFileSync(new URL("../public/architecture-explorer.html", import.meta.url), "utf8");
  const variants = [
    { category: "agent", meta: {}, expected: ["true", "false", "Not declared", "Not declared"] },
    {
      category: "subagent",
      meta: { invocable: false, disableModelInvocation: false, context: null, argumentHint: null },
      expected: ["false", "false", "Not declared", "Not declared"],
    },
    {
      category: "skill",
      meta: {
        invocable: true,
        disableModelInvocation: true,
        context: "fork",
        argumentHint: '<img src=x onerror="alert(1)">',
      },
      expected: ["true", "true", "fork", '<img src=x onerror="alert(1)">'],
    },
    { category: "instruction", meta: {}, expected: [] },
  ];
  const nodes = variants.map((variant) => ({
    id: `${variant.category}:fixture`,
    category: variant.category,
    label: `${variant.category} fixture`,
    description: "Fixture",
    meta: variant.meta,
    path: `${variant.category}.md`,
    links: { source: `https://example.test/${variant.category}.md` },
  }));
  const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.test/architecture-explorer.html" });
  context.after(() => dom.window.close());
  dom.window.fetch = async () => ({ ok: true, json: async () => ({ nodes, edges: [] }) });
  for (const script of dom.window.document.querySelectorAll("script:not([src])")) {
    dom.window.eval(script.textContent);
  }
  await new Promise((resolve) => setImmediate(resolve));
  const document = dom.window.document;
  document.getElementById("btn-grid").click();
  for (const filter of document.querySelectorAll("#grid-filters .filter-chip:not(.active)")) {
    filter.click();
  }
  for (const [index, variant] of variants.entries()) {
    const card = document.querySelector(`#card-grid [data-node-id="${nodes[index].id}"]`);
    assert.ok(card, `Missing ${variant.category} card`);
    assert.equal(card.tagName, "BUTTON");
    assert.equal(document.getElementById("drawer").hidden, true);
    card.click();
    assert.equal(document.getElementById("drawer").getAttribute("aria-hidden"), "false");
    assert.equal(document.activeElement.id, "drawer-close");
    assert.equal(document.getElementById("explorer-content").hasAttribute("inert"), true);
    const body = document.getElementById("drawer-body");
    assert.deepEqual(
      [...body.querySelectorAll(".metadata dd")].map((entry) => entry.textContent),
      variant.expected,
    );
    assert.equal(body.querySelector("img"), null);
    if (variant.expected.length) {
      assert.match(body.textContent, /Source metadata \(effective defaults\)/);
      assert.match(body.textContent, /Source declarations and defaults, not runtime permissions\./);
    } else {
      assert.doesNotMatch(body.textContent, /Source metadata|runtime permissions/);
    }
    assert.equal(body.querySelector(".source-link").href, nodes[index].links.source);
    document.getElementById("drawer-close").click();
    assert.equal(document.getElementById("drawer").getAttribute("aria-hidden"), "true");
    assert.equal(document.getElementById("drawer").hidden, true);
    assert.equal(document.activeElement, card);
    assert.equal(document.getElementById("explorer-content").hasAttribute("inert"), false);
  }
});
