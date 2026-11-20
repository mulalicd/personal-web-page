# Maintenance — Lessons (after project close)

### 2026-11-20 — Whole backend offline: Supabase project paused
- Symptom (Director): chatbot "Connection failed", CV request "Could not reach
  the server". Cause: `qixpdeqjrkvfurqhzvtc.supabase.co` returned NXDOMAIN on
  public DNS (1.1.1.1, 8.8.8.8) while another project of the same account
  resolved — the free-plan project was paused after 7 days without activity.
  The site had no monitor, so nobody was told.
  → Every free-tier backend needs (1) an automatic keep-alive and (2) an
  end-to-end health check that alerts a human. Added Vercel cron
  `/api/keepalive` (daily DB read) and GitHub Actions `site-health.yml`
  (daily DB read + real chatbot answer; a failed run emails the owner).
- Director requirement: the chatbot must keep working when Google retires a
  model. GeminiProvider now tries Google-maintained aliases first
  (`gemini-flash-latest`, `gemini-flash-lite-latest`, override via secret
  `GEMINI_MODELS`), then lists the models the key can use today
  (`GET /v1beta/models`) and falls back to the newest stable Flash models.
- Gotcha: browser error texts said "check your internet" for a server-side
  outage — misleading to visitors. Now they say the service is unreachable.

- Root cause of the pause despite a keep-alive: the Director's own workflow
  `keepalive.yml` (every 3 days) called `GET /rest/v1/` — the OpenAPI root,
  which rejects publishable/anon keys ("Only the service_role API key can be
  used for this endpoint"). No query reached Postgres, and `curl` without
  `--fail` exited 0, so every run was GREEN while doing nothing.
  → A keep-alive must (1) run a real table query and (2) fail loudly on any
  non-200. Verified live 2026-11-20: Vercel `/api/keepalive` → 200 from the
  DB; `site-health.yml` → DB 200 + real chatbot answer.

## Commander Improvement Candidates
- E-12: "`curl` without `--fail` returns exit 0 on HTTP 4xx/5xx — a scheduled
  check built on it is always green. Check the status code explicitly."
- A-8 / E-12: "Supabase free plan pauses after 7 days of inactivity — ship a
  keep-alive and a daily end-to-end health check with every Supabase project."

### 2026-11-20 — Commander v1.8.0 review
- The upgrade check found this project violates the new E-24: the Vercel
  catch-all rewrite also serves `index.html` for `/assets/*`, so a visitor
  with the site open during a release gets HTML for a lazy chunk. Proposed,
  not applied (COMMANDER_UPGRADE_v1.8.0_PROPOSAL.md).
- Commander v1.8.0 itself has uneven version stamps and a CLAUDE.md template
  that omits seven 🔴 rules — reported to the Director, not fixed unasked.

### 2026-11-20 — Self-healing chatbot deployed
- chat-assistant redeployed with model discovery; live answers in EN and BS OK.
- A live "all models retired" simulation (temporary GEMINI_MODELS secret on
  production) was blocked by the permission classifier — correctly: it would
  have broken production for a minute. Replaced by a Deno unit test with a
  fake Google API (`_shared/ai/gemini-provider.test.ts`): preferred aliases
  404 → newest stable Flash model answers, previews skipped. → Prove
  failure-path behaviour with a mocked dependency, never by breaking prod.

### 2026-11-20 — CV request "not working" + chatbot 15–60 s
- CV: two requests today reached request-cv (rate_limits rows 20:21, 20:26)
  but created nothing — both addresses already had an APPROVED request, and
  the function silently returned `received` without any email. A returning
  visitor never got the CV again. Fix: an approved address gets its personal
  link again (shared `_shared/cv-email.ts`, idempotency per request per day);
  the public response stays uniform (no enumeration). → "Uniform response"
  must never mean "silently do nothing".
- Read-only evidence came from `npx supabase db query --linked` (masked
  emails) — the CLI can query the linked project; no MCP permission needed.
- Chatbot: first byte after 15.6 s and 58 s, then the whole answer at once —
  the model "thinks" before writing. Fix (not yet deployed, awaits "objavi"):
  `thinkingConfig.thinkingLevel = "minimal"` with automatic retry without it
  on 400, 20 s header timeout per model, `Server-Timing` header (model + ms)
  so latency is measurable from outside.
- Deployed 2026-11-20 ("objavi"). Live measurement, 4 questions: every
  answer came from `gemini-flash-lite-latest` in 0.42–0.55 s; two requests
  still took 20.5–23.5 s in total because `gemini-flash-latest` did not
  return headers within the 20 s timeout before the fallback answered; two
  took 0.5 s (flash-latest failed fast). Server-Timing made this visible.
  → Proposed to the Director: lite first (PDL-005 change), not done unasked.
