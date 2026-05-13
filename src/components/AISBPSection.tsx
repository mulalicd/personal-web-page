import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, BookOpen, Monitor, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import aisbpLogo from "@/assets/aisbp-framework-logo.png";

const products = [
  {
    title: "AISBP Framework™ – Complete System",
    price: "€100",
    description:
      "Includes:\n– AI Solved Business Problems (PDF)\n– AISBP Operational Intelligence System (Web App)\n– The Leadership Matrix™ Simulation",
    buttonText: "Secure Access via PayPal",
    link: "https://www.paypal.com/ncp/payment/TV29C24U3J5SE",
    icon: BookOpen,
    featured: true,
  },
  {
    title: "AI Solved Business Problems – Strategic Field Manual (PDF)",
    price: "€30",
    description:
      "Structured documentation of 50 recurring operational breakdowns across 10 industries, including documented failure modes and conservative ROI models.",
    buttonText: "Purchase PDF",
    link: "https://www.paypal.com/ncp/payment/CKF79P6W4R93Q",
    icon: BookOpen,
  },
  {
    title: "AISBP Operational Intelligence System – Interactive Access",
    price: "€50",
    description:
      "Interactive executive decision environment with indexed problems, structured prompts, and financial modeling tools.",
    buttonText: "Access Web Application",
    link: "https://www.paypal.com/ncp/payment/BH2JQCNN953EL",
    icon: Monitor,
  },
  {
    title: "The Leadership Matrix™ – Executive Simulation Environment",
    price: "€40",
    description:
      "Structured crisis simulation for senior operational leaders navigating capital constraints, stakeholder friction, and time-sensitive decision pressure.",
    buttonText: "Access Simulation",
    link: "https://www.paypal.com/ncp/payment/SVXDJYGJVHDLA",
    icon: Gamepad2,
  },
];

const stats = [
  { value: "€12M+", label: "Generated ROI" },
  { value: "47", label: "Pilot Implementations" },
  { value: "50", label: "Business Problems" },
  { value: "150", label: "Failure Modes" },
];

export function AISBPSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="aisbp" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header with Logo */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <img
                src={aisbpLogo}
                alt="AISBP Framework™ Logo"
                className="h-20 md:h-24 w-auto"
                loading="lazy"
              />
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.25 }}
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
            >
              Executive Decision System
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              AISBP Framework™
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.35 }}
              className="text-primary text-sm font-medium mb-4"
            >
              Complete Operational Intelligence Architecture
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              An integrated executive decision system built on documented operational failure patterns, conservative financial modeling, and structured AI reasoning frameworks.
            </motion.p>
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-card p-4 rounded-xl border border-border">
                <div className="text-xl md:text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {products.map((product, index) => {
              const Icon = product.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.12 }}
                  className={`group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 ${
                    product.featured ? "border-2 border-primary/30 md:col-span-2" : "border border-border"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
                          {product.title}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                          {product.price}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-5 whitespace-pre-line leading-relaxed">
                      {product.description}
                    </p>
                    <Button variant="default" size="sm" className={product.featured ? "w-full" : "w-full"} asChild>
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {product.buttonText}
                      </a>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footnote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
            className="text-center text-xs text-muted-foreground mt-8"
          >
            Access instructions are delivered manually via email within 24 hours of confirmed payment.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
