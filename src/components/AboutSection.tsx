import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import awardCeremony from "@/assets/award-ceremony.webp";
import awardSpeech from "@/assets/speaking-event.webp";
import ImageLightbox from "./ImageLightbox";
import { MetricBarGroup } from "@/components/MetricBar3D";
import { profile } from "@/content/profile";
import type { AccentColor, GalleryEntry } from "@/types";

const GALLERY_IMAGES: Record<GalleryEntry["imageKey"], string> = {
  awardCeremony,
  awardSpeech,
};

const AWARD_BORDER: Record<AccentColor, string> = {
  primary: "hover:border-primary/30",
  accent: "hover:border-accent/30",
  purple: "hover:border-[hsl(var(--accent-purple))]/30",
  amber: "hover:border-[hsl(var(--accent-amber))]/30",
};

const galleryImages = profile.gallery.map((entry) => ({
  src: GALLERY_IMAGES[entry.imageKey],
  alt: entry.alt,
  caption: entry.caption,
  detail: entry.detail,
}));

/** "About" section: biography, education, competencies, awards, credentials, languages. */
export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section id="about" className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              About Me
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Executive Leader &amp; AI Strategist</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Biography, education, competencies */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              {profile.aboutParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}

              <div className="mb-8 mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Education</h3>
                <div className="space-y-3">
                  {profile.education.map((entry) => (
                    <div key={entry.degree} className="bg-background p-4 rounded-xl border border-border">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium text-foreground">{entry.degree}</span>
                        <span className="text-xs text-muted-foreground">{entry.period}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{entry.institution}</div>
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-4">Core Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {profile.competencies.map((item) => (
                  <span key={item} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Metrics, gallery, awards, credentials, languages */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-lg">
                <MetricBarGroup metrics={profile.aboutMetrics} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.caption}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Open photo: ${image.caption}`}
                    className="relative overflow-hidden rounded-xl aspect-[4/3] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 group"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Dark scrim so the caption stays readable on bright photos */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                      <p className="text-xs font-semibold text-white leading-tight">{image.caption}</p>
                      <p className="text-[10px] text-white/80 mt-0.5 line-clamp-2">{image.detail}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {profile.awards.map((award) => (
                  <div
                    key={award.title}
                    className={`bg-background rounded-xl p-3 border border-border transition-colors ${AWARD_BORDER[award.color]}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl leading-none mt-0.5" aria-hidden="true">{award.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-tight">{award.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{award.detail}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                          {award.period}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <CredentialList title="Certifications" icon="🎓" items={profile.certifications} />
              <CredentialList title="Standards Implemented" icon="📐" items={profile.standards} />

              <div className="bg-background p-6 rounded-2xl shadow-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Languages</h3>
                <dl className="space-y-3">
                  {profile.languages.map((entry) => (
                    <div key={entry.language} className="flex justify-between items-center gap-4">
                      <dt className="text-muted-foreground">{entry.language}</dt>
                      <dd className={entry.strong ? "text-primary font-medium" : "text-muted-foreground"}>{entry.level}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <ImageLightbox
        images={galleryImages}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(index) => setLightboxIndex(index)}
      />
    </section>
  );
}

interface CredentialListProps {
  title: string;
  icon: string;
  items: { name: string; detail: string }[];
}

function CredentialList({ title, icon, items }: CredentialListProps) {
  return (
    <div className="bg-background p-4 rounded-xl border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <span aria-hidden="true">{icon}</span> {title}
      </h3>
      <ul className="grid sm:grid-cols-2 gap-2">
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-2 py-1.5 px-2 bg-accent/5 rounded-lg border border-accent/10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
