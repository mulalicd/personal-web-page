# SPRINT 04 — Prerendered homepage (mobile speed)
Status: **IMPLEMENTED — awaiting Director "objavi" and a production measurement** (Director approved the sprint 2026-09-26: "Želim Sprint4")
Created: 2026-09-26 · Commander v1.5.4 · FULL mode

Goal: the homepage appears on a phone as soon as its HTML arrives, instead of
after ~450 KB of JavaScript has run. The stress test showed 93% of mobile LCP
is "render delay" of the client-only SPA (production mobile Lighthouse 58,
FCP 6.5 s).

---

## IN SCOPE

1. **Build-time prerender of `/`** — after `vite build`, a second SSR build
   renders the homepage with `react-dom/server` into `dist/index.html`.
   No new dependencies (react-dom/server and react-router's StaticRouter are
   already installed).
2. **Hydration** — the browser attaches React to the prerendered HTML
   (`hydrateRoot`) instead of re-drawing it. Every browser-only value
   (theme, campaign progress, "Reduce effects", reduced motion) is read after
   mount, so server and browser render the same first frame.
3. **No theme flash** — a tiny inline script sets dark mode on `<html>` before
   the first paint.
4. **Other routes unchanged** — `/admin`, `/auth`, `/cv-status`,
   `/reset-password` and 404 are served from an empty SPA shell
   (`spa.html`), exactly as today.
5. **SEO bonus** — search engines and link previews see the full homepage
   text in the HTML.

## OUT OF SCOPE
- Any content or design change; server-side rendering at request time;
  a framework migration (Next.js etc.).

## ACCEPTANCE
- Production mobile Lighthouse: FCP and LCP clearly below the current
  6.5 s / 6.8 s; accessibility, best practices and SEO stay 100.
- No React hydration errors in the console; theme, campaign progress,
  "Reduce effects", chatbot, forms, 3D hero and admin all work as before.
- tsc / eslint 0 errors, axe 0 violations, project-guard clean.
