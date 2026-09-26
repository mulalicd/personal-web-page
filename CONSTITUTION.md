# CONSTITUTION.md — Davor Mulalić Personal Web Page
# Project Constitution (wins over Commander for this project, per precedence rule 5)
# Created: 2026-09-26 — Commander v1.5.4, FULL mode

---

## P-1. Purpose

The professional personal website of Davor Mulalić (https://mulalic.ai-studio.wiki).
It presents his career, knowledge, recommendations, projects, the books he wrote,
the business systems and web apps he built, and his prompts — to position him as a
world-class C-level AI leader for CEO / COO / Chief AI mandates.

Quality bar set by the Director: **everything top quality, exact, and consistent
with his LinkedIn profile** (https://www.linkedin.com/in/davormulalic).
The Director is a non-coder; the ACA must never act on its own initiative on
anything not approved — ask first (Director instruction, 2026-09-26).

---

## P-2. Content Truth Rules 🔴

1. Every fact and number on the site (pages, chatbot knowledge, meta tags,
   OG image, gamification) must trace to one of:
   a. the Director's LinkedIn profile (export: Profile.pdf, 2026-09-26),
   b. `public/Davor_Mulalic_CV.pdf`,
   c. an explicit Director answer recorded in P-3 below.
2. Nothing is invented, rounded up, or re-dated. Unverifiable claims are
   removed or asked about, never kept "because they look good".
3. A fact lives in ONE place in code (M-7) — the chatbot knowledge base and
   the page sections must read from the same data module, not duplicate it.
4. **Portfolio section content (20 web apps + 40 AI prompts) is frozen** —
   Director decision 2026-09-26. Only technical/accessibility fixes allowed.
5. Randomly generated or decorative "statistics" (e.g. "X active worldwide")
   are forbidden — every number shown must be real.

---

## P-3. Director Decisions (recorded answers)

| Date | Topic | Decision |
|---|---|---|
| 2026-09-26 | Mode | FULL (sprints) |
| 2026-09-26 | Books | 4 books. 4th = "AI Solved Business Problems", presented inside the AISBP Framework™ section |
| 2026-09-26 | Portfolio | Stays exactly as it is |
| 2026-09-26 | Numbers | Taken from the LinkedIn profile export |
| 2026-09-26 | English level | "Proficiency" |
| 2026-09-26 | Latin level | "Intermediate" |
| 2026-09-26 | Availability | "Available now" |
| 2026-09-26 | €16M wording | Operating income grew from €12M to €16M (+33%) — Xylon / Plena Group, Apr 2015 – Apr 2016 |
| 2026-09-26 | 500+ professionals led | Correct — cumulative across the whole career |
| 2026-09-26 | CV access | Stays approval-gated; the PDF must not be publicly reachable |
| 2026-09-26 | Email provider | Resend, from a verified sender domain |
| 2026-09-26 | Analytics | Approved (replace localStorage-only analytics) |
| 2026-09-26 | Hero animation | "Executive Presence" (three.js / WebGL) approved |
| 2026-09-26 | Gamification | AAA-level, across the whole site |
| 2026-09-26 | Tracked zip with `.env` | Delete from the repository |
| 2026-09-26 | Career eras (hero orbits) | Three eras as proposed: Finance & Operations (1997–2013: USAID/KPMG, Hospitalija, LOK), Industry & Global Business (2013–2020: D.I.K., Xylon, Blue Trade, Bisnode), Education & AI Leadership (2020–today: IDSS & IMH). English names were proposed by the ACA and accepted with the division (not separately confirmed) |
| 2026-09-26 | Chatbot model | `gemini-flash-latest` (PDL-005) |
| 2026-09-26 | Gamification (Sprint 03) | Trophy rarity and chapter names as proposed; tone **expressive** (visible progress bar, "Chapter unlocked" banners, completion celebration) |
| 2026-09-26 | Founder badge | Vibe-Coding Journal (https://vbj.ai-studio.wiki/) — text taken from the service's own site and README |

---

## P-4. Roles

| Role | Who | Can |
|---|---|---|
| Visitor | anyone | read site, use chatbot, send contact message, request CV, request consultation, check own CV status |
| Admin | the Director only | approve/reject CV requests, manage consultations, view audit log, email metrics, analytics |

- There is exactly **one** admin. Public self-registration must not grant any
  role. The admin account is provisioned explicitly, never by "first user wins".

---

## P-5. Languages

- Site UI: English.
- Chatbot: answers in the visitor's language.
- Director communication: Bosnian. Code, docs, commits: English.

---

## P-6. Stack (deviation from Commander default — M-16)

- Frontend: Vite + React 18 + TypeScript SPA, Tailwind, shadcn/ui, framer-motion.
- Backend: Supabase project `qixpdeqjrkvfurqhzvtc` (Postgres + RLS, Auth, Edge Functions).
- Hosting: Vercel (`vercel.json` SPA rewrites).
- AI (chatbot): Gemini via the AIProvider interface (DL-005). No Lovable gateway.
- Email: Resend (direct API, verified domain).
- Rationale and details: `DECISION_LOG.md` PDL-001.

---

## P-7. Security Baseline

- RLS on every table, deny by default; public writes only through Edge Functions.
- Service role key only inside Edge Functions.
- No secrets in any `VITE_*` variable.
- All user text HTML-escaped in outbound email (E-4).
- Known limitation (E-4): disabling a Supabase user does not revoke an
  already-issued access token until it expires (~1h).

---

*Commander v1.5.4 — IDSS123a Organisation — Davor Mulalić*
