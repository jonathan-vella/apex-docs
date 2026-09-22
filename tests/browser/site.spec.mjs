import { test, expect } from "@playwright/test";
import fs from "node:fs";

const review = JSON.parse(fs.readFileSync(new URL("../../docs-review.json", import.meta.url), "utf8"));

test("homepage introduction remains inside its styled paragraph", async ({ page }) => {
  await page.goto("/");
  const tagline = page.locator("p.landing-hero__tagline");
  await expect(tagline).toHaveText(
    "Use GitHub Copilot agents to capture requirements, assess costs and policy, and generate Bicep or Terraform. Review the evidence and approve each handoff before deployment.",
  );
  await expect(tagline).toHaveCSS("color", "rgb(186, 201, 218)");
});

test("compatibility identifies the guidance source separately from the site build", async ({ page }) => {
  await page.goto("/getting-started/quickstart/");
  const footer = page.locator(".site-footer");
  await expect(footer.getByRole("link", { name: `APEX ${review.apex.commit.slice(0, 12)}`, exact: true }))
    .toHaveAttribute("href", `https://github.com/${review.apex.repository}/tree/${review.apex.commit}`);
  await footer.getByRole("link", { name: "Compatibility and update guidance" }).click();
  await expect(page).toHaveURL(/\/guides\/updating-apex\/#documentation-compatibility$/);
  await expect(page.locator("main")).toContainText(review.apex.commit.slice(0, 12));
  await expect(page.locator("main")).toContainText(review.accelerator.commit.slice(0, 12));
});

test("navigation, canonical URLs and responsive content", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/getting-started/quickstart/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://apexops.pro/getting-started/quickstart/",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const menu = page.getByRole("button", { name: /menu/i });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("link", { name: "Architecture Explorer", exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/reference\/architecture-explorer\//);
  expect(errors).toEqual([]);
});

test("search returns a known documentation page", async ({ page }) => {
  await page.goto("/getting-started/quickstart/");
  await page
    .getByRole("button", { name: /search/i })
    .first()
    .click();
  const input = page.getByRole("textbox", { name: "Search", exact: true });
  await input.fill("governance");
  await expect(page.locator(".pagefind-ui__result-link").first()).toBeVisible();
  await page.locator(".pagefind-ui__result-link").first().click();
  await expect(page.locator("h1")).toBeVisible();
});

test("diagrams and published downloads render", async ({ page, request }) => {
  await page.goto("/concepts/workflow-deep-dive/");
  for (const details of await page.locator("main details:has(img)").all()) {
    await details.locator("summary").click();
  }
  const images = page.locator("main img");
  expect(await images.count()).toBeGreaterThan(0);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  for (const file of ["apex.PPTX", "agentic-infraops.PPTX", "bmit-2026.zip"]) {
    const response = await request.get(`/downloads/${file}`);
    expect(response.ok()).toBe(true);
    expect((await response.body()).length).toBeGreaterThan(1000);
  }
});

test("Explorer loads populated graph data", async ({ page, request }) => {
  const graph = await request.get("/architecture-explorer-graph.json");
  expect(graph.ok()).toBe(true);
  const data = await graph.json();
  expect(data.nodes.length).toBeGreaterThan(0);
  expect(data.edges.length).toBeGreaterThan(0);
  expect(data.sourceCommit).toMatch(/^[a-f0-9]{40}$/);
  await page.goto("/reference/architecture-explorer/");
  await expect(page.locator("h1")).toBeVisible();
  const explorer = page.frameLocator("iframe");
  await explorer.getByRole("tab", { name: "Agent Grid" }).click();
  await explorer.getByRole("searchbox", { name: "Search the architecture" }).fill("Orchestrator");
  await expect(explorer.locator("#card-grid .card").first()).toBeVisible();
  const card = explorer.getByRole("button", { name: "Inspect 01-Orchestrator", exact: true });
  await card.focus();
  await page.keyboard.press("Enter");
  await expect(explorer.locator("#drawer")).toHaveAttribute("aria-hidden", "false");
  await expect(explorer.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(explorer.locator("#drawer .source-link")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(explorer.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(explorer.locator("#drawer")).toBeHidden();
  await expect(card).toBeFocused();
  await page.keyboard.press("Space");
  await expect(explorer.getByRole("dialog")).toBeVisible();
});

test("back-to-top respects reduced motion and returns keyboard focus to the heading", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/getting-started/quickstart/");
  const button = page.getByRole("button", { name: "Back to top" });
  await expect(button).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(button).toBeVisible();
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("h1")).toBeFocused();
  await expect(button).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
