import { motion } from "framer-motion";
import { ArrowRight, Download, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CVRequestDialog } from "@/components/CVRequestDialog";
import davorProfile from "@/assets/davor-profile-real.webp";
import { HeroGlobe } from "@/components/HeroGlobe";
import { MetricBarGroup } from "@/components/MetricBar3D";
import { track } from "@/lib/analytics";
import { profile } from "@/content/profile";

/** Above-the-fold introduction: name, role, industries, CTAs and headline metrics. */
export function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center bg-hero pt-20 lg:pt-0 overflow-x-clip"
    >
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {/* Open for Mandates Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent border border-accent/20 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            {profile.availability}
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight"
            >
              Davor <span className="text-gradient">Mulalić</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-primary font-medium mb-4"
            >
              {profile.roleLine}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-6 max-w-xl leading-relaxed"
            >
              {profile.intro}
            </motion.p>

            {/* Industries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {profile.industries.map((industry, index) => (
                <motion.span
                  key={industry}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + index * 0.05 }}
                  className="px-3 py-1.5 bg-card border border-border rounded-full text-sm text-muted-foreground"
                >
                  {industry}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Button size="lg" asChild className="gap-2">
                <a
                  href="#experience"
                  onClick={() =>
                    track("cta_view_experience_click", {
                      source: "hero",
                      result: "success",
                    })
                  }
                >
                  View Experience
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <CVRequestDialog>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() =>
                    track("cta_download_cv_click", {
                      source: "hero",
                      result: "success",
                    })
                  }
                >
                  <Download className="w-4 h-4" />
                  Download CV
                </Button>
              </CVRequestDialog>
            </motion.div>

            {/* Connect Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-4"
            >
              <span className="text-sm text-muted-foreground">Connect:</span>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                <span className="text-sm font-medium">LinkedIn</span>
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm font-medium">Email</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Right Content - Image & Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="order-1 lg:order-2 flex flex-col items-center"
          >
            <div className="relative mb-8">
              {/* 3D Globe behind the profile image */}
              <div className="absolute -inset-16 md:-inset-20 lg:-inset-24">
                <HeroGlobe />
              </div>
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-2xl" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-full" />
              
              {/* Image container */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-card shadow-xl">
              <img
                  src={davorProfile}
                  alt={`${profile.name} — ${profile.headline}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  width={384}
                  height={384}
                />
              </div>
            </div>

            {/* 3D Metric Bars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="w-full bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-lg"
            >
              <MetricBarGroup metrics={profile.heroMetrics} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
