import { AnimatePresence, motion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";
import { chapterLabel } from "@/content/campaign";
import { useCampaign } from "@/hooks/useCampaign";

/**
 * Career Campaign HUD (Sprint 03): a progress bar under the navigation, a
 * compact "current chapter · explored" chip, and the "Chapter unlocked"
 * banner. Purely presentational — state lives in useCampaign.
 */
export function CampaignHud() {
  const { chapters, visited, current, progress, banner, effectsEnabled } = useCampaign();
  const percent = Math.round(progress * 100);

  return (
    <>
      {/* Progress bar directly under the fixed navigation (h-16 / lg:h-20). */}
      <div
        className="fixed left-0 right-0 top-16 lg:top-20 z-40 h-[3px] bg-border/40"
        role="progressbar"
        aria-label="Career campaign: chapters explored"
        aria-valuemin={0}
        aria-valuemax={chapters.length}
        aria-valuenow={visited.size}
      >
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-primary via-[hsl(var(--accent-purple))] to-accent shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </div>

      {current && (
        <div className="fixed right-3 top-[4.6rem] lg:top-[5.6rem] z-40 hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-card/85 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-md backdrop-blur-md">
          <Compass className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="text-foreground">{chapterLabel(current)}</span>
          <span aria-hidden="true">·</span>
          <span>
            {visited.size}/{chapters.length} explored · {percent}%
          </span>
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 top-24 lg:top-28 z-50 flex justify-center px-4" aria-live="polite">
        <AnimatePresence>
          {banner && effectsEnabled && (
            <motion.div
              key={banner.sectionId}
              initial={{ opacity: 0, y: -24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="fx-sweep fx-sweep-run relative flex items-center gap-3 rounded-2xl border border-[hsl(var(--rarity-legendary))]/40 bg-card/95 px-5 py-3 shadow-2xl backdrop-blur-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--rarity-legendary))]/15">
                <Sparkles className="h-4 w-4 text-[hsl(var(--rarity-legendary))]" aria-hidden="true" />
              </span>
              <span className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--rarity-legendary))]">
                  Chapter {banner.number} unlocked
                </span>
                <span className="block text-sm font-semibold text-foreground">{banner.title}</span>
              </span>
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                {visited.size}/{chapters.length}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
