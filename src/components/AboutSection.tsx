import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import awardCeremony from "@/assets/award-ceremony.jpg";
import speakingEvent from "@/assets/speaking-event.jpg";
import ImageLightbox from "./ImageLightbox";
import { MetricBarGroup } from "@/components/MetricBar3D";

const stats = [
  { value: "25+", label: "Years Experience" },
  { value: "€16M", label: "Operating Income" },
  { value: "90%", label: "Revenue Boost" },
  { value: "500+", label: "Professionals Led" },
];

const competencies = [
  "Leadership & Future-Ready Management",
  "AI Strategy & Digital Transformation",
  "Workforce Development & Team Building",
  "Business Strategy & Sales Development",
  "Financial & Production Management",
  "Project Management",
  "School Management",
  "Complex Problem Solving",
  "Strong Decision Making",
  "Client Acquisition",
  "New Market Penetration",
  "Creative Design & Innovation",
];

const education = [
  { degree: "Master of International Business", institution: "Cambridge International Business Study" },
  { degree: "Doctor of Veterinary Medicine", institution: "Veterinary Faculty" },
];

const galleryImages = [
  {
    src: awardCeremony,
    alt: "Receiving Business Excellence Award",
    label: "Award Ceremony",
    caption: "Business Leader for Sustainable Development 2025",
    org: "UNDP · UN · Embassy of Sweden · Foreign Trade Chamber",
  },
  {
    src: speakingEvent,
    alt: "Keynote Speaker at Business Leaders Summit",
    label: "Keynote Speaker",
    caption: "Keynote Speaker — Business Leaders Summit",
    org: "AI Strategy & Digital Transformation",
  },
];

const awards = [
  {
    icon: "🏆",
    title: "Business Leader for Sustainable Development",
    year: "2025",
    org: "UNDP, United Nations, Embassy of Sweden & Foreign Trade Chamber of B&H",
    color: "accent",
  },
  {
    icon: "🎯",
    title: "CEO Excellence — 673% Net Profit Growth",
    year: "2019–2023",
    org: "Achieved as Managing Director & CEO",
    color: "primary",
  },
  {
    icon: "📈",
    title: "€16M Operating Income Growth",
    year: "2019–2023",
    org: "33% increase in operating income",
    color: "purple",
  },
  {
    icon: "🤝",
    title: "€11M+ Contracts Secured",
    year: "2019–2023",
    org: "Key client & supplier partnerships",
    color: "amber",
  },
];

const certifications = [
  { name: "ISO 9001:2015", desc: "Quality Management Systems" },
  { name: "HACCP", desc: "Food Safety Management" },
  { name: "FSC", desc: "Forest Stewardship Council" },
  { name: "PEFC", desc: "Forest Certification" },
  { name: "ERP", desc: "Enterprise Resource Planning" },
  { name: "KAIZEN", desc: "Continuous Improvement" },
  { name: "LEAN", desc: "Lean Management" },
  { name: "IAS", desc: "International Accounting Standards" },
];

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
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
            >
              About Me
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              Executive Leader & AI Strategist
            </motion.h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
            >
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Executive Leader and expert in AI Strategy and Digital Transformation with over 25 years 
                of experience driving growth, innovation, and operational excellence. In my roles as CEO and Managing Director, I have a proven track record of delivering strong 
                financial results, including a €16M (33%) increase in operating income and a 90% boost in revenue.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Leveraging my deep understanding of business needs and emerging technologies, I bridge traditional 
                leadership with AI-powered solutions, creating strategic roadmaps, implementing no-code AI tools, 
                and enabling data-driven decision-making that accelerates sustainable growth.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                A skilled negotiator and relationship builder, I have secured contracts exceeding €11M and 
                cultivated long-term partnerships with key clients and suppliers. My initiatives have driven 
                a 50% increase in employee engagement, demonstrating my ability to combine results-driven 
                leadership with people-centered management.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Beyond the boardroom, I am a devoted husband, proud father, and active philanthropist. Guided by personal values, I believe that empathy, meaningful relationships, and giving back to the community are essential for lasting professional and personal success. Today, I focus on helping organizations navigate the era of AI transformation—turning strategic vision into tangible business outcomes while fostering human-centered, future-ready leadership.
              </p>

              {/* Education */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Education</h3>
                <div className="space-y-3">
                  {education.map((edu, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-background p-4 rounded-xl border border-border"
                    >
                      <div className="font-medium text-foreground">{edu.degree}</div>
                      <div className="text-sm text-muted-foreground">{edu.institution}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Competencies */}
              <h3 className="text-lg font-semibold text-foreground mb-4">Core Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {competencies.map((item, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-lg">
                <MetricBarGroup
                  metrics={[
                    { metric: "25+", label: "Years Experience", percentage: 85, color: "primary" },
                    { metric: "€16M", label: "Operating Income", percentage: 95, color: "accent" },
                    { metric: "90%", label: "Revenue Boost", percentage: 90, color: "purple" },
                    { metric: "500+", label: "Professionals Led", percentage: 70, color: "amber" },
                  ]}
                />
              </div>

              {/* Awards & Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.85 }}
                className="space-y-4"
              >
                {/* Photo Gallery */}
                <div className="grid grid-cols-2 gap-3">
                  {galleryImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setLightboxIndex(index)}
                      className="relative overflow-hidden rounded-xl aspect-[4/3] cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-xs font-semibold text-white leading-tight">{image.caption}</p>
                        <p className="text-[10px] text-white/60 mt-0.5">{image.org}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Award Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {awards.map((award, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.9 + index * 0.08 }}
                      className={`bg-background rounded-xl p-3 border border-border hover:border-${award.color === "accent" ? "accent" : award.color === "primary" ? "primary" : award.color === "purple" ? "[hsl(var(--accent-purple))]" : "[hsl(var(--accent-amber))]"}/30 transition-colors`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-2xl leading-none mt-0.5">{award.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{award.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{award.org}</p>
                          <span className="inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">{award.year}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Certifications */}
                <div className="bg-background p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span>🎓</span> Standards & Certifications
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {certifications.map((cert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 1.1 + index * 0.05 }}
                        className="flex items-center gap-2 py-1.5 px-2 bg-accent/5 rounded-lg border border-accent/10"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-accent">{cert.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{cert.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Languages & Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.9 }}
                className="bg-background p-6 rounded-2xl shadow-card"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Languages</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Bosnian/Croatian/Serbian</span>
                    <span className="text-primary font-medium">C2 Native</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">English</span>
                    <span className="text-primary font-medium">C1 Professional</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">German</span>
                    <span className="text-muted-foreground">A2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">French</span>
                    <span className="text-muted-foreground">A1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Latin</span>
                    <span className="text-muted-foreground">B1</span>
                  </div>
                </div>
              </motion.div>
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
