import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/", "/getting-started/quickstart/", "/getting-started/dev-containers/",
  "/concepts/workflow-deep-dive/", "/reference/security-baseline/", "/demo/",
  "/reference/architecture-explorer/", "/guides/updating-apex/",
];

async function checkAccessibility(page, testInfo, name) {
  // Expressive Code updates scroll-region focusability in a debounced idle callback.
  await expect.poll(() => page.locator(".expressive-code pre").evaluateAll(blocks =>
    blocks.filter(block => block.scrollWidth > block.clientWidth && block.tabIndex < 0).length,
  )).toBe(0);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  await testInfo.attach(`${name}.json`, {
    body: JSON.stringify({ url: page.url(), violations: results.violations, incomplete: results.incomplete }, null, 2),
    contentType: "application/json",
  });
  expect(results.violations).toEqual([]);
}

for (const theme of ["light", "dark"]) {
  for (const route of routes) {
    test(`accessibility: ${theme} ${route}`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.addInitScript(value => localStorage.setItem("starlight-theme", value), theme);
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      if (route === "/reference/architecture-explorer/") {
        const explorer = page.frameLocator("iframe");
        await expect(explorer.locator("button.step").first()).toBeVisible();
        await checkAccessibility(page, testInfo, "page-and-explorer");
        await explorer.getByRole("tab", { name: "Agent Grid" }).click();
        await explorer.getByRole("searchbox", { name: "Search the architecture" }).fill("Orchestrator");
        await explorer.getByRole("button", { name: "Inspect 01-Orchestrator", exact: true }).focus();
        await page.keyboard.press("Enter");
        await expect(explorer.getByRole("dialog")).toBeVisible();
        await checkAccessibility(page, testInfo, "explorer-dialog");
      } else {
        await checkAccessibility(page, testInfo, "page");
      }
    });
  }
}
