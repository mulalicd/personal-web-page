import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App, { AppRoutes } from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;
const app = (
  <App>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </App>
);

// The homepage ships prerendered HTML (Sprint 04): attach to it instead of
// redrawing. Hydration waits one frame so the browser paints that HTML first —
// otherwise the already-preloaded scripts run before the first paint and the
// phone shows nothing until hydration ends. Every other route is served from
// the empty spa.html shell.
if (container.hasChildNodes()) {
  // Background tabs never run animation frames, so a timer guarantees hydration.
  let hydrated = false;
  const hydrate = () => {
    if (hydrated) return;
    hydrated = true;
    hydrateRoot(container, app);
  };
  requestAnimationFrame(() => setTimeout(hydrate, 0));
  setTimeout(hydrate, 250);
} else {
  createRoot(container).render(app);
}
