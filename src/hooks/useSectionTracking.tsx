import { useEffect } from "react";
import { track } from "@/lib/analytics";

const SECTION_VISIBLE_RATIO = 0.4;

/**
 * Emits one `section_view` event the first time each `<section id>` becomes
 * visible — shows how far visitors read. Single IntersectionObserver.
 */
export function useSectionTracking(): void {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (!entry.isIntersecting || !id || seen.has(id)) continue;
          seen.add(id);
          track("section_view", { source: id, result: "info" });
        }
      },
      { threshold: [SECTION_VISIBLE_RATIO] },
    );
    document.querySelectorAll<HTMLElement>("section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
}
