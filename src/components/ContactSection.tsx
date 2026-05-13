import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Mail, Linkedin, Phone, MapPin, Send, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingModal } from "@/components/BookingModal";
import { toast } from "@/hooks/use-toast";
import { contactFormSchema } from "@/lib/validation";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";

const contactMethods = [
  {
    icon: Phone,
    label: "Phone",
    value: "+387 (0)61 787 331",
    action: "tel:+38761787331",
  },
  {
    icon: Mail,
    label: "Email",
    value: "mulalic.davor@outlook.com",
    action: "mailto:mulalic.davor@outlook.com",
  },
  {
    icon: Linkedin,
    label: "LinkedIn Profile",
    value: "Connect on LinkedIn",
    action: "https://www.linkedin.com/in/davormulalic",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Sarajevo, Bosnia and Herzegovina",
    action: "https://www.google.com/maps/search/?api=1&query=Sarajevo%2C%20Bosnia%20and%20Herzegovina",
  },
];

const interestOptions = [
  "Executive Advisory",
  "AI Strategy Consulting",
  "Speaking Engagement",
  "Other",
];

type SendStatus =
  | { phase: "idle" }
  | { phase: "sending"; attempt: number }
  | { phase: "success"; attempts: number; latency: number; deduped: boolean }
  | { phase: "error"; reason: string };

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [sending, setSending] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [status, setStatus] = useState<SendStatus>({ phase: "idle" });
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    interest: "",
    message: "",
    website: "", // honeypot — uvijek prazno kod pravih korisnika
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🍯 Honeypot provjera — botovi popunjavaju skrivena polja
    if (formData.website) {
      // Tiho odbij bez poruke greške — bot ne smije znati da je otkriven
      return;
    }
    
    // Validate with Zod
    try {
      contactFormSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.errors[0].message;
        track("contact_form_validation_error", {
          source: "contact_section",
          result: "validation_error",
          error_code: "ZodError",
          error_message: msg,
        });
        toast({
          title: "Validation Error",
          description: msg,
          variant: "destructive",
        });
        return;
      }
    }

    setSending(true);
    setStatus({ phase: "sending", attempt: 1 });
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          organization: formData.organization.trim() || undefined,
          interest: formData.interest || undefined,
          message: formData.message.trim(),
          idempotencyKey,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const attempts = Number(data?.attempts ?? 1);
      const latency = Number(data?.latency_ms ?? 0);
      const deduped = !!data?.deduped;
      setStatus({ phase: "success", attempts, latency, deduped });
      track("contact_form_submit_success", {
        source: "contact_section",
        result: "success",
        has_organization: !!formData.organization.trim(),
        interest: formData.interest || "none",
        attempts,
        latency_ms: latency,
        deduped,
      });
      toast({
        title: deduped ? "Already sent" : "Message Sent!",
        description: deduped
          ? "We already received this message — no duplicate was sent."
          : `Delivered in ${attempts} attempt${attempts === 1 ? "" : "s"} (${latency} ms).`,
      });
      setFormData({ name: "", email: "", organization: "", interest: "", message: "" });
      // New idempotency key for the next submission
      setIdempotencyKey(
        typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      );
    } catch (error: any) {
      console.error("Contact form error:", error);
      const reason = error?.message || "Unknown error";
      setStatus({ phase: "error", reason });
      track("contact_form_submit_error", {
        source: "contact_section",
        result: "error",
        error_code: error?.name || "FetchError",
        error_message: reason,
      });
      toast({
        title: "Could not send your message",
        description: `Reason: ${reason}. Please try again in a few minutes, or email mulalic.davor@outlook.com directly.`,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
            >
              Contact
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Let's Work Together
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Interested in business consulting, AI strategy, speaking engagements, or executive advisory?
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 max-w-6xl mx-auto">
            {/* Contact Methods */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 space-y-4"
            >
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <a
                    key={index}
                    href={method.action}
                    target={method.action.startsWith("http") ? "_blank" : undefined}
                    rel={method.action.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.value}</p>
                    </div>
                  </a>
                );
              })}

              {/* Open for Mandates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="bg-accent/10 border border-accent/20 p-6 rounded-xl mt-6"
              >
                <h4 className="font-semibold text-foreground mb-2">Open for Mandates</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Available for CEO/COO/Chief AI positions from 2026. Let's discuss how I can contribute to your organization's growth.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full flex items-center gap-2"
                  onClick={() => setBookingOpen(true)}
                >
                  <Calendar className="w-4 h-4" />
                  Book a Consultation
                </Button>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="lg:col-span-3"
            >
              <form onSubmit={handleSubmit} className="bg-card p-6 lg:p-8 rounded-2xl border border-border">
                              {/* 🍯 Honeypot polje — skriveno od pravih korisnika, botovi ga popune */}
                              <div
                                aria-hidden="true"
                                style={{
                                  position: "absolute",
                                  width: "1px",
                                  height: "1px",
                                  overflow: "hidden",
                                  opacity: 0,
                                  pointerEvents: "none",
                                  tabIndex: -1,
                                }}
                              >
                                <label htmlFor="website">Website</label>
                                <input
                                  type="text"
                                  id="website"
                                  name="website"
                                  value={formData.website}
                                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                  autoComplete="off"
                                  tabIndex={-1}
                                />
                              </div>
                <h3 className="text-xl font-bold text-foreground mb-6">
                  Send a Message
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="Company or organization"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Area of Interest
                    </label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    >
                      <option value="">Select an option</option>
                      {interestOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                    placeholder="Tell me about your project or inquiry..."
                  />
                </div>
                {status.phase !== "idle" && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`mb-3 text-sm rounded-md px-3 py-2 border ${
                      status.phase === "success"
                        ? "bg-green-500/10 text-green-600 border-green-500/30"
                        : status.phase === "error"
                          ? "bg-red-500/10 text-red-600 border-red-500/30"
                          : "bg-primary/10 text-primary border-primary/30"
                    }`}
                  >
                    {status.phase === "sending" && "Sending… (retrying on transient errors)"}
                    {status.phase === "success" &&
                      (status.deduped
                        ? "Already delivered — duplicate suppressed."
                        : `Delivered in ${status.attempts} attempt${status.attempts === 1 ? "" : "s"} (${status.latency} ms).`)}
                    {status.phase === "error" && `Send failed: ${status.reason}`}
                  </div>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </section>
  );
}
