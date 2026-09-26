# Sprint 03 — Lessons Learned
Date: 2026-09-26

## Corrections Applied
- A custom utility (`.fx-sweep { position: relative }`) was declared after
  Tailwind's utilities and silently overrode `absolute` on the trophy face, so
  the card shrank to its content and spacing broke. Fixed by making effect
  utilities never set layout properties. → Effect/decoration utilities must not
  touch `position`, `display` or sizing.
- Side effects (analytics, banner timer) were first written inside a React
  state updater; moved out and mirrored with a ref (updaters must stay pure —
  StrictMode may call them twice).

## Gotchas Discovered
- `html { scroll-behavior: smooth }` makes `scrollIntoView` in headless test
  runs land mid-animation; set `scrollBehavior = "auto"` before scripted jumps.
- Scripted section jumps skip IntersectionObserver bands in between, so test
  counts like "2/9" are expected; natural scrolling unlocks every chapter.
- A tall section never reaches a high intersection ratio — use a centre band
  (`rootMargin: "-40% 0px -55% 0px"`, threshold 0) to detect "current section".

## Commander Improvement Candidates
- ENGINEERING_RULES E-11: note that custom utilities appended after Tailwind win
  the cascade — decoration utilities must not set layout properties.
- For gamification on professional sites: every badge, trophy and number must
  map to a sourced fact (P-2 style rule) — worth a general Commander rule for
  "no invented scores or self-ratings".

### 2026-09-26 — Chatbot intermittent failure
- Gotcha: `gemini-flash-latest` returned 503 UNAVAILABLE on ~1 of 3 requests
  (Google-side overload). Added up to 3 attempts with backoff before streaming
  starts — invisible to the visitor. → Every AI provider call needs a retry on
  transient 5xx/429 (Commander A-5 candidate).
- Gotcha: the Director opened an old immutable Vercel deployment URL
  (`…-7ps7c5f6v-…` = first Sprint 01 deploy) and saw "the old site". Always
  point to the production domain; per-deployment URLs are frozen snapshots.
- Correction: chat burst test (10 requests) hit Google free-tier 429s. Added
  model fallback (`gemini-flash-latest` → `gemini-3.5-flash-lite`) and
  GEMINI_API_KEY_1…n rotation (DL-005 pattern); 12/12 OK afterwards. Our own
  rate limiter was NOT the cause (16/30) — check which limiter fired before
  "fixing" the wrong one.
- Lovable audit: no functional link left (code, deps, live bundles, Supabase,
  Lovable workspace). Remaining mentions are governance history + a guard
  pattern that blocks re-introduction. A possible remaining link is the Lovable
  GitHub App installation on the repo — only the repo owner can see/remove it.

### 2026-09-26 — Final brutal stress test
- Gotcha: `vite preview` serves NO compression, so local Lighthouse mobile
  scores look far worse than production (Vercel serves brotli). Measure with a
  compressing server (`npx serve dist -s`) or against production.
- Gotcha: a `manualChunks` entry for supabase-js made Rollup park shared
  helpers in that chunk, so the homepage modulepreloaded 191 KB of Supabase it
  never used. Fixed by splitting `integrations/supabase/config.ts` (URL only),
  scoping AuthProvider to /admin + /auth and dropping the forced chunk.
- Gotcha: an `initial={{ opacity: 0 }}` wrapper around the LCP image delays
  LCP by the whole animation. Never fade in the LCP element.
- Correction: fast scrolling unlocked chapters back-to-back; AnimatePresence
  rendered the leaving and arriving banners side by side (squeezed, wrapped
  text). `mode="wait"` + `whitespace-nowrap` fixed it.
- Remaining limit: mobile Lighthouse ~40 is 93% "render delay" — a client-side
  SPA must execute its JS before first paint. The real fix is prerendering
  (SSG) — an architecture decision for the Director, not done unasked.
