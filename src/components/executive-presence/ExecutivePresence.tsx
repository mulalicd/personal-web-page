import { useEffect, useRef, useState, type RefObject } from "react";
import { profile } from "@/content/profile";
import { useCampaign } from "@/hooks/useCampaign";
import { ExecutivePresenceScene, type HoverInfo, type OrbitNode } from "./scene";

interface ExecutivePresenceProps {
  /** The circular portrait element the orbits wrap around. */
  portraitRef: RefObject<HTMLElement>;
}

/** First four-digit year in a period such as "Jul 2020 – Present". */
function startYear(period: string): number {
  const match = /\d{4}/.exec(period);
  return match ? Number(match[0]) : 0;
}

const ORBIT_NODES: OrbitNode[] = profile.experience.map((entry) => ({
  era: entry.era,
  organization: entry.organization,
  title: entry.title,
  period: entry.period,
  startYear: startYear(entry.period),
}));

/** True when the browser can create a WebGL context. */
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * "Executive Presence" hero scene (Sprint 02). Rendered above the portrait;
 * falls back to nothing (the plain portrait) when WebGL is unavailable.
 * Lazy-loaded by HeroSection so three.js never delays the first paint.
 */
export default function ExecutivePresence({ portraitRef }: ExecutivePresenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [enabled] = useState(supportsWebGL);
  const { effectsEnabled } = useCampaign();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!enabled || !canvas || !container) return;

    // OS setting OR the site's "Reduce effects" switch → still frame.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !effectsEnabled;
    let scene: ExecutivePresenceScene;
    try {
      scene = new ExecutivePresenceScene({
        canvas,
        eras: profile.careerEras,
        nodes: ORBIT_NODES,
        reducedMotion,
        onHover: setHover,
        measurePortrait: () => {
          const portrait = portraitRef.current;
          if (!portrait) return null;
          const canvasRect = canvas.getBoundingClientRect();
          const portraitRect = portrait.getBoundingClientRect();
          // Undo CSS transforms (the hero scales in from 0.9): the scene works in
          // the canvas' own CSS pixels, not in transformed screen pixels.
          const scale = canvasRect.width / Math.max(canvas.clientWidth, 1) || 1;
          return {
            centerX: (portraitRect.left - canvasRect.left + portraitRect.width / 2) / scale,
            centerY: (portraitRect.top - canvasRect.top + portraitRect.height / 2) / scale,
            radius: portraitRect.width / 2 / scale,
          };
        },
      });
    } catch (error) {
      console.error("[executive-presence] WebGL scene failed to start:", error);
      return;
    }

    // Run only while the hero is on screen and the tab is visible.
    let onScreen = true;
    const sync = () => (onScreen && !document.hidden ? scene.start() : scene.stop());
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(container);
    document.addEventListener("visibilitychange", sync);

    const resize = new ResizeObserver(() => scene.resize());
    resize.observe(container);
    if (portraitRef.current) resize.observe(portraitRef.current);

    // Light/dark toggle changes the <html> class — re-read colours and blending.
    const theme = new MutationObserver(() => scene.applyTheme());
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    sync();
    return () => {
      visibility.disconnect();
      resize.disconnect();
      theme.disconnect();
      document.removeEventListener("visibilitychange", sync);
      scene.dispose();
    };
  }, [enabled, portraitRef, effectsEnabled]);

  if (!enabled) return null;

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-pan-y" />
      {hover && (
        <div
          className="pointer-events-none absolute z-20 w-max max-w-[16rem] -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl border border-border/60 bg-card/95 px-3 py-2 text-left shadow-xl backdrop-blur-md"
          style={{ left: hover.x, top: hover.y }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{hover.eraName}</p>
          <p className="text-xs font-semibold leading-snug text-foreground">{hover.node.organization}</p>
          <p className="text-[11px] leading-snug text-muted-foreground">{hover.node.title}</p>
          <p className="text-[10px] text-muted-foreground">{hover.node.period}</p>
        </div>
      )}
    </div>
  );
}
