import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultationDialog } from "@/components/ConsultationDialog";
import { profile } from "@/content/profile";
import { useCampaign } from "@/hooks/useCampaign";

const PARTICLE_COUNT = 90;
const PARTICLE_LIFETIME_MS = 2600;
const GRAVITY = 0.00055;
const YEARS_OF_EXPERIENCE = profile.heroMetrics[0]?.value ?? "25+";
const TOKEN_COLORS = ["--rarity-legendary", "--primary", "--accent", "--accent-purple"] as const;

/** One-shot light burst drawn on a canvas (no dependency). */
function runBurst(canvas: HTMLCanvasElement): () => void {
  const context = canvas.getContext("2d");
  if (!context) return () => undefined;
  const width = (canvas.width = canvas.clientWidth);
  const height = (canvas.height = canvas.clientHeight);
  const styles = getComputedStyle(document.documentElement);
  const colors = TOKEN_COLORS.map((token) => `hsl(${styles.getPropertyValue(token).trim()})`);
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.3;
    const speed = 0.25 + Math.random() * 0.45;
    return {
      x: width / 2,
      y: height / 2.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.25,
      size: 1.5 + Math.random() * 2.5,
      color: colors[index % colors.length],
    };
  });
  const start = performance.now();
  let frame = 0;
  const step = (now: number) => {
    const elapsed = now - start;
    context.clearRect(0, 0, width, height);
    const life = 1 - elapsed / PARTICLE_LIFETIME_MS;
    if (life <= 0) return;
    for (const particle of particles) {
      const t = elapsed;
      const x = particle.x + particle.vx * t;
      const y = particle.y + particle.vy * t + GRAVITY * t * t * 0.5;
      context.globalAlpha = life;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(x, y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
    frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

/**
 * Shown once, when the visitor has explored every chapter: a short
 * celebration and the campaign's natural next step — a consultation.
 */
export function CompletionCelebration() {
  const { celebrating, dismissCelebration, effectsEnabled, chapters } = useCampaign();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!celebrating || !effectsEnabled || !canvasRef.current) return;
    return runBurst(canvasRef.current);
  }, [celebrating, effectsEnabled]);

  useEffect(() => {
    if (!celebrating) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissCelebration();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [celebrating, dismissCelebration]);

  return (
    <AnimatePresence>
      {celebrating && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="campaign-complete-title"
        >
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
          <motion.div
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="fx-legendary-border fx-sweep fx-sweep-run relative w-full max-w-md rounded-3xl border-2 border-transparent p-8 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={dismissCelebration}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--rarity-legendary))]/15 shadow-[0_0_40px_hsl(var(--rarity-legendary)/0.45)]">
              <Trophy className="h-8 w-8 text-[hsl(var(--rarity-legendary))]" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[hsl(var(--rarity-legendary))]">
              Campaign complete · {chapters.length}/{chapters.length}
            </p>
            <h2 id="campaign-complete-title" className="mt-2 text-2xl font-bold text-foreground">
              You've explored the whole journey
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {YEARS_OF_EXPERIENCE} years, {profile.experience.length} leadership roles, {profile.books.length + 1} books and the AISBP
              Framework™. The next mission could be yours.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <ConsultationDialog
                source="campaign_complete"
                trigger={<Button size="lg">Book a consultation</Button>}
              />
              <Button size="lg" variant="outline" onClick={dismissCelebration}>
                Continue exploring
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
