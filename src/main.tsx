import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/** Minimum time between two automatic reloads, so a broken release can never loop. */
const PRELOAD_RELOAD_COOLDOWN_MS = 60_000;
const PRELOAD_RELOAD_KEY = "preload-reload-at";

// Commander E-24: a tab left open across a release asks for chunks of the old
// build, which no longer exist. Reload once to pick up the new build instead
// of showing a broken 3D hero, chatbot or admin page.
window.addEventListener("vite:preloadError", (event) => {
  try {
    const last = Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY) ?? 0);
    if (Date.now() - last < PRELOAD_RELOAD_COOLDOWN_MS) return;
    sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the cooldown cannot be remembered, so never auto-reload (no loop).
    return;
  }
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
