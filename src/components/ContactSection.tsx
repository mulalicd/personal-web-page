import { motion, useInView } from "framer-motion";
import { useRef, useState, type FormEvent } from "react";
import { Mail, Linkedin, Phone, MapPin, Send, Loader2, Calendar, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultationDialog } from "@/components/ConsultationDialog";
import { RateLimitCountdown } from "@/components/RateLimitCountdown";
import { toast } from "@/hooks/use-toast";
import { callFunction, newIdempotencyKey } from "@/lib/api";
import { track } from "@/lib/analytics";
import { CONTACT_INTEREST_OPTIONS, contactFormSchema } from "@/lib/validation/schemas";
import { profile } from "@/content/profile";

interface ContactMethod {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
}

const contactMethods: ContactMethod[] = [
  { icon: Phone, label: "Phone", value: profile.phoneDisplay, href: profile.phoneHref },
  { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { icon: Linkedin, label: "LinkedIn Profile", value: "Connect on LinkedIn", href: profile.linkedinUrl },
  {
    icon: MapPin,
    label: "Location",
    value: profile.location,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location)}`,
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  organization: "",
  interest: "",
  message: "",
  website: "", // honeypot — always empty for real visitors
};

type FormStatus = { phase: "idle" } | { phase: "sent" } | { phase: "error"; message: string };

const inputClass =
  "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors";

/** Contact section: direct contact details, consultation booking and the contact form. */
export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<FormStatus>({ phase: "idle" });
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const update = (field: keyof typeof EMPTY_FORM) => (value: string) =>
    setFormData((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    // Honeypot: bots fill hidden fields — drop silently so they learn nothing.
    if (formData.website) return;

    const parsed = contactFormSchema.safeParse({
      name: formData.name,
      email: formData.email,
      organization: formData.organization || undefined,
      interest: formData.interest || undefined,
      message: formData.message,
      idempotencyKey,
    });
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? "Please check your details.";
      track("contact_form_validation_error", { source: "contact_section", result: "validation_error" });
      setStatus({ phase: "error", message });
      return;
    }

    setSending(true);
    setStatus({ phase: "idle" });
    const result = await callFunction<{ delivered: true }>("send-contact-email", parsed.data);
    setSending(false);

    if (result.success) {
      track("contact_form_submit_success", { source: "contact_section", result: "success" });
      setStatus({ phase: "sent" });
      toast({ title: "Message sent", description: "Thank you — Davor will get back to you personally." });
      setFormData(EMPTY_FORM);
      setIdempotencyKey(newIdempotencyKey());
      return;
    }

    track("contact_form_submit_error", { source: "contact_section", result: "error", error_code: result.code });
    if (result.retryAfter) setRetryAfter(result.retryAfter);
    setStatus({ phase: "error", message: result.error });
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
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Contact
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Let's Work Together</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Interested in business consulting, AI strategy, speaking engagements, or executive advisory?
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 max-w-6xl xl:max-w-none mx-auto">
            <div className="lg:col-span-2 space-y-4">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                const external = method.href.startsWith("http");
                return (
                  <a
                    key={method.label}
                    href={method.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.value}</p>
                    </div>
                  </a>
                );
              })}

              <div className="bg-accent/10 border border-accent/20 p-6 rounded-xl mt-6">
                <h3 className="font-semibold text-foreground mb-2">Open for Mandates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {profile.availability}. Let's discuss how I can contribute to your organization's growth.
                </p>
                <ConsultationDialog
                  source="contact_section"
                  trigger={
                    <Button variant="default" size="sm" className="w-full flex items-center gap-2">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      Book a Consultation
                    </Button>
                  }
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} noValidate className="relative bg-card p-6 lg:p-8 rounded-2xl border border-border">
                {/* Honeypot — invisible to people and assistive tech, filled only by bots */}
                <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    type="text"
                    id="contact-website"
                    name="website"
                    value={formData.website}
                    onChange={(event) => update("website")(event.target.value)}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-6">Send a Message</h3>

                {retryAfter !== null && (
                  <div className="mb-4">
                    <RateLimitCountdown retryAfterSeconds={retryAfter} onComplete={() => setRetryAfter(null)} />
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-2">Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={(event) => update("name")(event.target.value)}
                      className={inputClass}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={(event) => update("email")(event.target.value)}
                      className={inputClass}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="contact-organization" className="block text-sm font-medium text-foreground mb-2">Organization</label>
                    <input
                      id="contact-organization"
                      type="text"
                      autoComplete="organization"
                      value={formData.organization}
                      onChange={(event) => update("organization")(event.target.value)}
                      className={inputClass}
                      placeholder="Company or organization"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-interest" className="block text-sm font-medium text-foreground mb-2">Area of Interest</label>
                    <select
                      id="contact-interest"
                      value={formData.interest}
                      onChange={(event) => update("interest")(event.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select an option</option>
                      {CONTACT_INTEREST_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-2">Message *</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(event) => update("message")(event.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell me about your project or inquiry..."
                  />
                </div>

                {status.phase !== "idle" && (
                  <div
                    role={status.phase === "error" ? "alert" : "status"}
                    className={`mb-3 text-sm rounded-md px-3 py-2 border ${
                      status.phase === "sent"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                        : "bg-destructive/10 text-destructive border-destructive/30"
                    }`}
                  >
                    {status.phase === "sent"
                      ? "Thank you — your message has been sent. Davor will reply personally."
                      : status.message}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={sending || retryAfter !== null}>
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
