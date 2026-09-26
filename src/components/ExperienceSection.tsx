import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Building2, TrendingUp, Briefcase, Landmark, Heart, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { profile } from "@/content/profile";
import type { CareerEraId, ExperienceIcon } from "@/types";
import { useCampaign } from "@/hooks/useCampaign";

const EXPERIENCE_ICONS: Record<ExperienceIcon, LucideIcon> = {
  building: Building2,
  trending: TrendingUp,
  briefcase: Briefcase,
  landmark: Landmark,
  heart: Heart,
};

const ERA_BY_ID = new Map(profile.careerEras.map((era) => [era.id, era]));
/** Eras are numbered chronologically (profile.careerEras is oldest first). */
const ERA_NUMERALS = ["I", "II", "III", "IV", "V"];

/** Roles of an era, in the timeline's order (most recent first). */
function eraRoles(eraId: CareerEraId) {
  return profile.experience.filter((entry) => entry.era === eraId);
}

const ERA_TOKEN: Record<CareerEraId, string> = {
  finance: "--primary",
  industry: "--accent-purple",
  education: "--accent",
};

/**
 * Chapter 2 · The Campaign — the career as a campaign map (Sprint 03):
 * levels numbered chronologically (LVL 1 = 1997), era banners matching the
 * hero orbits, the current role as the "active mission", and a light sweep
 * when each level scrolls into view.
 */
export function ExperienceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { effectsEnabled } = useCampaign();
  const [unlocked, setUnlocked] = useState<ReadonlySet<string>>(new Set());
  const unlock = (key: string) =>
    setUnlocked((previous) => (previous.has(key) ? previous : new Set(previous).add(key)));

  return (
    <section id="experience" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
            >
              Professional Journey
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              25+ Years of Executive Leadership
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Driving growth, innovation, and operational excellence across education, 
              finance, manufacturing, and corporate sectors.
            </motion.p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Campaign path */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-1 -translate-x-[1px] rounded-full bg-gradient-to-b from-accent via-[hsl(var(--accent-purple))] to-primary shadow-[0_0_14px_hsl(var(--primary)/0.45)]" />

            {profile.experience.map((exp, index) => {
              const Icon = EXPERIENCE_ICONS[exp.icon];
              const key = exp.organization + exp.period;
              const level = profile.experience.length - index;
              const era = ERA_BY_ID.get(exp.era);
              const eraStarts = index === 0 || profile.experience[index - 1].era !== exp.era;
              const eraColor = `hsl(var(${ERA_TOKEN[exp.era]}))`;
              return (
                <div key={key}>
                  {eraStarts && era && (
                    <div className={`relative pl-16 md:pl-20 ${index === 0 ? "mb-10" : "mt-16 mb-10"}`}>
                      {/* Era waypoint on the campaign path */}
                      <span
                        className="absolute left-[0.4rem] md:left-[0.9rem] top-1/2 h-9 w-9 -translate-y-1/2 rotate-45 rounded-md border-[3px] border-background"
                        style={{ backgroundColor: eraColor, boxShadow: `0 0 0 4px hsl(var(${ERA_TOKEN[exp.era]}) / 0.2), 0 0 28px ${eraColor}` }}
                        aria-hidden="true"
                      />
                      <div
                        className="rounded-2xl border-2 px-6 py-5 md:px-8 md:py-6"
                        style={{
                          borderColor: `hsl(var(${ERA_TOKEN[exp.era]}) / 0.45)`,
                          background: `linear-gradient(100deg, hsl(var(${ERA_TOKEN[exp.era]}) / 0.14), hsl(var(${ERA_TOKEN[exp.era]}) / 0.02) 70%)`,
                          boxShadow: `0 0 32px hsl(var(${ERA_TOKEN[exp.era]}) / 0.18)`,
                        }}
                      >
                        <p className="text-xs md:text-sm font-extrabold uppercase tracking-[0.3em]" style={{ color: eraColor }}>
                          Era {ERA_NUMERALS[profile.careerEras.findIndex((candidate) => candidate.id === era.id)]} · {era.period}
                        </p>
                        <h3 className="mt-1 text-2xl md:text-3xl font-extrabold text-foreground">{era.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {eraRoles(era.id).length} {eraRoles(era.id).length === 1 ? "role" : "roles"} ·{" "}
                          {eraRoles(era.id).map((role) => role.organization).join(" · ")}
                        </p>
                      </div>
                    </div>
                  )}
                <motion.div
                  initial={effectsEnabled ? { opacity: 0, x: -30 } : false}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  onViewportEnter={() => unlock(key)}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  className="relative mb-8 last:mb-0 pl-16 md:pl-20"
                >
                  {/* Level node on the campaign path */}
                  <div
                    className={`absolute left-0 md:left-2 w-12 h-12 rounded-full flex items-center justify-center border-4 border-background z-10 ${
                      exp.current ? "bg-primary" : "bg-card"
                    }`}
                    style={{ boxShadow: `0 0 ${exp.current ? 26 : 14}px ${eraColor}` }}
                  >
                    <Icon className={`w-5 h-5 ${exp.current ? "text-primary-foreground" : "text-primary"}`} aria-hidden="true" />
                    {exp.current && effectsEnabled && (
                      <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-40" aria-hidden="true" />
                    )}
                  </div>

                  {/* Content Card */}
                  <GlassCard
                    delay={0}
                    className={`fx-sweep p-6 lg:p-8 ${unlocked.has(key) && effectsEnabled ? "fx-sweep-run" : ""} ${
                      exp.current ? "border-2 border-primary/40" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-md px-2 py-0.5 text-[0.625rem] font-extrabold tracking-[0.18em]"
                            style={{ color: eraColor, backgroundColor: `hsl(var(${ERA_TOKEN[exp.era]}) / 0.12)` }}
                          >
                            LVL {level}
                          </span>
                          {exp.current && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                              Active mission · Current role
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-foreground">
                          {exp.title}
                        </h3>
                        <p className="text-primary font-medium">
                          {exp.organization}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {exp.period} · {exp.location}
                        </p>
                      </div>

                      {/* Key figures of the role (source: CV / LinkedIn via profile.ts) */}
                      <dl className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        {exp.metrics.map((metric) => (
                          <div
                            key={metric.label}
                            className="flex min-w-[5.5rem] flex-col-reverse rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-center"
                          >
                            <dt className="text-[0.625rem] text-muted-foreground">{metric.label}</dt>
                            <dd className="text-sm font-bold text-primary">{metric.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {exp.achievements.map((achievement) => (
                        <li key={achievement} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>

                    {exp.technologies && (
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
