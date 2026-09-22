#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { SITE_BASE } from "./src/data/siteConfig.mjs";

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}

export function checkLinks(directory, { origin = "https://apexops.pro", base = SITE_BASE } = {}) {
  const root = resolve(directory);
  const pages = new Map();
  for (const file of htmlFiles(root)) {
    const dom = new JSDOM(readFileSync(file, "utf8"));
    const document = dom.window.document;
    const redirect = document.querySelector('meta[http-equiv="refresh" i]')?.content;
    pages.set(file, {
      hrefs: [...document.querySelectorAll("[href]")].map((node) => node.getAttribute("href")),
      ids: new Set([...document.querySelectorAll("[id],a[name]")].map((node) => node.id || node.getAttribute("name"))),
      redirect: redirect?.match(/;\s*url\s*=\s*(.+)$/i)?.[1].replace(/^["']|["']$/g, ""),
    });
    dom.window.close();
  }

  function targetFile(url) {
    let pathname = decodeURIComponent(url.pathname);
    if (base && pathname !== base && !pathname.startsWith(`${base}/`)) {
      throw new Error(`Target is outside the site base ${base}`);
    }
    pathname = pathname.slice(base.length);
    const target = resolve(root, `.${pathname}`);
    const local = relative(root, target);
    if (local === ".." || local.startsWith(`..${sep}`) || isAbsolute(local)) {
      throw new Error("Target is outside the build directory");
    }
    return [target, join(target, "index.html"), `${target}.html`]
      .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  }

  function verify(url, seen = new Set()) {
    if (url.origin !== origin) return;
    if (seen.has(url.href)) throw new Error("Redirect cycle");
    seen.add(url.href);
    const file = targetFile(url);
    if (!file) throw new Error(`Missing target ${url.pathname}`);
    const page = pages.get(file);
    if (page?.redirect) {
      const destination = new URL(page.redirect, url);
      if (!destination.hash) destination.hash = url.hash;
      return verify(destination, seen);
    }
    if (page && url.hash && url.hash !== "#") {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!page.ids.has(id)) throw new Error(`Missing fragment ${url.hash} in ${url.pathname}`);
    }
  }

  const failures = [];
  let checked = 0;
  for (const [file, page] of pages) {
    const route = `${base}/${relative(root, file).split(sep).join("/")}`.replace(/index\.html$/, "");
    const from = new URL(route, origin);
    for (const href of [...page.hrefs, ...(page.redirect ? [page.redirect] : [])]) {
      try {
        const url = new URL(href, from);
        if (!["http:", "https:"].includes(url.protocol) || url.origin !== origin) continue;
        checked++;
        verify(url);
      } catch (error) {
        failures.push({ page: route, href, reason: error.message });
      }
    }
  }
  return { checked, failures };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { checked, failures } = checkLinks(resolve(dirname(fileURLToPath(import.meta.url)), "dist"));
  for (const failure of failures) {
    console.error(`${failure.page}: ${failure.href}\n  ${failure.reason}`);
  }
  console.log(`${checked} internal links checked; ${failures.length} failures.`);
  process.exitCode = failures.length ? 1 : 0;
}
