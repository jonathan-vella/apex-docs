import { test, expect } from "@playwright/test";

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
  await explorer.locator("#card-grid .card").first().click();
  await expect(explorer.locator("#drawer")).toHaveAttribute("aria-hidden", "false");
});
