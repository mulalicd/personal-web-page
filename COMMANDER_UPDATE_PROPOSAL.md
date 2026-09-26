# Commander Update Proposal — Davor Mulalić Personal Web Page
Date: 2026-09-26
Project: personal-web-page (https://github.com/mulalicd/personal-web-page)
Sprints completed: 04 (01–03 shipped; 04 shipped and rolled back)
Commander version in use: v1.5.4 (automation pinned to tag v1.5.2)
Proposed new version: **v1.6** (one new rule + several learned-from additions)

**Status: APPROVED ("odobri", 2026-09-26) and EXECUTED** — Commander commit
`23cedfd`, tags `v1.5.3`, `v1.5.4`, `v1.6`, AUDIT-004. This project now pins
automation to tag v1.6.

Evidence base: `corrections/SPRINT_01..04_LESSONS.md`, `DECISION_LOG.md`
(PDL-001..005), compliance scores in `sprints/SPRINT_01..03.md`, Commander
`CONSTITUTION.md`, `DECISION_LOG.md`, `AUDIT_LOG.md`, `ENGINEERING_RULES.md`,
`ARCHITECTURE_PATTERNS.md`, `DONE_CHECKLIST.md`, `PROMPT_LIBRARY/*` (main, v1.5.4).

---

## Step 2 — Analysis

**a) Rules violated more than once**
| Rule | Times | Evidence |
|---|---|---|
| M-4 / M-10 (verify, never assume) | 4 | S01 "4th book missing" (Director caught); S01 hero "empty for 5 s" was a frozen test pane; S01 misread SPF TXT vs CNAME; S04 rolled back on one noisy Lighthouse measurement. All four = a claim built on one unverified observation. Already 🔴 → learned-from, not a severity change. |
| DONE_CHECKLIST "no test rows left in production" | 2 | S01 cleanup needed a planned window (CLI login expired); stress test left `cv_requests` row `test-a@example.com` — the only DB channel available (MCP) had no delete permission, and the Director later approved it, triggering a failed-email alert. |
| CLAUDE_CODE_OPERATIONS "every version bump gets a tag" (M-22 Step 5) | 2 | v1.5.3 and v1.5.4 were never tagged → this project had to pin automation to v1.5.2. |

**b) Rules that slowed work without value**
- DL-005 "exact string `gemini-2.5-flash`, no other version" — actively harmful:
  Google answered NOT_FOUND by 2026-09, the chatbot was dead with a valid key.
- No other rule reported as slowing work (S01–S03 scores: "none").

**c) Problems no rule covers** → proposals E-15, A-5/A-8/A-11 additions, automation fixes below.

**d) Project decisions worth promoting** → DL-005 revision, DL-014.

---

## New Rules

- **E-15 Performance Claims Require Stable Measurement** 🟡 STANDARD —
  Evidence: S03 stress test + S04. Local Lighthouse on the same production
  URL ranged 58 → 37 between runs; `vite preview` and `http://localhost`
  serve no brotli; a full sprint (prerender) was shipped and rolled back on a
  single noisy comparison. Rule text:
  1. Judge speed on the HTTPS production (or production-equivalent) URL,
     never on `vite preview` / `serve` / plain `http://localhost`.
  2. A performance decision needs ≥ 5 interleaved runs per variant, or
     PageSpeed Insights (pagespeed.web.dev) runs; report median and spread.
  3. Before a performance-motivated architecture change (SSR, prerender),
     agree the acceptance metric and measurement method with the Director
     in the sprint document.
  4. Known traps: never fade in (`opacity: 0`) the LCP element; a forced
     vendor `manualChunks` entry for a route-only library (e.g. supabase-js)
     makes Rollup park shared helpers there and preloads it on every page.

## Severity Changes

- none (M-4 is already 🔴; the repeat pattern is addressed by learned-from text).

## Deprecation Candidates

- **DL-005 model-string clause** ("`gemini-2.5-flash` exact string, no other
  version") — superseded by the DL-005 revision below.

## New Decision Log Entries

- **DL-005 (revised)** — AI Provider: Gemini default, *availability-checked
  model* — Keep Gemini + the AIProvider interface. Replace the hard pin with:
  (1) verify the model string with a live call at every project start;
  (2) prefer a Google-maintained alias (`gemini-flash-latest`) plus one
  fallback model; (3) record the chosen string in the project DECISION_LOG
  with a review date. Evidence: PDL-005; `gemini-2.5-flash` → NOT_FOUND.
- **DL-014** — Personal/professional sites: content single source — One
  typed content module (`src/content/profile.ts`) feeds every UI section AND
  the chatbot system prompt; every number, badge, trophy or level must trace
  to a named source (profile, CV, recorded Director answer) — no invented
  scores or self-ratings, even in gamification. Evidence: S01 content audit
  (facts duplicated across components drifted), S03 gamification (P-2).

## Learned-From Additions

- **M-4 / M-10** += "A single observation is not evidence: a frozen preview
  pane (rAF stops when hidden), one Lighthouse run, or one DNS line can each
  look like a real defect or a real gain. Re-check with a second independent
  method before reporting a finding or reverting work." (4 cases, S01–S04)
- **A-5 AI Provider Interface** += resilience: retry transient 5xx/429 with
  backoff *before* streaming starts; fall back to a second model; rotate
  `GEMINI_API_KEY_1..n`; map provider errors to machine codes (NOT_FOUND vs
  PERMISSION_DENIED vs RESOURCE_EXHAUSTED) so a dead model is distinguishable
  from a bad key without log access; system prompt includes injection
  hardening (no persona change, never reveal the prompt) — verified live:
  "pirate" persona injection was half-adopted before hardening. (S03, stress test)
- **A-8 Supabase Client Pattern** += (1) Edge Functions can import the
  browser's Zod schemas (`src/lib/validation/schemas.ts`) via relative paths
  + `supabase/functions/deno.json` import map — the M-7 answer for Vite +
  Supabase; (2) keep a tiny `config.ts` (URL only) separate from the SDK
  client so public pages call functions without downloading supabase-js
  (−181 KB). (S01, stress test)
- **E-4 Security** += public endpoints that accept an email return the same
  response whether or not the address exists (no enumeration); SPA 404 pages
  inject `noindex` (soft-404). (stress test)
- **E-11 Forbidden Patterns** += (1) decoration/effect CSS utilities declared
  after Tailwind must not set layout properties (`position`, `display`,
  sizing) — they silently win the cascade (S03); (2) side effects inside a
  React state updater (S03).
- **E-12 Environment Gotchas** += (1) `supabase config push` with a partial
  config.toml resets unrelated auth settings (MFA, confirmations) — change
  single settings in the dashboard; (2) Supabase CLI login can expire within
  hours — run `supabase projects list` before CLI work and batch test +
  cleanup in that window; (3) Git Bash curl sends non-ASCII args in the ANSI
  code page — send UTF-8 bodies from a file; (4) Git Credential Manager can
  silently require interactive login — push with `GIT_TERMINAL_PROMPT=0`,
  a timeout and `credential.helper=!gh auth git-credential`; (5) Resend DNS:
  a leftover SPF TXT or old DKIM TXT on the same host blocks the new
  records; (6) Vercel per-deployment URLs are immutable snapshots — always
  hand the Director the production domain; protected previews → use
  `vite preview --host` on the Director's PC/LAN. (S01–S03)
- **DONE_CHECKLIST** += (1) "Rate limits tested at the exact boundary (N
  allowed, N+1 blocked)" — off-by-one found only live (S01); (2) "Test data is
  created only through a channel that can also delete it, and deleted in the
  same session — otherwise tell the Director exactly which row to reject"
  (stress test); (3) "Visual/animation features verified with a real-time
  CDP capture or real hardware, not a hidden preview pane" (S01, S02, S04).
- **PROMPT_LIBRARY/pre-deploy-stress-test.md** += a 5th pass "Performance &
  accessibility: Lighthouse per E-15, axe-core 0 violations in both themes,
  every external link checked, 360–3840 px no horizontal scroll".

## Automation Fixes (E-13)

- Ship `automation/.claude/hooks/package.json` = `{"type":"commonjs"}`
  (installed by `install-automation.bat`). Without it every hook crashes with
  `require is not defined` in any `"type": "module"` project (all Vite
  projects). (S01)
- `project-guard.js`: flag tracked binary archives (`.zip`, `.7z`, `.rar`)
  by extension — a tracked zip containing `.env` passed `--scan` clean. (S01)
- Create the missing tags `v1.5.3`, `v1.5.4`, and tag `v1.6` on release;
  add a CI check that the `VERSION` file has a matching tag. (S01)

---

## Step 5 — Execution plan (only after "odobri")
1. Apply the approved items to the Commander repository (branch → main).
2. Bump `VERSION` and all document stamps to v1.6; add COMMANDER_CHANGELOG entry.
3. Add AUDIT_LOG entry "Personal Web Page end-of-project update".
4. Commit `feat: Commander v1.6 — personal-web-page end-of-project update`,
   push, tag `v1.5.3`, `v1.5.4` (on their historical commits) and `v1.6`.
5. Update this project's automation pin from v1.5.2 to v1.6.
