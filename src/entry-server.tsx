/**
 * Build-time prerender entry (Sprint 04). scripts/prerender.mjs renders the
 * homepage with this into dist/index.html; the browser then hydrates it.
 */
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App, { AppRoutes } from "./App";

export function render(url: string): string {
  return renderToString(
    <App>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </App>,
  );
}
