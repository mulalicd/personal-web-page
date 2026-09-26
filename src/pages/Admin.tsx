import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, RefreshCw, Shield, Mail, User, Calendar, Video, MessageSquare, LogOut, Loader2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CVRequestsViewer } from "@/components/CVRequestsViewer";
import { callFunction } from "@/lib/api";
import type { Json } from "@/integrations/supabase/types";

// Heavy viewers (charts / large tables) — only fetched when their tab is opened.
const AuditLogViewer = lazy(() =>
  import("@/components/AuditLogViewer").then((m) => ({ default: m.AuditLogViewer })),
);
const EmailMetricsViewer = lazy(() =>
  import("@/components/EmailMetricsViewer").then((m) => ({ default: m.EmailMetricsViewer })),
);

const TabFallback = () => (
  <Card className="p-12 flex items-center justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </Card>
);

interface CVRequest {
  id: string;
  email: string;
  name: string | null;
  status: string;
  created_at: string;
  processed_at: string | null;
}

interface ConsultationRequest {
  id: string;
  name: string;
  email: string;
  message: string | null;
  status: string;
  created_at: string;
  confirmed_at: string | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [cvRequests, setCvRequests] = useState<CVRequest[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchRequests = useCallback(async () => {
    if (!isAdmin || !supabase) return;

    setLoading(true);
    try {
      const [cvResult, consultResult] = await Promise.all([
        supabase.from("cv_requests").select("id, email, name, status, created_at, processed_at").order("created_at", { ascending: false }),
        supabase.from("consultation_requests").select("*").order("created_at", { ascending: false }),
      ]);

      if (cvResult.error) throw cvResult.error;
      if (consultResult.error) throw consultResult.error;

      setCvRequests(cvResult.data ?? []);
      setConsultations(consultResult.data ?? []);
    } catch (error) {
      console.error("[admin] fetching requests failed:", error);
      toast({
        title: "Could not load requests",
        description: "Please refresh in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const logAudit = async (
    action: string,
    target_table: string,
    target_id: string | null,
    old_value: Json,
    new_value: Json
  ) => {
    if (!user || !supabase) return;
    try {
      const { error } = await supabase.from("admin_audit_log").insert({
        admin_user_id: user.id,
        action,
        target_table,
        target_id,
        old_value,
        new_value,
        user_agent: navigator.userAgent,
      });
      if (error) console.error("[admin] audit log write failed:", error.message);
    } catch (err) {
      console.error("Failed to write audit log:", err);
    }
  };

  /** Approve/reject a CV request server-side (status + audit + email to the requester). */
  const handleCVAction = async (requestId: string, action: "approve" | "reject") => {
    setProcessing(requestId);
    const result = await callFunction<{ status: string; emailSent: boolean }>(
      "process-cv-request",
      { requestId, action },
      { authenticated: true },
    );
    setProcessing(null);

    if (!result.success) {
      toast({ title: "Action failed", description: result.error, variant: "destructive" });
      void fetchRequests();
      return;
    }

    const verb = action === "approve" ? "approved" : "rejected";
    toast(
      result.data.emailSent
        ? { title: `Request ${verb}`, description: "The requester has been notified by email." }
        : {
            title: `Request ${verb} — email NOT sent`,
            description: "Check the Email Metrics tab and the email settings, then contact the requester manually.",
            variant: "destructive",
          },
    );
    void fetchRequests();
  };

  const handleConsultationAction = async (id: string, action: "confirm" | "complete") => {
    if (!supabase) return;
    setProcessing(id);
    try {
      const prev = consultations.find(c => c.id === id);
      const updateData = action === "confirm"
        ? { status: "confirmed", confirmed_at: new Date().toISOString() }
        : { status: "completed" };

      const { error } = await supabase
        .from("consultation_requests")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      await logAudit(
        action === "confirm" ? "consultation.confirmed" : "consultation.completed",
        "consultation_requests",
        id,
        { status: prev?.status },
        updateData
      );

      toast({
        title: action === "confirm" ? "Confirmed!" : "Completed!",
        description: `Consultation has been marked as ${action === "confirm" ? "confirmed" : "completed"}.`,
      });

      void fetchRequests();
    } catch (error) {
      console.error("Error processing consultation:", error);
      await logAudit(
        "consultation.action_failed",
        "consultation_requests",
        id,
        { action },
        { error: error instanceof Error ? error.message : String(error) }
      );
      toast({
        title: "Error",
        description: "Failed to process consultation",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getConsultationStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30"><Video className="w-3 h-3 mr-1" /> Confirmed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCVRequests = cvRequests.filter(r => r.status === "pending");
  const pendingConsultations = consultations.filter(r => r.status === "pending");
  const activeConsultations = consultations.filter(r => r.status === "confirmed");
  const completedConsultations = consultations.filter(r => r.status === "completed");

  // Loading state
  if (authLoading || (!isAdmin && user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in - will redirect via useEffect
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin Panel
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => void fetchRequests()} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={() => void signOut()} aria-label="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">Manage CV requests and consultations</p>
        </motion.div>

        <Tabs defaultValue="cv" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="cv" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              CV Requests ({pendingCVRequests.length})
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Consultations ({pendingConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Metrics
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <ScrollText className="w-4 h-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* CV Requests Tab */}
          <TabsContent value="cv">
            <CVRequestsViewer
              requests={cvRequests}
              loading={loading}
              processing={processing}
              onAction={handleCVAction}
            />
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            {/* Pending Consultations */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Pending Consultations ({pendingConsultations.length})
              </h2>
              
              {loading ? (
                <Card className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Loading...</p>
                </Card>
              ) : pendingConsultations.length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                  <p className="text-muted-foreground">No pending consultations</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {pendingConsultations.map((consultation) => (
                      <motion.div
                        key={consultation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        layout
                      >
                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getConsultationStatusBadge(consultation.status)}
                              </div>
                              <div className="space-y-1">
                                <p className="flex items-center gap-2 text-foreground">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{consultation.name}</span>
                                </p>
                                <p className="flex items-center gap-2 text-foreground">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  {consultation.email}
                                </p>
                                {consultation.message && (
                                  <p className="flex items-start gap-2 text-muted-foreground">
                                    <MessageSquare className="w-4 h-4 mt-0.5" />
                                    <span className="text-sm">{consultation.message}</span>
                                  </p>
                                )}
                                <p className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(consultation.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleConsultationAction(consultation.id, "confirm")}
                                disabled={processing === consultation.id}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Confirm
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>

            {/* Active Consultations */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                Confirmed ({activeConsultations.length})
              </h2>
              
              {activeConsultations.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No confirmed consultations</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeConsultations.map((consultation) => (
                    <Card key={consultation.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getConsultationStatusBadge(consultation.status)}
                          </div>
                          <div className="space-y-1">
                            <p className="flex items-center gap-2 text-foreground">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{consultation.name}</span>
                            </p>
                            <p className="flex items-center gap-2 text-foreground">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              {consultation.email}
                            </p>
                            <p className="flex items-center gap-2 text-muted-foreground text-sm">
                              <Calendar className="w-4 h-4" />
                              Confirmed: {consultation.confirmed_at && new Date(consultation.confirmed_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleConsultationAction(consultation.id, "complete")}
                            disabled={processing === consultation.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Completed Consultations */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                Completed ({completedConsultations.length})
              </h2>
              
              {completedConsultations.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No completed consultations yet</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {completedConsultations.map((consultation) => (
                    <Card key={consultation.id} className="p-4 opacity-75">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getConsultationStatusBadge(consultation.status)}
                          </div>
                          <p className="text-foreground">{consultation.name}</p>
                          <p className="text-sm text-muted-foreground">{consultation.email}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          {/* Email Metrics Tab */}
          <TabsContent value="emails">
            <Suspense fallback={<TabFallback />}>
              <EmailMetricsViewer />
            </Suspense>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Suspense fallback={<TabFallback />}>
              <AuditLogViewer />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
