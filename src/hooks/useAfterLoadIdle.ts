import { useEffect, useState } from "react";

/**
 * True once the page has loaded and the browser is idle. Heavy, non-critical UI
 * (the three.js hero scene, the 60 portfolio cards) waits for it so it never
 * competes with the portrait (LCP) and first paint on mobile.
 */
export function useAfterLoadIdle(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if ("requestIdleCallback" in window) idleHandle = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      else timeoutHandle = globalThis.setTimeout(() => setReady(true), 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== undefined) globalThis.clearTimeout(timeoutHandle);
    };
  }, []);
  return ready;
}
