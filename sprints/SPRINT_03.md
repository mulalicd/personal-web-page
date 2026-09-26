# SPRINT 03 — Site-wide AAA gamification ("Career Campaign")
Status: **DONE — Director approved publication 2026-09-26** (approved 2026-09-26: rarity ok, chapters ok, tone expressive, + Vibe-Coding Journal badge)
Created: 2026-09-26 · Commander v1.5.4 · FULL mode

Goal: turn a visit into a short, premium "campaign" through Davor's career —
game-quality motion and reward feedback that emphasise his professional
development, while staying credible for a C-level audience (recruiters,
boards). Every number, badge and unlock is backed by `src/content/profile.ts`
— no invented scores, levels or self-ratings (P-2).

---

## IN SCOPE

1. **Campaign progress (whole site)** — a slim progress bar under the
   navigation fills as the visitor explores; each section is a named chapter
   ("Chapter 3 · Experience"). First visit of a chapter shows a brief,
   elegant "Chapter unlocked" banner (auto-hides, never blocks content).
2. **Career timeline as a campaign map** — the 8 roles become levels on a
   glowing path, grouped by the same 3 eras as the hero orbits; each level
   "unlocks" with a light sweep when scrolled into view; the current role is
   the highlighted "active mission".
3. **Trophy room** — awards and headline achievements as 3D trophy cards
   with rarity tiers (see decision 1), shimmer on hover, flip to show the
   source (company, period).
4. **Credentials as badges** — certifications and standards as collectible
   badge medallions (no fake scores).
5. **Visitor quest** — visiting all chapters completes the campaign: a short
   celebratory sequence and a highlighted call to action ("Book a
   consultation"). Progress remembered in the visitor's browser only.
6. **Quality bar** — 60 fps CSS/WebGL-light effects, reduced-motion versions
   of everything, a "Reduce effects" toggle in the menu, full keyboard and
   screen-reader support, no sound.

## OUT OF SCOPE
- Any content change; leaderboards or accounts for visitors; tracking of
  individual visitors beyond anonymous analytics events.

## NEEDED FROM THE DIRECTOR (M-4 — content and tone)
1. **Trophy rarity** — proposal:
   - Legendary: Business Leader for Sustainable Development in BiH 2025
   - Epic: 673% net profit growth · Operating income €12M → €16M (+33%)
   - Rare: €11M+ contracts secured · 220% enrollment growth (IDSS)
2. **Chapter names** — proposal: Prologue (Home), 1 The Leader (About),
   2 The Campaign (Experience), 3 The Author (Books), 4 The System (AISBP),
   5 The Lab (Portfolio), 6 Giving Back (Volunteering), 7 The Allies
   (References), 8 The Next Mission (Contact).
3. **Tone check** — is a visible progress bar + "Chapter unlocked" banner
   right for your audience, or should gamification stay quieter (effects
   only, no progress/quest)?
4. Approval of this sprint.

## DONE CRITERIA
DONE_CHECKLIST; Director review on a local build (desktop + phone) before
publication; reduced-motion and keyboard walkthrough verified.


---

## PROGRESS (2026-09-26)

| # | Item | Status |
|---|---|---|
| 1 | Campaign progress bar, chapter chip, "Chapter unlocked" banner | ✅ `components/campaign/CampaignHud.tsx`, state in `hooks/useCampaign.tsx` |
| 2 | Career timeline as campaign map (LVL 1–8, era banners, active mission, light sweep) | ✅ `ExperienceSection.tsx` |
| 3 | Trophy Room (Legendary / Epic / Rare, flip to source) | ✅ `components/campaign/TrophyRoom.tsx` |
| 4 | Badge case + Vibe-Coding Journal founder badge | ✅ `components/campaign/BadgeCase.tsx` |
| 5 | Visitor quest completion celebration + CTA | ✅ `components/campaign/CompletionCelebration.tsx` |
| 6 | "Reduce effects" switch (also freezes the hero scene), reduced-motion respected, keyboard + screen reader | ✅ |

Single sources: chapters in `src/content/campaign.ts` (navigation and footer
now read it), trophies and ventures in `src/content/profile.ts`
(`awards` removed — consumers enumerated per E-14: About section, chatbot
knowledge, types). Verified with real-time CDP captures: desktop dark/light,
phone 390 px (no horizontal overflow), banner, completion (9/9).

## HANDOFF NOTE — Sprint 03
Completed: items 1–6 above.
Director feedback applied before publication: prominent era banners; chatbot reliability (model fallback + multi-key); Lovable audit.
Open risks: progress is per browser (localStorage) by design.
Technical debt: none new (3 lint warnings — hook + provider in one file).
Next: Director review → publish; then KRAJ or further sprints as he decides.

COMMANDER COMPLIANCE — Sprint 03
──────────────────────────────────
Rules followed without reminder:        all applicable (M-4: badge text sourced
                                           from the service itself; E-14: awards
                                           consumers enumerated)
Rules violated, caught by ACA:          1 (utility `.fx-sweep` overrode
                                           `position` and broke card height)
Rules violated, caught by Director:     0
Rules that slowed work or felt wrong:   none
New rules suggested by this sprint:     see corrections/SPRINT_03_LESSONS.md
