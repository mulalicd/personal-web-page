import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cvRequestSchema } from "@/lib/validation";
import { z } from "zod";
import { RateLimitCountdown } from "@/components/RateLimitCountdown";
import { track } from "@/lib/analytics";

interface CVRequestDialogProps {
  children: React.ReactNode;
}

type SendStatus =
  | { phase: "idle" }
  | { phase: "sending" }
  | { phase: "success"; deduped: boolean }
  | { phase: "error"; reason: string };

export function CVRequestDialog({ children }: CVRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rateLimit, setRateLimit] = useState<{ retryAfter: number; endpoint: string } | null>(null);
  const [status, setStatus] = useState<SendStatus>({ phase: "idle" });
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    try {
      cvRequestSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.errors[0].message;
        track("dialog_cv_request_submit_error", {
          source: "cv_request_dialog",
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

    setIsSubmitting(true);
    setRateLimit(null);
    setStatus({ phase: "sending" });

    try {
      const sanitizedData = {
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim() || null,
        idempotencyKey,
      };

      const { data, error } = await supabase.functions.invoke("request-cv", {
        body: sanitizedData,
      });

      // Detect rate limit (429) — invoke surfaces it via FunctionsHttpError with context
      const ctx: any = (error as any)?.context;
      if (ctx && typeof ctx.json === "function") {
        try {
          const errBody = await ctx.json();
          if (errBody?.retry_after) {
            setRateLimit({
              retryAfter: Number(errBody.retry_after),
              endpoint: errBody.endpoint || "cv_request",
            });
            setStatus({ phase: "idle" });
            track("dialog_cv_request_rate_limited", {
              source: "cv_request_dialog",
              result: "rate_limited",
              error_code: "rate_limited",
              retry_after: Number(errBody.retry_after),
              endpoint: errBody.endpoint || "cv_request",
            });
            setIsSubmitting(false);
            return;
          }
          if (errBody?.error) throw new Error(errBody.error);
        } catch (parseErr) {
          // fall through
        }
      }

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.retry_after) {
        setRateLimit({
          retryAfter: Number(data.retry_after),
          endpoint: data.endpoint || "cv_request",
        });
        setStatus({ phase: "idle" });
        track("dialog_cv_request_rate_limited", {
          source: "cv_request_dialog",
          result: "rate_limited",
          error_code: "rate_limited",
          retry_after: Number(data.retry_after),
          endpoint: data.endpoint || "cv_request",
        });
        setIsSubmitting(false);
        return;
      }

      const deduped = !!data?.alreadyExists;
      setIsSuccess(true);
      setStatus({ phase: "success", deduped });
      track("dialog_cv_request_submit_success", {
        source: "cv_request_dialog",
        result: "success",
        has_name: !!sanitizedData.name,
        deduped,
      });
      toast({
        title: deduped ? "Already submitted" : "Request Submitted!",
        description: deduped
          ? "Your previous request is on file — no duplicate was created."
          : "You will receive an email once your request is reviewed.",
      });
    } catch (error: any) {
      console.error("CV request error:", error);
      const reason = error?.message || "Unknown error";
      setStatus({ phase: "error", reason });
      track("dialog_cv_request_submit_error", {
        source: "cv_request_dialog",
        result: "error",
        error_code: error?.name || "FetchError",
        error_message: reason,
      });
      toast({
        title: "Could not submit your request",
        description: `Reason: ${reason}. Please try again in a few minutes, or contact mulalic.davor@outlook.com directly.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      track("dialog_cv_request_open", { source: "cv_request_dialog", result: "info" });
    }
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      setTimeout(() => {
        setIsSuccess(false);
        setRateLimit(null);
        setStatus({ phase: "idle" });
        setIdempotencyKey(
          typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        );
        setFormData({ name: "", email: "" });
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
              <p className="text-muted-foreground mb-4">
                Your request has been sent to Davor for approval.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Check your request status at <a href="/cv-status" className="text-primary underline">/cv-status</a>
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>Close</Button>
                <a href="/cv-status">
                  <Button>Check Status</Button>
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Request CV Access
                </DialogTitle>
                <DialogDescription>
                  To download Davor's CV, please submit a request. You will receive an email once approved.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {rateLimit && (
                  <RateLimitCountdown
                    retryAfterSeconds={rateLimit.retryAfter}
                    endpoint={rateLimit.endpoint}
                    onComplete={() => setRateLimit(null)}
                  />
                )}
                {status.phase !== "idle" && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`text-xs rounded-md px-2.5 py-1.5 border ${
                      status.phase === "success"
                        ? "bg-green-500/10 text-green-600 border-green-500/30"
                        : status.phase === "error"
                          ? "bg-red-500/10 text-red-600 border-red-500/30"
                          : "bg-primary/10 text-primary border-primary/30"
                    }`}
                  >
                    {status.phase === "sending" && "Submitting your request… (auto-retry on transient errors)"}
                    {status.phase === "success" && (status.deduped ? "Already on file — duplicate suppressed." : "Request received.")}
                    {status.phase === "error" && `Failed: ${status.reason}`}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name (Optional)</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Your Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !!rateLimit}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Your email will only be used to send you the CV download link.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
