import { useEffect } from "react";
import { setLastVisibleSection, track } from "@/lib/analytics";

/**
 * Observes all <section id="..."> elements on the page and:
 *  - updates the global "last visible section" (auto-attached to all events)
 *  - emits a `section_view` event the first time each section becomes visible
 *
 * Cheap: single IntersectionObserver, no per-section listeners.
 */
export function useSectionTracking() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible intersecting section in this batch
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        for (const entry of visible) {
          const id = (entry.target as HTMLElement).id;
          if (!id) continue;
          setLastVisibleSection(id);
          if (!seen.has(id)) {
            seen.add(id);
            track("section_view", { source: id, result: "info" });
          }
          break; // only update once per batch
        }
      },
      { threshold: [0.4] }
    );

    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);
}
