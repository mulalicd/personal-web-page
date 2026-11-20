# Commander Upgrade Proposal — personal-web-page v1.6 → v1.8.0
Date: 2026-11-20 · Status: **APPROVED and EXECUTED** (Director: "Ostalo imaš moju saglasnost", 2026-11-20) — Commander `v1.8.1` (commit a8926b9, AUDIT-010); project pinned to v1.8.1

Evidence: Commander tag `v1.8.0` (COMMANDER_CHANGELOG v1.6.1 … v1.8.0), file-by-file
comparison of this project's `.claude/` with `automation/` at that tag.

## Part A — this project (personal-web-page)

| # | Change | Why (rule) | Risk |
|---|---|---|---|
| A1 | Automation (6 hooks, settings, 6 skills, CI guard) | Already **byte-identical** to v1.8.0 — no change needed | none |
| A2 | `.commander-version` 1.6 → 1.8.0; version stamps in CLAUDE.md, CONSTITUTION.md, DECISION_LOG.md | Removes the session-start mismatch warning | none |
| A3 | CLAUDE.md: inline the 6 🔴 rules added since v1.6 — M-24, E-18, E-19, E-22, C-12, C-13 (one line each) | Template promises "all 🔴 rules inlined"; they are not | none |
| A4 | `vercel.json`: catch-all rewrite must not cover `/assets/*` (clean 404 instead of HTML) + `vite:preloadError` → reload the page once | **E-24** — this project has exactly that defect: a visitor with the site open during a release gets "Unexpected token '<'" when a lazy chunk (3D hero, admin, chatbot) is requested | low; tested locally + live |
| A5 | Nothing else applies: E-18/E-19 (owner SQL, identity migrations) — none planned; E-22 (AI rewriting stored content) — the chatbot stores nothing; E-25 already met (Edge Functions import with relative paths + `deno@2 check`) | — | — |

## Part B — defects found in Commander v1.8.0 itself (separate approval, Commander repo)

| # | Defect | Fix |
|---|---|---|
| B1 | Version stamps not uniform: ACA_MANAGEMENT_GUIDE, AUDIT_LOG, FEATURE_LIFECYCLE, 3 PROMPT_LIBRARY files say 1.6.2; COMMANDER_CHANGELOG footer 1.6.1; template header "Template version: 1.6" | Bring all to 1.8.0 (hygiene, no rule change) → v1.8.1 |
| B2 | `PROJECT_CLAUDE_MD_TEMPLATE.md` claims every 🔴 rule is inlined, but M-23, M-24, E-18, E-19, E-22, C-12, C-13 are missing; it still says "C-1–C-5" | Inline them; "C-1–C-13" |
| B3 | No rule for free-tier backend pausing / always-green checks (this project's 2026-11-20 outage: paused Supabase, `curl` without `--fail`) | Learned-from in A-8 + E-12 (from corrections/MAINTENANCE_LESSONS.md) |

Execution after "odobri": Part A in this repo (commit + push = production, E-24 verified live);
Part B as Commander v1.8.1 (commit, AUDIT-010, CHANGELOG, tag `v1.8.1`), then this project re-pinned to v1.8.1.
