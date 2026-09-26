# SPRINT 04 — Lessons (prerendered homepage)

### 2026-09-26 — Implementation
- Gotcha: renderToString swallowed a `document is not defined` error inside
  <Suspense> and silently shipped the route fallback (a spinner). The
  prerender script now refuses to write a page without `#main-content`.
  → Any build-time render needs an explicit "did the real page render" check.
- Gotcha: React 18 does not know the `fetchPriority` prop (warning on the
  server); use the lowercase attribute.
- Gotcha: state initialised from localStorage/matchMedia in useState breaks
  hydration. Start from the prerendered defaults, read the browser after
  mount — and load stored campaign progress BEFORE the chapter observer can
  fire, or the first chapter overwrites it.
- Gotcha: preloaded module scripts can run before the first paint, so the
  phone still showed nothing until hydration ended. Hydration now waits one
  frame — with a timer fallback, because background tabs never run
  requestAnimationFrame (found in the hidden browser pane: page never
  hydrated).
- Gotcha: local Lighthouse over http://localhost is not comparable with
  production: Chrome does not get brotli there and simulated throttling
  varied 41–55 on the same build. Judge mobile speed on the HTTPS production
  domain.
- Gotcha: `serve` rewrites apply before index.html, unlike Vercel (filesystem
  first). A small node server that mimics Vercel was needed for local tests.

### 2026-09-26 — Production measurement and rollback
- Correction: full-page prerender made production mobile Lighthouse WORSE
  (58 → 33–45) although the real first paint got faster (2.7 s → 1.5 s).
  Lantern's slow-4G simulation charges the whole 148 KB HTML document (it
  used the uncompressed size) before the CSS, font and image can start, and
  hydrating 2,000+ prerendered nodes added TBT. Reverted as promised.
  → Measure a prerender prototype on production-like HTTPS before claiming a
  gain; if retried, prerender only the hero/navigation and keep the HTML small.
- Correction (same day): after the rollback the OLD version scored 37–38 on
  the same machine (earlier 58). Local Lighthouse runs against production vary
  ±20 points, so "worse" was NOT proven — both versions fall inside the noise.
  → Never decide on fewer than 5 interleaved runs per variant, or use
  PageSpeed Insights (Google-side, stable; the anonymous daily API quota was
  exhausted, the Director can run pagespeed.web.dev in a browser).

## Commander Improvement Candidates
- For SPA → prerender work: add a checklist item "every browser-only read
  moves to an effect; verify with a stored-state reload and a hidden tab".

### 2026-09-26 — KRAJ / Commander v1.6
- Commander documents carried four different version stamps (1.5.2, 1.5.3,
  1.5.4) because earlier updates bumped only the files they touched. v1.6
  unified all headers/footers with one regex pass; historical references
  ("Added: v1.5.3", changelogs) were deliberately left unchanged.
- Project re-pinned from automation tag v1.5.2 to v1.6 (only project-guard.js
  differed: it now reports tracked archives).
