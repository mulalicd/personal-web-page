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
