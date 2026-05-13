import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, Clock, Download, ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { emailSchema } from "@/lib/validation";
import { z } from "zod";
import { track } from "@/lib/analytics";

export default function CVStatus() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState<{
    found: boolean;
    status?: string;
    name?: string | null;
    created_at?: string;
  } | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.errors[0].message;
        track("cv_status_validation_error", {
          source: "cv_status_page",
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
    setStatus(null);

    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.functions.invoke("check-cv-status", {
        body: { email: sanitizedEmail },
      });

      if (error) {
        throw new Error(error.message || "Failed to check status");
      }

      if (data && data.found) {
        setStatus({ found: true, ...data });
        track("cv_status_check_success", {
          source: "cv_status_page",
          result: "success",
          status: data.status || "unknown",
        });
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        setStatus({ found: false });
        track("cv_status_check_not_found", {
          source: "cv_status_page",
          result: "error",
          error_code: "not_found",
        });
      }
    } catch (error: any) {
      const msg = error?.message || "unknown";
      track("cv_status_check_error", {
        source: "cv_status_page",
        result: "error",
        error_code: error?.name || "FetchError",
        error_message: msg,
      });
      toast({
        title: "Error",
        description: "Failed to check status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDownloadConfirm = () => {
    track("cv_download_confirm_open", { source: "cv_status_page", result: "info" });
    setConfirmOpen(true);
  };

  const handleConfirmDownload = () => {
    track("cv_download_confirmed", { source: "cv_status_page", result: "success" });
    track("cv_file_download", { source: "cv_status_page", result: "success" });

    // Trigger download
    const link = document.createElement("a");
    link.href = "/Davor_Mulalic_CV.pdf";
    link.download = "Davor_Mulalic_CV.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Mark download as actually started (post-click) for funnel precision
    track("cv_download_started", {
      source: "cv_status_page",
      result: "success",
      file: "Davor_Mulalic_CV.pdf",
    });

    toast({
      title: "Download started",
      description: "Your CV is downloading. Check your browser's downloads folder.",
    });

    setConfirmOpen(false);
  };

  const handleCancelDownload = () => {
    track("cv_download_cancelled", { source: "cv_status_page", result: "info" });
    setConfirmOpen(false);
  };

  const getStatusDisplay = () => {
    if (!status) return null;

    if (!status.found) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6"
        >
          <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Request Found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any CV request with this email address.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
        </motion.div>
      );
    }

    switch (status.status) {
      case "pending":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6"
          >
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Request Pending</h3>
            <p className="text-muted-foreground mb-4">
              Your request is still being reviewed. Please check back later.
            </p>
            <p className="text-sm text-muted-foreground">
              Submitted: {new Date(status.created_at!).toLocaleString()}
            </p>
          </motion.div>
        );

      case "approved":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-green-600">Request Approved!</h3>
            <p className="text-muted-foreground mb-6">
              Your request has been approved. You can now download the CV.
            </p>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={openDownloadConfirm}
            >
              <Download className="w-5 h-5 mr-2" />
              Download CV
            </Button>
          </motion.div>
        );

      case "rejected":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6"
          >
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-red-600">Request Declined</h3>
            <p className="text-muted-foreground mb-4">
              Unfortunately, your request was not approved at this time.
            </p>
            <p className="text-sm text-muted-foreground">
              If you believe this was a mistake, please contact directly via email.
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block mb-6">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Check CV Request Status</h1>
          <p className="text-muted-foreground">
            Enter your email to check if your CV download request was approved.
          </p>
        </motion.div>

        <Card className="p-6">
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Check Status
                </>
              )}
            </Button>
          </form>

          <AnimatePresence mode="wait">
            {status && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t"
              >
                {getStatusDisplay()}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(o) => (o ? setConfirmOpen(true) : handleCancelDownload())}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download CV?</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to download the latest CV (PDF). Please use it for the purpose stated in
              your request and do not redistribute without permission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDownload}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDownload}>
              <Download className="w-4 h-4 mr-2" />
              Confirm Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
