import { useState, type FormEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RateLimitCountdown } from "@/components/RateLimitCountdown";
import { callFunction, newIdempotencyKey } from "@/lib/api";
import { track } from "@/lib/analytics";
import { cvRequestSchema } from "@/lib/validation/schemas";

interface CVRequestDialogProps {
  children: ReactNode;
}

const EMPTY_FORM = { name: "", email: "" };

/**
 * Approval-gated CV request (Director decision P-3): the visitor leaves an
 * email; Davor approves in the admin panel; the visitor receives a personal
 * download link by email.
 */
export function CVRequestDialog({ children }: CVRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = cvRequestSchema.safeParse({ ...formData, idempotencyKey });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Please check your details.");
      return;
    }

    setSubmitting(true);
    const result = await callFunction<{ alreadyRequested: boolean }>("request-cv", parsed.data);
    setSubmitting(false);

    if (result.success) {
      track("dialog_cv_request_submit_success", { source: "cv_request_dialog", result: "success" });
      setSubmitted(true);
      return;
    }
    track("dialog_cv_request_submit_error", { source: "cv_request_dialog", result: "error", error_code: result.code });
    if (result.retryAfter) setRetryAfter(result.retryAfter);
    setError(result.error);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) track("dialog_cv_request_open", { source: "cv_request_dialog", result: "info" });
    setOpen(next);
    if (!next) {
      setSubmitted(false);
      setError(null);
      setFormData(EMPTY_FORM);
      setIdempotencyKey(newIdempotencyKey());
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-6"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" aria-hidden="true" />
              <DialogHeader>
                <DialogTitle className="text-center">Request received</DialogTitle>
                <DialogDescription className="text-center">
                  Davor reviews every request personally. Once it is approved, you will receive an email with your
                  personal download link.
                </DialogDescription>
              </DialogHeader>
              <Button variant="outline" className="mt-6" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" aria-hidden="true" />
                  Request the CV
                </DialogTitle>
                <DialogDescription>
                  Leave your email. After approval you will receive a personal download link.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-4">
                {retryAfter !== null && (
                  <RateLimitCountdown retryAfterSeconds={retryAfter} onComplete={() => setRetryAfter(null)} />
                )}
                <div className="space-y-2">
                  <Label htmlFor="cv-name">Your Name (optional)</Label>
                  <Input
                    id="cv-name"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cv-email">Your Email *</Label>
                  <Input
                    id="cv-email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={(event) => setFormData((previous) => ({ ...previous, email: event.target.value }))}
                    required
                    disabled={submitting}
                  />
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting || retryAfter !== null}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                        Send Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Your email is used only to send you the CV download link.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
