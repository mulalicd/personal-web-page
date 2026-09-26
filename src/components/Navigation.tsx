import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Sun, Moon, Sparkles, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultationDialog } from "@/components/ConsultationDialog";
import { DMLogo } from "@/components/DMLogo";
import { useTheme } from "@/hooks/useTheme";
import { NAV_SOLID_SCROLL_OFFSET } from "@/constants";
import { CHAPTERS } from "@/content/campaign";
import { useCampaign } from "@/hooks/useCampaign";

const navItems = CHAPTERS.map((chapter) => ({ label: chapter.navLabel, href: `#${chapter.sectionId}` }));

/** "Reduce effects" switch for the Career Campaign motion (Sprint 03). */
function EffectsToggle({ size }: { size: "sm" | "md" }) {
  const { effectsEnabled, setEffectsEnabled } = useCampaign();
  const Icon = effectsEnabled ? Sparkles : Minus;
  return (
    <button
      type="button"
      onClick={() => setEffectsEnabled(!effectsEnabled)}
      aria-pressed={!effectsEnabled}
      aria-label={effectsEnabled ? "Reduce visual effects" : "Enable visual effects"}
      title={effectsEnabled ? "Reduce effects" : "Enable effects"}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      <Icon className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
    </button>
  );
}

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > NAV_SOLID_SCROLL_OFFSET);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = CHAPTERS.map((chapter) => chapter.sectionId);
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        {
          rootMargin: "-40% 0px -55% 0px",
          threshold: 0,
        }
      );
      observer.observe(element);
      observers.push(observer);
    });
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-card border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#home" aria-label="Davor Mulalić — back to top" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <DMLogo size={36} />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const sectionId = item.href.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* CTA + Theme Toggle */}
          <div className="hidden lg:flex items-center gap-3">
            <EffectsToggle size="sm" />
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <ConsultationDialog source="navigation" trigger={<Button size="sm">Book Consultation</Button>} />
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border"
          >
            <div className="py-4 space-y-2">
              {navItems.map((item) => {
                const sectionId = item.href.replace("#", "");
                const isActive = activeSection === sectionId;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
              <div className="px-4 pt-4 border-t border-border mt-4 flex items-center gap-3">
                <EffectsToggle size="md" />
                <button
                  onClick={toggle}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <ConsultationDialog
                  source="navigation_mobile"
                  trigger={<Button size="sm" className="flex-1">Book Consultation</Button>}
                />
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
