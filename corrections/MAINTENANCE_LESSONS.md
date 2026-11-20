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
