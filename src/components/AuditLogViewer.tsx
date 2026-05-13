import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, RefreshCw, Filter, Search, ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuditEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_table: string;
  target_id: string | null;
  old_value: any;
  new_value: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const TIME_RANGES = [
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "All time", value: "all" },
];

function rangeToDate(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

function isFailureAction(action: string): boolean {
  return /failed|error/i.test(action);
}

function actionBadge(action: string) {
  if (isFailureAction(action)) {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
        <AlertTriangle className="w-3 h-3 mr-1" /> {action}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
      <CheckCircle className="w-3 h-3 mr-1" /> {action}
    </Badge>
  );
}

export function AuditLogViewer() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchEntries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      const fromDate = rangeToDate(timeRange);
      if (fromDate) {
        query = query.gte("created_at", fromDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setEntries((data as AuditEntry[]) || []);
    } catch (err: any) {
      console.error("Audit log fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load audit log",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const actionTypes = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => set.add(e.action));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (q) {
        const hay = [
          e.action,
          e.target_table,
          e.target_id ?? "",
          e.admin_user_id,
          JSON.stringify(e.old_value ?? ""),
          JSON.stringify(e.new_value ?? ""),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, actionFilter, search]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-primary" />
          Audit Log ({filtered.length})
        </h2>
        <Button variant="outline" size="sm" onClick={fetchEntries} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Filter className="w-3 h-3" /> Action type
            </Label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {actionTypes.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Filter className="w-3 h-3" /> Time range
            </Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Search className="w-3 h-3" /> Search
            </Label>
            <Input
              placeholder="Email, ID, table, value…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading audit log…</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No audit entries match your filters</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => {
            const isOpen = expanded.has(e.id);
            const failure = isFailureAction(e.action);
            const errorMsg =
              (failure && (e.new_value?.error as string | undefined)) || null;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(e.id)}
                    className="w-full text-left p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-muted-foreground">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {actionBadge(e.action)}
                          <Badge variant="outline" className="text-xs">
                            {e.target_table}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(e.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          admin: {e.admin_user_id}
                          {e.target_id ? ` · target: ${e.target_id}` : ""}
                        </p>
                        {errorMsg && (
                          <p className="text-xs text-red-600 mt-1 truncate">
                            ⚠ {errorMsg}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t bg-muted/20 p-4 space-y-3">
                      <DetailRow label="Admin user ID" value={e.admin_user_id} mono />
                      {e.target_id && (
                        <DetailRow label="Target ID" value={e.target_id} mono />
                      )}
                      {e.user_agent && (
                        <DetailRow label="User agent" value={e.user_agent} />
                      )}
                      {e.ip_address && (
                        <DetailRow label="IP address" value={e.ip_address} mono />
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <JsonBlock title="Old value" value={e.old_value} />
                        <JsonBlock
                          title={failure ? "Result / Error" : "New value"}
                          value={e.new_value}
                          tone={failure ? "error" : "default"}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
      <span className="text-xs font-medium text-muted-foreground sm:w-32 shrink-0">
        {label}:
      </span>
      <span className={`text-xs ${mono ? "font-mono" : ""} break-all`}>{value}</span>
    </div>
  );
}

function JsonBlock({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: any;
  tone?: "default" | "error";
}) {
  const isError = tone === "error";
  return (
    <div>
      <p className={`text-xs font-medium mb-1 ${isError ? "text-red-600" : "text-muted-foreground"}`}>
        {title}
      </p>
      <pre
        className={`text-xs p-3 rounded-md border overflow-auto max-h-64 ${
          isError ? "bg-red-500/5 border-red-500/30" : "bg-background"
        }`}
      >
        {value === null || value === undefined
          ? "—"
          : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
