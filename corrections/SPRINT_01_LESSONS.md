# Sprint 01 — Lessons Learned
Date: 2026-09-26

## Corrections Applied
- Claimed "4th book missing" after reading only `BooksSection.tsx`; the 4th book
  (AI Solved Business Problems) lives in `AISBPSection.tsx`. Director corrected it.
  → Read every component that can carry a fact before reporting a content gap.
  → Commander rule: M-4 / M-10 (verify, never assume).
- First audit pass compared site numbers only against LinkedIn. Most numbers
  actually come from `public/Davor_Mulalic_CV.pdf` (CV has more detail than
  LinkedIn). → Content audits must cross-check every source the site itself
  ships (repo PDFs, images with visible text), not only the external profile.

## Gotchas Discovered
- Commander hooks are CommonJS (`require`). In a project whose `package.json`
  has `"type": "module"`, Node treats `.claude/hooks/*.js` as ESM and every hook
  crashes with `require is not defined`. Fixed without touching the hook files:
  `.claude/hooks/package.json` → `{ "type": "commonjs" }` (nearest package.json wins).
- Commander main is v1.5.4 but the newest release tag is v1.5.2 — v1.5.3 and
  v1.5.4 were never tagged. Bootstrap pins executable automation to the tag, so
  automation was taken from v1.5.2 (content identical to main for `automation/`).
- Old Supabase project `zihohzstvbdobxahjfsy` (Lovable-managed) no longer resolves
  in DNS → every backend feature of the live site was dead with no visible alert.
- A tracked `.zip` containing `.env` passed `project-guard --scan` clean: the
  guard only scans text files. Binary archives are invisible to it (E-4 already
  warns about this for history audits).
- Without `VITE_SUPABASE_URL` the Supabase client throws at import time and the
  whole SPA renders a blank page — a config error takes down static content too.
- Browser pane blocks `*.supabase.co` requests (`ERR_BLOCKED_BY_CLIENT`), so
  backend checks must be done with curl, not in the pane.
- Windows scratchpad paths are long enough that `git clone` into them fails with
  "Filename too long"; use a short path or `git archive <tag> | tar -x`.

## Commander Improvement Candidates
- Ship `.claude/hooks/package.json` (`"type": "commonjs"`) with the automation
  bundle, or rename hooks to `.cjs`. Every Vite/modern project has
  `"type": "module"` and silently loses all hooks otherwise.
- Enforce M-22 "every version bump gets a tag" mechanically (e.g. CI check that
  the CONSTITUTION header version has a matching tag) — v1.5.3/v1.5.4 slipped.
- project-guard: flag tracked binary archives (`.zip`, `.7z`, `.rar`) by
  extension, since their contents cannot be pattern-scanned.

### 2026-09-26 — Sprint 01 implementation
- Gotcha: `supabase functions deploy --use-api` bundles relative imports from
  anywhere in the repo (`../../../src/...`), so browser and Edge Functions can
  share one Zod schema file and one content module — but bare imports (`zod`)
  need an import map: `supabase/functions/deno.json` + `import_map` per function
  in `config.toml`.
- Correction: legacy `check_rate_limit_v2` blocked one attempt early (budget 3
  → 3rd attempt blocked). Found only by a live smoke test; fixed in migration
  20260926000100. → Test rate limits at the exact boundary, not just "does it block".
- Correction: legacy `email_send_metrics` upsert used `onConflict` on a PARTIAL
  unique index — Postgres cannot target it, so metrics silently failed. Replaced
  by select-then-update/insert.
- Gotcha: curl from Git Bash on Windows sends non-ASCII argument text in the
  ANSI code page, so "Šehić" arrives as invalid UTF-8 and fails validation. Send
  test bodies from a UTF-8 file (`--data-binary @file`). The validator was fine.
- Gotcha: the in-app browser pane freezes requestAnimationFrame (0 fps) while
  not painted, so framer-motion content stays at `initial` (opacity 0 / offset).
  My earlier audit finding "hero empty for 5 s" was this artifact, not a site
  bug. → Verify animation-dependent UI via DOM state, not pane screenshots.
- Gotcha: `supabase config push` with a minimal config.toml would also reset
  unrelated auth settings (MFA TOTP off, email confirmations off, OTP length) to
  local defaults. Never push partial config; change single auth settings in the
  dashboard or via the Management API.
- Course correction: python heredoc edits with "\n" inside string literals
  wrote a real newline into ChatBot.tsx (`indexOf("⏎")`) — caught by reading
  the file. → Use the Edit tool or raw strings for code containing escapes.

## Commander Improvement Candidates (continued)
- ENGINEERING_RULES E-5/E-6 for Supabase: document the shared-module pattern
  (`src/lib/validation/schemas.ts` imported by Edge Functions via import map) as
  the M-7 answer for Vite + Supabase projects.
- DONE_CHECKLIST: "Rate limits tested at the exact boundary (N allowed, N+1 blocked)".

### 2026-09-26 — Deploy day
- Gotcha: the Supabase CLI session became 401 Unauthorized within hours (after
  the Director used the dashboard). Re-check `supabase projects list` before any
  CLI-dependent step instead of assuming the earlier login still holds.
- Gotcha: `GET /auth/v1/settings` showed `disable_signup: true` but also
  `external.email: false` — turning off the whole Email provider also blocks the
  admin's own password sign-in. The correct switch is "Allow new users to sign
  up" OFF with the Email provider left ON. → Verify auth settings via the public
  settings endpoint after every dashboard change.
- Gotcha: Resend's current DNS setup uses CNAMEs (`send`, `rsend` → *.forge.rmta.net).
  An old SPF TXT on host `send` (earlier Resend format) blocks the new CNAME —
  a CNAME cannot coexist with other records on the same host.
- Verified live after push: bundle points to qixpdeqjrkvfurqhzvtc, CV PDF no
  longer publicly reachable, Vercel insights 200, console clean.
- Correction (Commander-level): DL-005 mandates the exact model string
  `gemini-2.5-flash`; by 2026-09 Google answers NOT_FOUND for it (2.5 models
  restricted, current stable line is 3.x). The chatbot failed with a valid key.
  → Pinned model strings in Commander need a review date, and the provider
  error enum (NOT_FOUND vs PERMISSION_DENIED) must be surfaced as a machine
  code so a dead model is distinguishable from a bad key without log access.
- Gotcha: two DKIM TXT records (old + new) on `resend._domainkey` — adding the
  new one without deleting the old one keeps Resend verification failing.
- Course correction: I first read the SPF TXT on `send.<domain>` as the TXT of
  the CNAME target. Wrong — a CNAME answer would appear first in the output;
  Namecheap was actually serving a leftover TXT next to the new CNAME, and
  Resend flagged "Conflicting records". → When a CNAME and TXT both answer for
  a host, assume a real conflicting record until the output proves otherwise.

## Commander Improvement Candidates (continued)
- DL-005: replace the hard-pinned `gemini-2.5-flash` with a reviewed current
  model and add "verify model availability at every project start" to the
  bootstrap checklist.
- Gotcha: the Supabase CLI login expired three times in one day (401 after a
  few hours). Batch all CLI-dependent work right after a fresh `supabase login`
  and plan test-data cleanup in the same window as the test itself.
- Correction (mine): first live test used names with digits and parentheses
  ("Sprint 01 Test (Claude)") — correctly rejected by the name validator.
  → Test data must satisfy the same business rules as real data.
