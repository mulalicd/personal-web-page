import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, TrendingUp, Briefcase, Landmark, Heart, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { profile } from "@/content/profile";
import type { ExperienceIcon } from "@/types";

const EXPERIENCE_ICONS: Record<ExperienceIcon, LucideIcon> = {
  building: Building2,
  trending: TrendingUp,
  briefcase: Briefcase,
  landmark: Landmark,
  heart: Heart,
};

/** Career timeline, most recent role first (data: profile.experience). */
export function ExperienceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
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
            {/* Vertical Line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/20" />

            {profile.experience.map((exp, index) => {
              const Icon = EXPERIENCE_ICONS[exp.icon];
              return (
                <motion.div
                  key={exp.organization + exp.period}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="relative mb-8 last:mb-0 pl-16 md:pl-20"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-0 md:left-2 w-12 h-12 rounded-full flex items-center justify-center border-4 border-background z-10 ${
                    exp.current ? "bg-primary" : "bg-card border-primary/30"
                  }`}>
                    <Icon className={`w-5 h-5 ${exp.current ? "text-primary-foreground" : "text-primary"}`} />
                  </div>

                  {/* Content Card */}
                  <GlassCard
                    delay={0.4 + index * 0.1}
                    className={`p-6 lg:p-8 ${
                      exp.current ? "border-2 border-primary/30" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        {exp.current && (
                          <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium mb-2">
                            Current Role
                          </span>
                        )}
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
                            <dt className="text-[10px] text-muted-foreground">{metric.label}</dt>
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
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
