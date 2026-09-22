import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

export async function checkUrls(urls, fetchImpl = fetch) {
  const failures = [];
  for (const url of urls) {
    try {
      const response = await fetchImpl(url, { method: "GET", signal: AbortSignal.timeout(15000), redirect: "follow" });
      await response.body?.cancel();
      if (!response.ok) failures.push({ url, status: response.status });
    } catch (error) {
      failures.push({ url, error: error.message });
    }
  }
  return failures;
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route("**/*", (route) => route.abort());
  const urls = new Set();
  try {
    for (const file of fs.readdirSync("dist", { recursive: true }).filter((file) => file.endsWith(".html"))) {
      await page.setContent(fs.readFileSync(path.join("dist", file), "utf8"), { waitUntil: "domcontentloaded" });
      for (const href of await page
        .locator("a[href]")
        .evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
        if (!/^https?:\/\//.test(href)) continue;
        const url = new URL(href);
        if (url.hostname === "apexops.pro") continue;
        url.hash = "";
        urls.add(url.href);
      }
    }
  } finally {
    await browser.close();
  }
  const batches = Array.from({ length: 8 }, () => []);
  [...urls].forEach((url, index) => batches[index % batches.length].push(url));
  const failures = (await Promise.all(batches.map((batch) => checkUrls(batch)))).flat();
  fs.mkdirSync("test-results", { recursive: true });
  fs.writeFileSync("test-results/external-links.json", JSON.stringify({ checked: urls.size, failures }, null, 2));
  console.log(`${urls.size} external URLs checked; ${failures.length} failures (including access/network errors).`);
  return failures.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  process.exitCode = await main();
