# SPRINT 01 — Foundation: working backend, zero known errors, exact content
Status: **PROPOSED — awaiting Director approval**
Created: 2026-09-26 · Commander v1.5.4 · FULL mode

Goal: after this sprint every existing feature works on the Director's own
infrastructure, every audit finding is fixed, every fact matches LinkedIn / CV /
Director decisions, and the codebase meets Commander E-1/E-2/E-4/E-5.
New visuals (Executive Presence, gamification) are OUT — Sprints 02 and 03.

---

## IN SCOPE

### 1. Backend on Supabase `qixpdeqjrkvfurqhzvtc` (PDL-002)
1.1 One consolidated, reviewed migration set for a fresh database (tables:
    `cv_requests`, `consultation_requests`, `user_roles`, `admin_audit_log`,
    `rate_limits`, `email_send_metrics`, analytics table if chosen in §6).
1.2 **Remove** the "first registered user becomes admin" trigger; disable public
    sign-up; the Director's admin account is created in the Supabase dashboard and
    the role is assigned explicitly (P-4).
1.3 RLS deny-by-default on every table; remove direct anonymous INSERT on
    `consultation_requests` (only via Edge Function with rate limit).
1.4 Email: all Edge Functions call Resend directly (no Lovable gateway), from a
    verified sender domain; user text HTML-escaped via one shared helper (E-4).
1.5 Chatbot: Gemini behind `AIProvider` interface; knowledge generated from the
    same content module the page uses (M-7); CORS allowlist instead of `*`;
    rate limit per IP; no internal error text returned to visitors.
1.6 Deploy all Edge Functions + set secrets; set Vercel env vars
    (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

### 2. CV flow (Director decision: stays approval-gated)
2.1 Remove `public/Davor_Mulalic_CV.pdf` from the public site; store it in a
    **private** Supabase Storage bucket.
2.2 Approval email is sent **to the requester** (today it goes to the Director).
2.3 The email contains a personal link `/cv-status?token=…`; the Edge Function
    checks the token is approved and returns a short-lived signed download URL.
2.4 `/cv-status` no longer reveals whether an arbitrary email address has a request.

### 3. Functional bug fixes (audit B)
3.1 Name validation accepts č ć š ž đ and all Unicode letters.
3.2 Hero metrics render "€16M+" / "€11M+" correctly (unit-suffix parser).
3.3 Chat suggestion chips send the question.
3.4 No horizontal scroll on mobile; open chat no longer covers the menu.
3.5 Missing env config shows the site with backend features gracefully
    disabled — never a blank page.
3.6 Admin login: wait for role check before redirect (no false "Access Denied");
    success toast only when the email really went out.
3.7 Consultation: single booking flow; Zoho opens directly from the click (no
    blocked pop-up).
3.8 Visitor-facing messages: no technical text (attempts, ms, endpoint names,
    raw errors). Contact form honeypot survives a successful send.
3.9 Portfolio detail modal: Esc closes it, close animation, dialog semantics,
    labelled close button. **Content untouched.**
3.10 Volunteering cards show all achievements; gallery captions readable.
3.11 Accessibility: form labels linked to inputs, labelled icon buttons.

### 4. Content corrections (audit A + P-3 decisions)
4.1 Award cards dated correctly: 673% → Jul 2018 – Jul 2019; €16M operating
    income €12M → €16M (+33%) → Apr 2015 – Apr 2016; €11M+ contracts → no
    invented period (career total).
4.2 Hospitalija: move "ISO 9001:2000 / −40% documentation errors" and "€2M long-term
    business opportunities" to LOK Microcredit; add Hospitalija's own CV items.
4.3 Photo caption "Keynote Speaker — Business Leaders Summit" → Director speaking
    at the Business Leaders for Sustainable Development in BiH 2025 award ceremony.
4.4 Award text includes: Winner — Small Company category, thematic area "People".
4.5 IDSS metrics: revenue €240K → €815K (▲240%), enrollments 80 → 256 (▲220%), team 53.
4.6 Certifications per LinkedIn: Sandler Training – Sales Mastery; Licensed Diving
    Instructor 1*; HACCP (Food Safety) Auditor; ISO 9001:2015 Lead Implementer;
    LEAN Management. Standards (FSC, PEFC, ERP, KAIZEN, IAS) shown separately.
4.7 Education years: Master of International Business (2015–2017); Doctor of
    Veterinary Medicine, Veterinary Faculty Sarajevo (1991–1999).
4.8 Languages: English — Proficiency; Latin — Intermediate; others unchanged.
4.9 Availability everywhere: "Available now" (hero badge, contact, chatbot, meta).
4.10 D.I.K. title in full per LinkedIn.
4.11 "500+ professionals led" labelled as career total.
4.12 Remove the random "X active worldwide" counter (P-2.5).
4.13 Chatbot knowledge base rebuilt from the corrected content module.
4.14 OG/Twitter share image as PNG 1200×630 (LinkedIn does not render SVG);
    JSON-LD and meta texts aligned; sitemap updated.

### 5. Code quality & performance
5.1 TypeScript `strict: true`, zero TS errors, zero lint errors (E-1).
5.2 Zod schemas moved to `lib/validation/schemas.ts` (E-2).
5.3 Images compressed (award photo 2.5 MB → web size, modern format);
    unused assets removed; JS bundle split (heavy parts lazy-loaded).
5.4 First screen visible immediately (no 5-second empty hero).
5.5 Repo hygiene: delete Cloudflare workflow (site is on Vercel), `remove-env.bat`,
    Lovable README → real README; `.env.example` added.

### 6. Analytics (approved in principle — product needs your confirmation)
Proposal: **Vercel Web Analytics** (`@vercel/analytics`) — free tier, no cookies,
GDPR-friendly, visible in the Vercel dashboard; the misleading admin
"Analytics" tab is removed. Alternative: store events in Supabase and keep an
admin tab (more work, more data to protect).

---

## OUT OF SCOPE
- Executive Presence hero animation (Sprint 02).
- Gamification (Sprint 03).
- Any change to Portfolio content.
- Git history rewrite for the removed zip (needs separate approval — M-23).

---

## NEEDED FROM THE DIRECTOR BEFORE START
1. Supabase access to project `qixpdeqjrkvfurqhzvtc` (see chat message).
2. Resend: sender address (e.g. `noreply@ai-studio.wiki`) and who receives
   contact / CV-request notifications (today: `mulalic71@gmail.com`).
3. Gemini API key — entered by the Director directly as a Supabase secret.
4. Confirmation of §6 analytics product.
5. Approval of this sprint document.

---

## DONE CRITERIA
Full `DONE_CHECKLIST.md` run; every item above verified in the browser on the
production URL (desktop + mobile), console clean, `npm run build` and
`tsc --noEmit` clean, lessons file consolidated, handoff note written.
