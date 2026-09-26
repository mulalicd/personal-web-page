import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { profile } from "@/content/profile";
import { useCampaign } from "@/hooks/useCampaign";
import { track } from "@/lib/analytics";
import type { CredentialEntry } from "@/types";

/**
 * Badge case (Sprint 03): certifications as gold medallions, implemented
 * standards as silver ones, and a founder badge for each venture Davor
 * created. No scores, no levels — only credentials that exist (P-2).
 */
export function BadgeCase() {
  const { effectsEnabled } = useCampaign();

  return (
    <div className="space-y-5">
      {profile.ventures.map((venture) => (
        <motion.a
          key={venture.name}
          href={venture.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("venture_badge_click", { source: venture.name, result: "info" })}
          initial={effectsEnabled ? { opacity: 0, scale: 0.94 } : false}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={effectsEnabled ? { y: -3 } : undefined}
          className="relative fx-legendary-border fx-sweep fx-sweep-hover flex items-center gap-4 rounded-2xl border-2 border-transparent p-4 shadow-[0_0_28px_hsl(var(--rarity-legendary)/0.25)]"
        >
          <span className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--rarity-legendary))] to-[hsl(var(--accent-amber))] text-2xl shadow-lg">
            <span aria-hidden="true">🚀</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.625rem] font-bold uppercase tracking-[0.2em] text-[hsl(var(--rarity-legendary))]">
              Founder badge · {venture.role}
            </span>
            <span className="block text-base font-bold text-foreground">{venture.name}</span>
            <span className="block text-xs text-muted-foreground">{venture.tagline}</span>
            <span className="mt-1 block text-[0.6875rem] leading-snug text-muted-foreground">{venture.description}</span>
          </span>
          <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </motion.a>
      ))}

      <MedalRow title="Certifications" tone="gold" items={profile.certifications} />
      <MedalRow title="Standards Implemented" tone="silver" items={profile.standards} />
    </div>
  );
}

function MedalRow({ title, tone, items }: { title: string; tone: "gold" | "silver"; items: CredentialEntry[] }) {
  const { effectsEnabled } = useCampaign();
  const medal =
    tone === "gold"
      ? "from-[hsl(var(--rarity-legendary))] to-[hsl(var(--accent-amber))] shadow-[0_0_14px_hsl(var(--rarity-legendary)/0.35)]"
      : "from-slate-200 to-slate-400 dark:from-slate-300 dark:to-slate-500 shadow-[0_0_10px_hsl(var(--foreground)/0.12)]";

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item, index) => (
          <motion.li
            key={item.name}
            initial={effectsEnabled ? { opacity: 0, y: 10 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
            className="flex items-center gap-2 rounded-xl border border-border bg-background p-2"
          >
            <span
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[0.5625rem] font-extrabold text-white ${medal}`}
              aria-hidden="true"
            >
              {item.name.replace(/[^A-Z0-9]/g, "").slice(0, 3) || "★"}
            </span>
            <span className="min-w-0">
              <span className="block text-[0.6875rem] font-semibold leading-tight text-foreground">{item.name}</span>
              <span className="block text-[0.625rem] leading-tight text-muted-foreground">{item.detail}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
