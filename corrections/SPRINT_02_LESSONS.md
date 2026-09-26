# Sprint 02 — Lessons Learned
Date: 2026-09-26

## Corrections Applied
- First orbit tilt (+X rotation) brought the UPPER arc toward the camera, so
  the rings crossed Davor's face. Flipped to −X: upper arc behind the head,
  lower arc in front of the body. → For portrait-wrapping 3D, verify which
  half faces the camera before tuning anything else.
- Nodes were too small to read at 3.4 px; raised to 4.6 px with a 44 px halo.

## Gotchas Discovered
- Test browsers throttle requestAnimationFrame: the in-app pane freezes it
  (0 fps) and headless `--screenshot` / `--virtual-time-budget` captures before
  lazy chunks render. Reliable method: headless Chrome driven over CDP
  (Node 24 has a global WebSocket — no dependency), wait in real time, and jump
  the scene clock to the end state before `Page.captureScreenshot`.
- A per-frame dt cap (0.05 s) makes intros run slower than wall-clock on
  throttled/very slow devices — acceptable, but screenshots taken "after 5 s"
  may show t≈0.15 s.
- Additive blending looks great on dark and disappears on white; the scene
  switches to normal blending in light theme (MutationObserver on <html class>).
- Measuring a DOM element inside a parent that animates `scale` returns
  transformed sizes; normalise by `rect.width / clientWidth`.

## Commander Improvement Candidates
- ARCHITECTURE_PATTERNS: a "WebGL over DOM" pattern — depth-only occluder mesh
  matching an HTML element, orthographic camera in CSS pixels — lets 3D
  effects wrap real HTML content (keeps SEO/LCP of the <img>).
- DONE_CHECKLIST (visual features): "verified with a real-time CDP capture or
  on real hardware — not with a throttled preview pane".
