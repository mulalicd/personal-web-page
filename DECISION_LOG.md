# DECISION_LOG.md — Davor Mulalić Personal Web Page
# Project-level decisions. Commander-wide decisions live in the Commander repo.

---

## PDL-001 — Keep Vite + React SPA + Supabase + Vercel (M-16 stack deviation)

**Date:** 2026-09-26
**Decision:** Keep the existing working Vite SPA (originally generated with
Lovable) instead of migrating to Commander's default Next.js stack. Backend
stays on Supabase (Edge Functions replace Server Actions / API routes);
hosting stays on Vercel.
**Rationale:** Director answered question 4 of the bootstrap with the existing
repository. The frontend works and is content-rich; a framework migration would
destroy working UI for no functional benefit (M-16, DL-009 precedent).
Commander patterns are translated: Edge Functions = Application layer,
`supabase/functions/_shared` + repository modules = Infrastructure.
**Consequence:** Server Components / Server Actions patterns do not apply.

---

## PDL-002 — Replace the dead Lovable-managed backend

**Date:** 2026-09-26
**Decision:** Move all backend features to the Director's own Supabase project
`qixpdeqjrkvfurqhzvtc`. Remove every dependency on Lovable services
(the Lovable AI gateway, the Lovable connector gateway, `LOVABLE_API_KEY`).
Chatbot → Gemini (DL-005) behind an AIProvider interface; email → Resend API directly.
**Rationale:** The old project `zihohzstvbdobxahjfsy` no longer exists (DNS
NXDOMAIN, 2026-09-26); the whole backend of the live site was dead. Lovable
gateways are tied to a Lovable subscription outside the Director's control.

---

## PDL-003 — Analytics: Vercel Web Analytics

**Date:** 2026-09-26
**Decision:** Replace the localStorage-only analytics (which only ever showed
the admin's own browser) with Vercel Web Analytics (`@vercel/analytics`,
new dependency approved by the Director per M-12). The admin "Analytics" tab
was removed; page views and custom events are read in the Vercel dashboard.
**Rationale:** Free tier, cookie-less, no personal data, zero backend code.
**Removed dependencies (unused):** `lovable-tagger`, `@playwright/test`,
`react-day-picker`.

---

## PDL-004 — Hero "Executive Presence" animation with three.js

**Date:** 2026-09-26
**Decision:** Director approved replacing the 2D canvas globe with a WebGL
scene built on three.js (new dependency — approved per M-12).
**Scope:** Sprint 02.

---

## PDL-005 — Chatbot model: `gemini-flash-latest` (deviation from DL-005)

**Date:** 2026-09-26
**Decision:** Director chose the Google-maintained alias `gemini-flash-latest`
instead of a pinned model string.
**Rationale:** DL-005's pinned `gemini-2.5-flash` returned NOT_FOUND
(Google restricted the 2.5 models; current stable line is 3.x). The alias
removes manual model migrations; trade-off accepted: answer style can change
when Google moves the alias. Knowledge stays fixed by the system prompt.
**Commander follow-up:** proposed DL-005 update recorded in corrections/.

---

*Commander v1.6 — IDSS123a Organisation*
