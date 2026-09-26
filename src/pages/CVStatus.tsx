import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, Download, Loader2, Mail, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { callFunction } from "@/lib/api";
import { track } from "@/lib/analytics";
import { cvStatusSchema } from "@/lib/validation/schemas";

type CvStatusData = { status: "pending" | "approved" | "rejected"; downloadUrl?: string };

type PageState =
  | { phase: "no-token" }
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "loaded"; data: CvStatusData };

/**
 * /cv-status?token=… — opened from the personal link in the approval email.
 * The token is the only credential; the page never looks requests up by email
 * (that let anyone probe whether an address had asked for the CV).
 */
export default function CVStatus() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<PageState>(() =>
    cvStatusSchema.safeParse({ token }).success ? { phase: "loading" } : { phase: "no-token" },
  );

  useEffect(() => {
    if (!cvStatusSchema.safeParse({ token }).success) {
      setState({ phase: "no-token" });
      return;
    }
    let cancelled = false;
    setState({ phase: "loading" });
    callFunction<CvStatusData>("check-cv-status", { token }).then((result) => {
      if (cancelled) return;
      if (result.success) {
        track("cv_status_check_success", { source: "cv_status_page", result: "success", status: result.data.status });
        setState({ phase: "loaded", data: result.data });
      } else {
        track("cv_status_check_error", { source: "cv_status_page", result: "error", error_code: result.code });
        setState({ phase: "error", message: result.error });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-block mb-6">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Homepage
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Your CV Request</h1>
        <Card className="p-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
            <StatusBody state={state} />
          </motion.div>
        </Card>
      </div>
    </main>
  );
}

function StatusBody({ state }: { state: PageState }) {
  switch (state.phase) {
    case "loading":
      return (
        <div role="status" className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" aria-hidden="true" />
          <p className="text-muted-foreground">Checking your request…</p>
        </div>
      );
    case "no-token":
      return (
        <>
          <Mail className="w-14 h-14 text-primary mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold mb-2">Please use the link from your email</h2>
          <p className="text-muted-foreground">
            When your CV request is approved you receive an email with a personal link to this page.
            Request the CV with the “Download CV” button on the homepage.
          </p>
        </>
      );
    case "error":
      return (
        <>
          <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold mb-2">We couldn't open this link</h2>
          <p className="text-muted-foreground mb-2">{state.message}</p>
          <p className="text-sm text-muted-foreground">
            Questions? <a className="text-primary underline" href={`mailto:${profile.email}`}>{profile.email}</a>
          </p>
        </>
      );
    case "loaded":
      if (state.data.status === "approved" && state.data.downloadUrl) {
        return (
          <>
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold mb-2">Your request is approved</h2>
            <p className="text-muted-foreground mb-6">
              Please use the CV only for the purpose of your request and do not redistribute it.
            </p>
            <Button size="lg" asChild>
              <a
                href={state.data.downloadUrl}
                onClick={() => track("cv_download_started", { source: "cv_status_page", result: "success" })}
              >
                <Download className="w-5 h-5 mr-2" aria-hidden="true" />
                Download CV (PDF)
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">For security the download button expires after a few minutes — reload this page for a fresh one.</p>
          </>
        );
      }
      if (state.data.status === "rejected") {
        return (
          <>
            <XCircle className="w-14 h-14 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold mb-2">Request not approved</h2>
            <p className="text-muted-foreground">
              Unfortunately your request could not be approved. You are welcome to write directly to{" "}
              <a className="text-primary underline" href={`mailto:${profile.email}`}>{profile.email}</a>.
            </p>
          </>
        );
      }
      return (
        <>
          <Clock className="w-14 h-14 text-amber-500 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold mb-2">Your request is being reviewed</h2>
          <p className="text-muted-foreground">You will receive an email as soon as it is approved.</p>
        </>
      );
  }
}
