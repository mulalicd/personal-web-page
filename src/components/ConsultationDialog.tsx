import { useState, type FormEvent, type ReactNode } from "react";
import { CalendarCheck, ExternalLink, Loader2, Video } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RateLimitCountdown } from "@/components/RateLimitCountdown";
import { BOOKING_CALENDAR_URL } from "@/constants";
import { callFunction } from "@/lib/api";
import { track } from "@/lib/analytics";
import { consultationRequestSchema } from "@/lib/validation/schemas";

interface ConsultationDialogProps {
  trigger: ReactNode;
  /** Where the dialog was opened from (analytics only). */
  source: string;
}

const EMPTY_FORM = { name: "", email: "", message: "" };

/**
 * The single consultation-booking flow of the site: the visitor leaves name +
 * email (so the request is on record), then opens the Zoho calendar with a
 * direct click — a real user gesture, so browsers never block it as a pop-up.
 */
export function ConsultationDialog({ trigger, source }: ConsultationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = consultationRequestSchema.safeParse({
      ...formData,
      message: formData.message || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Please check your details.");
      return;
    }

    setLoading(true);
    const result = await callFunction<{ received: true }>("submit-consultation", parsed.data);
    setLoading(false);

    if (result.success) {
      track("dialog_consultation_submit_success", { source, result: "success" });
      setSubmitted(true);
      return;
    }
    track("dialog_consultation_submit_error", { source, result: "error", error_code: result.code });
    if (result.retryAfter) setRetryAfter(result.retryAfter);
    setError(result.error);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) track("dialog_consultation_open", { source, result: "info" });
    setOpen(next);
    if (!next) {
      setSubmitted(false);
      setError(null);
      setFormData(EMPTY_FORM);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="text-center py-4">
            <CalendarCheck className="w-14 h-14 text-accent mx-auto mb-4" aria-hidden="true" />
            <DialogHeader className="sm:text-center">
              <DialogTitle className="text-center">Thank you — one last step</DialogTitle>
              <DialogDescription className="text-center">
                Your request is on record. Pick a time that suits you in the booking calendar.
              </DialogDescription>
            </DialogHeader>
            <Button asChild className="w-full mt-6">
              <a
                href={BOOKING_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("cta_book_consultation_click", { source, result: "success" })}
              >
                <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
                Choose a time
              </a>
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" aria-hidden="true" />
                Book a Consultation
              </DialogTitle>
              <DialogDescription>
                Leave your details, then choose a time in the booking calendar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {retryAfter !== null && (
                <RateLimitCountdown retryAfterSeconds={retryAfter} onComplete={() => setRetryAfter(null)} />
              )}
              <div className="space-y-2">
                <Label htmlFor="consultation-name">Name *</Label>
                <Input
                  id="consultation-name"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultation-email">Email *</Label>
                <Input
                  id="consultation-email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(event) => setFormData((previous) => ({ ...previous, email: event.target.value }))}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultation-message">Message (optional)</Label>
                <Textarea
                  id="consultation-message"
                  placeholder="Brief description of what you'd like to discuss..."
                  value={formData.message}
                  onChange={(event) => setFormData((previous) => ({ ...previous, message: event.target.value }))}
                  disabled={loading}
                  rows={3}
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading || retryAfter !== null}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  "Continue to Booking"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
