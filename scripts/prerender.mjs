/**
 * Sprint 04 — prerender the homepage at build time.
 *
 * Runs after the client build (dist/) and the SSR build (dist-ssr/):
 *  - dist/spa.html   the untouched, empty shell — served for every other route
 *                    (see vercel.json), exactly as before Sprint 04;
 *  - dist/index.html the same shell with the homepage HTML inside #root, which
 *                    main.tsx hydrates.
 */
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// Production builds of React / React Router, as in the browser bundle.
process.env.NODE_ENV ??= "production";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");
const ROOT_TAG = '<div id="root"></div>';

const template = await readFile(path.join(distDir, "index.html"), "utf8");
if (!template.includes(ROOT_TAG)) {
  throw new Error(`[prerender] ${ROOT_TAG} not found in dist/index.html`);
}

const { render } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const html = render("/");
if (!html.includes('id="main-content"')) {
  throw new Error("[prerender] rendered homepage is missing #main-content — refusing to ship it");
}

await writeFile(path.join(distDir, "spa.html"), template);
await writeFile(path.join(distDir, "index.html"), template.replace(ROOT_TAG, `<div id="root">${html}</div>`));
await rm(ssrDir, { recursive: true, force: true });
console.log(`[prerender] dist/index.html: ${(html.length / 1024).toFixed(0)} KB of homepage HTML; dist/spa.html: SPA shell`);
