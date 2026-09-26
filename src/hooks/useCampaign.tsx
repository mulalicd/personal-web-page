import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CHAPTERS, type Chapter } from "@/content/campaign";
import { track } from "@/lib/analytics";

/**
 * Career Campaign state (Sprint 03): which chapters (page sections) this
 * visitor has explored, the chapter currently on screen, the "Chapter
 * unlocked" banner, the completion celebration and the "Reduce effects"
 * switch. Progress lives only in this visitor's browser (localStorage).
 */

const STORAGE_VISITED = "campaign:visited:v1";
const STORAGE_COMPLETED = "campaign:completed:v1";
const STORAGE_EFFECTS = "campaign:effects:v1";
/** A section counts as "entered" when it crosses this band in the middle of the viewport. */
const CHAPTER_BAND_ROOT_MARGIN = "-40% 0px -55% 0px";
const BANNER_VISIBLE_MS = 2800;

interface CampaignContextValue {
  chapters: readonly Chapter[];
  visited: ReadonlySet<string>;
  current: Chapter | null;
  /** 0–1 share of chapters explored. */
  progress: number;
  /** Chapter to announce in the banner, or null. */
  banner: Chapter | null;
  /** True once, when the last chapter gets explored. */
  celebrating: boolean;
  dismissCelebration: () => void;
  /** Rich effects on (false when the visitor or the OS asks for less motion). */
  effectsEnabled: boolean;
  setEffectsEnabled: (enabled: boolean) => void;
}

const CampaignContext = createContext<CampaignContextValue | undefined>(undefined);

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode / storage disabled: progress simply isn't remembered.
  }
}

function initialVisited(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(readStorage(STORAGE_VISITED) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function initialEffects(): boolean {
  const stored = readStorage(STORAGE_EFFECTS);
  if (stored !== null) return stored === "on";
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Provides campaign state to the homepage. */
export function CampaignProvider({ children }: { children: ReactNode }) {
  const [visited, setVisited] = useState<Set<string>>(initialVisited);
  const [current, setCurrent] = useState<Chapter | null>(null);
  const [banner, setBanner] = useState<Chapter | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [effectsEnabled, setEffectsState] = useState<boolean>(initialEffects);
  const bannerTimer = useRef<number | null>(null);
  const alreadyCompleted = useRef(readStorage(STORAGE_COMPLETED) === "yes");
  // Mirror of `visited` so side effects never run inside a state updater.
  const visitedRef = useRef(visited);

  const enterChapter = useCallback(
    (chapter: Chapter) => {
      setCurrent(chapter);
      if (visitedRef.current.has(chapter.sectionId)) return;
      const next = new Set(visitedRef.current).add(chapter.sectionId);
      visitedRef.current = next;
      setVisited(next);
      writeStorage(STORAGE_VISITED, JSON.stringify([...next]));
      track("campaign_chapter_unlocked", { source: chapter.sectionId, result: "info", explored: next.size });

      // The prologue is where every visit starts — no banner for it.
      if (chapter.number > 0 && effectsEnabled) {
        setBanner(chapter);
        if (bannerTimer.current !== null) window.clearTimeout(bannerTimer.current);
        bannerTimer.current = window.setTimeout(() => setBanner(null), BANNER_VISIBLE_MS);
      }
      if (next.size === CHAPTERS.length && !alreadyCompleted.current) {
        alreadyCompleted.current = true;
        writeStorage(STORAGE_COMPLETED, "yes");
        track("campaign_completed", { source: chapter.sectionId, result: "success" });
        setCelebrating(true);
      }
    },
    [effectsEnabled],
  );

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const bySection = new Map(CHAPTERS.map((chapter) => [chapter.sectionId, chapter]));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const chapter = bySection.get((entry.target as HTMLElement).id);
          if (entry.isIntersecting && chapter) enterChapter(chapter);
        }
      },
      { rootMargin: CHAPTER_BAND_ROOT_MARGIN, threshold: 0 },
    );
    for (const chapter of CHAPTERS) {
      const element = document.getElementById(chapter.sectionId);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [enterChapter]);

  useEffect(
    () => () => {
      if (bannerTimer.current !== null) window.clearTimeout(bannerTimer.current);
    },
    [],
  );

  const setEffectsEnabled = useCallback((enabled: boolean) => {
    setEffectsState(enabled);
    writeStorage(STORAGE_EFFECTS, enabled ? "on" : "off");
    if (!enabled) setBanner(null);
    track("campaign_effects_toggled", { source: "navigation", result: "info", enabled });
  }, []);

  const value = useMemo<CampaignContextValue>(
    () => ({
      chapters: CHAPTERS,
      visited,
      current,
      progress: visited.size / CHAPTERS.length,
      banner,
      celebrating,
      dismissCelebration: () => setCelebrating(false),
      effectsEnabled,
      setEffectsEnabled,
    }),
    [visited, current, banner, celebrating, effectsEnabled, setEffectsEnabled],
  );

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}

/** Campaign state; outside the provider (e.g. /admin) returns a neutral, effects-off state. */
export function useCampaign(): CampaignContextValue {
  const context = useContext(CampaignContext);
  if (context) return context;
  return {
    chapters: CHAPTERS,
    visited: new Set(),
    current: null,
    progress: 0,
    banner: null,
    celebrating: false,
    dismissCelebration: () => undefined,
    effectsEnabled: false,
    setEffectsEnabled: () => undefined,
  };
}
