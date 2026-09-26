# SPRINT 02 — "Executive Presence" hero (AAA-quality animation)
Status: **DONE — Director approved the visual review and publication on 2026-09-26**
Created: 2026-09-26 · Commander v1.5.4 · FULL mode · Decision: PDL-004

Goal: replace the 2D canvas globe behind the portrait with a cinematic,
restrained WebGL scene that expresses Davor's career — premium, fast, and
honest (every element maps to real data in `src/content/profile.ts`).

---

## IN SCOPE

1. **Scene** (three.js, no extra 3D framework — M-12):
   - Three thin luminous orbital rings around the portrait, one per career era,
     slowly orbiting at different tilts and speeds.
   - One glowing node per real employer on its era's ring; hover/tap shows the
     organization, role and years (from `profile.experience`).
   - Soft volumetric rim light behind the portrait, subtle particle dust.
2. **Intro sequence (~1.5 s):** light blooms, rings draw in, nodes ignite in
   chronological order; then calm idle motion.
3. **Interaction:** gentle parallax following the cursor (desktop) or device
   tilt-free idle motion (mobile).
4. **Performance budget:** hero scene lazy-loaded after first paint; ≤ 150 KB
   gzipped added; 60 fps on a mid-range laptop; pixel ratio capped; animation
   pauses when the hero is off-screen or the tab is hidden.
5. **Accessibility / fallbacks:** `prefers-reduced-motion` → static, beautifully
   lit still frame; no WebGL → current portrait with CSS glow; nodes also listed
   as accessible text for screen readers.
6. **Remove** the 2D canvas globe (`HeroGlobe.tsx`) and its decorative world
   cities (they do not represent real operations).

## OUT OF SCOPE
- Gamification (Sprint 03). Any content change.

## NEEDED FROM THE DIRECTOR (M-4 — business content)
1. **Era grouping of the employers** — proposal:
   - *Finance & Microfinance* (1997–2013): USAID/KPMG, Hospitalija Trgovina, LOK Microcredit
   - *Industry & International Business* (2013–2020): D.I.K. International, Xylon (Plena Group), Blue Trade (Krautz-Temax), Bisnode / Dun & Bradstreet
   - *Education & AI Leadership* (2020–today): IDSS & International Montessori House
   Hospitalija is medical/pharmaceutical trade, not finance — keep it in era 1
   by time, or name era 1 differently?
2. **Era names** as shown on the site (English).
3. Approval of this sprint.

## DONE CRITERIA
DONE_CHECKLIST + measured frame rate and bundle delta recorded in the handoff;
visual review by the Director on the production URL (desktop + phone).


---

## PROGRESS (2026-09-26)

| # | Item | Status |
|---|---|---|
| 1 | Scene: 3 orbits, 8 employer nodes, rim light, dust | ✅ `src/components/executive-presence/scene.ts` |
| 2 | Intro sequence (≈2 s) | ✅ |
| 3 | Parallax + hover/tap labels that follow the node | ✅ |
| 4 | Lazy-loaded, pauses off-screen / hidden tab, pixel ratio ≤ 2 | ✅ chunk 136 KB gzipped (budget 150 KB); homepage chunk unchanged (84.6 KB gz) |
| 5 | Reduced motion → still frame; no WebGL → plain portrait; screen-reader list of eras | ✅ |
| 6 | 2D globe with decorative cities removed | ✅ |

Verification: headless Chrome via CDP (desktop 1440×900 dark/light, phone
390×844) — orbits pass behind the head and in front of the body, nodes
visible, hover label correct (Xylon Corporation Ltd. · Apr 2015 – Feb 2018).
**Not measured:** real-GPU frame rate — the test browsers throttle
requestAnimationFrame. Director's visual review on real hardware is the
remaining acceptance step.

## HANDOFF NOTE — Sprint 02
Completed: Executive Presence hero scene, era data in profile.ts (`careerEras`,
`experience[].era`), accessible text equivalent, old globe removed.
Not completed: formal fps measurement (Director reviewed it live on his own hardware and approved).
Director feedback applied: nodes made larger and more striking (core, flare, signal pulse).
Open risks: very old GPUs fall back to the plain portrait only if WebGL is
missing entirely — slow-but-present WebGL runs the full scene.
Technical debt: none new.
Next sprint: Sprint 03 — site-wide AAA gamification (proposal to follow).

COMMANDER COMPLIANCE — Sprint 02
──────────────────────────────────
Rules followed without reminder:        all applicable
Rules violated, caught by ACA:          1 (first build crossed orbits over the
                                           face — caught in visual review)
Rules violated, caught by Director:     0
Rules that slowed work or felt wrong:   none
New rules suggested by this sprint:     see corrections/SPRINT_02_LESSONS.md
