import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Video, Loader2 } from "lucide-react";
import { consultationRequestSchema } from "@/lib/validation";
import { z } from "zod";
import { RateLimitCountdown } from "@/components/RateLimitCountdown";
import { track } from "@/lib/analytics";

interface ConsultationDialogProps {
  trigger: React.ReactNode;
}

export function ConsultationDialog({ trigger }: ConsultationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<{ retryAfter: number; endpoint: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      consultationRequestSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.errors[0].message;
        track("dialog_consultation_submit_error", {
          source: "consultation_dialog",
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

    setLoading(true);
    setRateLimit(null);
    try {
      const sanitizedData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        message: formData.message.trim() || null,
      };

      const { data, error } = await supabase.functions.invoke("submit-consultation", {
        body: sanitizedData,
      });

      // Detect 429 from edge function
      const ctx: any = (error as any)?.context;
      if (ctx && typeof ctx.json === "function") {
        try {
          const errBody = await ctx.json();
          if (errBody?.retry_after) {
            setRateLimit({
              retryAfter: Number(errBody.retry_after),
              endpoint: errBody.endpoint || "consultation_request",
            });
            track("dialog_consultation_rate_limited", {
              source: "consultation_dialog",
              result: "rate_limited",
              error_code: "rate_limited",
              retry_after: Number(errBody.retry_after),
              endpoint: errBody.endpoint || "consultation_request",
            });
            setLoading(false);
            return;
          }
          if (errBody?.error) throw new Error(errBody.error);
        } catch {
          // fall through
        }
      }

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.retry_after) {
        setRateLimit({
          retryAfter: Number(data.retry_after),
          endpoint: data.endpoint || "consultation_request",
        });
        track("dialog_consultation_rate_limited", {
          source: "consultation_dialog",
          result: "rate_limited",
          error_code: "rate_limited",
          retry_after: Number(data.retry_after),
          endpoint: data.endpoint || "consultation_request",
        });
        setLoading(false);
        return;
      }

      track("dialog_consultation_submit_success", {
        source: "consultation_dialog",
        result: "success",
        has_message: !!sanitizedData.message,
      });
      toast({
        title: "Request submitted!",
        description: "Redirecting to booking page...",
      });

      setTimeout(() => {
        window.open("https://davormulali.zohobookings.eu/#/253150000000046052", "_blank");
        setOpen(false);
        setFormData({ name: "", email: "", message: "" });
      }, 1000);
    } catch (error: any) {
      track("dialog_consultation_submit_error", {
        source: "consultation_dialog",
        result: "error",
        error_code: error?.name || "FetchError",
        error_message: error?.message || "unknown",
      });
      toast({
        title: "Error",
        description: error?.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      track("dialog_consultation_open", { source: "consultation_dialog", result: "info" });
    }
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setRateLimit(null);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Book a Consultation
          </DialogTitle>
          <DialogDescription>
            Enter your details before booking. You'll be redirected to the scheduling page.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {rateLimit && (
            <RateLimitCountdown
              retryAfterSeconds={rateLimit.retryAfter}
              endpoint={rateLimit.endpoint}
              onComplete={() => setRateLimit(null)}
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Brief description of what you'd like to discuss..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !!rateLimit}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Continue to Booking"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
