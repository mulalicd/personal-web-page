import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  RefreshCw,
  Filter,
  Search,
  Trash2,
  Download,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getStoredEvents,
  clearStoredEvents,
  type StoredAnalyticsEvent,
} from "@/lib/analytics";

const TIME_RANGES = [
  { label: "Last hour", value: "1h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "All time", value: "all" },
];

function rangeToDate(range: string): Date | null {
  const now = Date.now();
  switch (range) {
    case "1h":
      return new Date(now - 60 * 60 * 1000);
    case "24h":
      return new Date(now - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

function resultBadge(result?: string) {
  if (!result) {
    return (
      <Badge variant="outline" className="bg-muted/40">
        <Info className="w-3 h-3 mr-1" /> info
      </Badge>
    );
  }
  if (result === "success") {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
        <CheckCircle className="w-3 h-3 mr-1" /> success
      </Badge>
    );
  }
  if (result === "error" || result === "validation_error") {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
        <AlertTriangle className="w-3 h-3 mr-1" /> {result}
      </Badge>
    );
  }
  if (result === "rate_limited") {
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
        <AlertTriangle className="w-3 h-3 mr-1" /> rate_limited
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-muted/40">
      {result}
    </Badge>
  );
}

export function AnalyticsViewer() {
  const [events, setEvents] = useState<StoredAnalyticsEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const refresh = () => setEvents(getStoredEvents());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("lovable:analytics", handler);
    return () => window.removeEventListener("lovable:analytics", handler);
  }, []);

  const eventTypes = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.event));
    return Array.from(set).sort();
  }, [events]);

  const routes = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.route || "/"));
    return Array.from(set).sort();
  }, [events]);

  const filtered = useMemo(() => {
    const fromDate = rangeToDate(timeRange);
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => {
        if (fromDate && new Date(e.timestamp) < fromDate) return false;
        if (eventFilter !== "all" && e.event !== eventFilter) return false;
        if (routeFilter !== "all" && (e.route || "/") !== routeFilter) return false;
        if (statusFilter !== "all") {
          const r = e.result ?? "info";
          if (r !== statusFilter) return false;
        }
        if (q) {
          const hay = JSON.stringify(e).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .reverse(); // newest first
  }, [events, eventFilter, routeFilter, statusFilter, timeRange, search]);

  const stats = useMemo(() => {
    let success = 0;
    let error = 0;
    let rate = 0;
    let other = 0;
    filtered.forEach((e) => {
      switch (e.result) {
        case "success":
          success++;
          break;
        case "error":
        case "validation_error":
          error++;
          break;
        case "rate_limited":
          rate++;
          break;
        default:
          other++;
      }
    });
    return { total: filtered.length, success, error, rate, other };
  }, [filtered]);

  const toggle = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Analytics Events ({stats.total})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportJson} disabled={!filtered.length}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!events.length}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all stored analytics?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes the local browser buffer of analytics events. This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearStoredEvents();
                    refresh();
                  }}
                >
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Success" value={stats.success} tone="success" />
        <StatCard label="Errors" value={stats.error} tone="error" />
        <StatCard label="Rate-limited" value={stats.rate} tone="warn" />
        <StatCard label="Info / other" value={stats.other} />
      </div>

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Filter className="w-3 h-3" /> Event
            </Label>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                {eventTypes.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Filter className="w-3 h-3" /> Route
            </Label>
            <Select value={routeFilter} onValueChange={setRouteFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All routes</SelectItem>
                {routes.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">success</SelectItem>
                <SelectItem value="error">error</SelectItem>
                <SelectItem value="validation_error">validation_error</SelectItem>
                <SelectItem value="rate_limited">rate_limited</SelectItem>
                <SelectItem value="info">info / other</SelectItem>
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
              placeholder="Source, error, value…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No events match these filters. Browse the site to generate events.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((e, i) => {
            const isOpen = expanded.has(i);
            return (
              <motion.div
                key={`${e.timestamp}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
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
                          <Badge variant="outline" className="font-mono text-xs">
                            {e.event}
                          </Badge>
                          {resultBadge(e.result as string | undefined)}
                          <Badge variant="outline" className="text-xs">
                            {e.route || "/"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(e.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {e.source ? `source: ${e.source}` : null}
                          {e.last_section ? ` · section: ${e.last_section}` : null}
                          {e.error_code ? ` · code: ${e.error_code}` : null}
                        </p>
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t bg-muted/20 p-4">
                      <pre className="text-xs p-3 rounded-md border bg-background overflow-auto max-h-80">
                        {JSON.stringify(e, null, 2)}
                      </pre>
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

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "error" | "warn";
}) {
  const toneClass =
    tone === "success"
      ? "text-green-600"
      : tone === "error"
        ? "text-red-600"
        : tone === "warn"
          ? "text-yellow-600"
          : "text-foreground";
  return (
    <Card className="p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
    </Card>
  );
}
