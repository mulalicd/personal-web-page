import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Anchor, Heart, Users } from "lucide-react";

const volunteering = [
  {
    title: "Business Mentor / CMAS & SSI Dive Master Instructor",
    organization: "KVS Scuba",
    period: "Apr 2019 – Present",
    icon: Anchor,
    description: "Mentored 500+ diving enthusiasts in sports, commercial, and technical diving with 100% certification success rate.",
    achievements: [
      "Advocated for water resource preservation through 80+ community events, reaching 7,000+ participants",
      "Developed therapeutic diving programs benefitting 50+ individuals with disabilities",
      "Led collaborative workshops with a team of 10 instructors, improving training quality scores by 20%",
    ],
    active: true,
  },
  {
    title: "Member of the Research Unit",
    organization: "Sharklab Malta",
    period: "2016 – Present",
    icon: Heart,
    description: "Contributing to marine conservation and research efforts.",
    achievements: [
      "Conducted species monitoring and public outreach programs",
      "Supporting conservation efforts that reduced harmful fishing practices",
    ],
    active: true,
  },
  {
    title: "President / Co-Founder",
    organization: "ELAN NGO – Youth-Sport-Environment",
    period: "Sep 2010 – Jun 2018",
    icon: Users,
    description: "Co-founded and led organization promoting youth sports and environmental awareness.",
    achievements: [
      "Increased youth participation in sports by 40% and organized 15+ environmental events annually",
      "Designed engagement programs raising community involvement by 30%",
      "Secured €30,000 in funding for sustainability projects",
      "Partnered with local governments and schools benefitting 500+ participants annually",
    ],
  },
];

const interests = [
  { label: "Licensed Diving Instructor", detail: "CMAS 1* and SSI Dive Master Instructor" },
  { label: "Business Consulting", detail: "VISASQ / COLEMAN" },
];

export function VolunteeringSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="volunteering" className="py-20 lg:py-32 bg-card">
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
              Giving Back
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Volunteering & Leadership
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Beyond the boardroom, I believe that empathy, meaningful relationships, and giving back 
              to the community are essential for lasting professional and personal success.
            </motion.p>
          </div>

          {/* Volunteering Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {volunteering.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`bg-background p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all ${
                    item.active ? "border-2 border-accent/30" : "border border-border"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      item.active ? "bg-accent/10" : "bg-primary/10"
                    }`}>
                      <Icon className={`w-6 h-6 ${item.active ? "text-accent" : "text-primary"}`} />
                    </div>
                    <div className="flex-1">
                      {item.active && (
                        <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent rounded text-xs font-medium mb-1">
                          Active
                        </span>
                      )}
                      <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                      <p className="text-primary text-sm">{item.organization}</p>
                      <p className="text-xs text-muted-foreground">{item.period}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>

                  <ul className="space-y-2">
                    {item.achievements.slice(0, 2).map((achievement, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            className="bg-background p-6 rounded-2xl shadow-card"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Interests & Certifications</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {interests.map((interest, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                  <span className="font-medium text-foreground">{interest.label}</span>
                  <span className="text-muted-foreground text-sm">• {interest.detail}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
