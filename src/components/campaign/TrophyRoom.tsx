import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { profile } from "@/content/profile";
import { useCampaign } from "@/hooks/useCampaign";
import { track } from "@/lib/analytics";
import type { Trophy, TrophyRarity } from "@/types";

const RARITY: Record<TrophyRarity, { label: string; token: string; frame: string }> = {
  legendary: { label: "Legendary", token: "--rarity-legendary", frame: "fx-legendary-border border-2 border-transparent" },
  epic: { label: "Epic", token: "--rarity-epic", frame: "border-2 border-[hsl(var(--rarity-epic))]/50" },
  rare: { label: "Rare", token: "--rarity-rare", frame: "border-2 border-[hsl(var(--rarity-rare))]/45" },
};

/** Trophy Room: awards and headline achievements as collectible cards (Sprint 03). */
export function TrophyRoom() {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span aria-hidden="true">🏛️</span> Trophy Room
        <span className="text-xs font-normal text-muted-foreground">· tap a trophy to see its source</span>
      </h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {profile.trophies.map((trophy, index) => (
          <li key={trophy.title} className={trophy.rarity === "legendary" ? "sm:col-span-2" : undefined}>
            <TrophyCard trophy={trophy} index={index} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrophyCard({ trophy, index }: { trophy: Trophy; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const { effectsEnabled } = useCampaign();
  const rarity = RARITY[trophy.rarity];
  const legendary = trophy.rarity === "legendary";

  const flip = () => {
    setFlipped((value) => !value);
    if (!flipped) track("trophy_flipped", { source: trophy.rarity, result: "info" });
  };

  const faceBase = `absolute inset-0 rounded-2xl p-4 [backface-visibility:hidden] bg-card ${rarity.frame}`;

  return (
    <motion.button
      type="button"
      onClick={flip}
      aria-pressed={flipped}
      aria-label={`${rarity.label} trophy: ${trophy.title}, ${trophy.period}. ${flipped ? "Showing source." : "Press to show source."}`}
      initial={effectsEnabled ? { opacity: 0, y: 24, rotateX: -12 } : false}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 160, damping: 18 }}
      whileHover={effectsEnabled ? { y: -4, scale: 1.015 } : undefined}
      className={`group relative block w-full text-left [perspective:1000px] ${legendary ? "h-40" : "h-36"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl`}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={effectsEnabled ? { type: "spring", stiffness: 140, damping: 18 } : { duration: 0 }}
      >
        {/* Front */}
        <div
          className={`${faceBase} fx-sweep fx-sweep-hover`}
          style={{ boxShadow: `0 0 ${legendary ? 36 : 18}px hsl(var(${rarity.token}) / ${legendary ? 0.35 : 0.2})` }}
        >
          <div className="flex items-start justify-between">
            <span
              className="rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.18em]"
              style={{ color: `hsl(var(${rarity.token}))`, backgroundColor: `hsl(var(${rarity.token}) / 0.12)` }}
            >
              {rarity.label}
            </span>
            <RotateCw className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className={`${legendary ? "text-4xl" : "text-3xl"} leading-none`} aria-hidden="true">{trophy.icon}</span>
            <span className={`${legendary ? "text-3xl" : "text-2xl"} font-extrabold`} style={{ color: `hsl(var(${rarity.token}))` }}>
              {trophy.headline}
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold leading-snug text-foreground line-clamp-2">{trophy.title}</p>
          <p className="text-[0.625rem] text-muted-foreground">{trophy.period}</p>
        </div>

        {/* Back */}
        <div className={`${faceBase} [transform:rotateY(180deg)] overflow-y-auto`}>
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em]" style={{ color: `hsl(var(${rarity.token}))` }}>
            Source · {trophy.period}
          </p>
          <p className="mt-1 text-xs font-semibold leading-snug text-foreground">{trophy.source}</p>
          <p className="mt-1 text-[0.6875rem] leading-snug text-muted-foreground">{trophy.detail}</p>
        </div>
      </motion.div>
    </motion.button>
  );
}
