import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  User,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CVRequest {
  id: string;
  token: string;
  email: string;
  name: string | null;
  status: string;
  created_at: string;
  processed_at: string | null;
}

const TIME_RANGES = [
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "All time", value: "all" },
];

function rangeToDate(range: string): Date | null {
  const now = Date.now();
  switch (range) {
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

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
        >
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-600 border-green-500/30"
        >
          <CheckCircle className="w-3 h-3 mr-1" /> Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-600 border-red-500/30"
        >
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface Props {
  requests: CVRequest[];
  loading: boolean;
  processing: string | null;
  onAction: (token: string, action: "approve" | "reject") => void;
}

export function CVRequestsViewer({ requests, loading, processing, onAction }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const fromDate = rangeToDate(timeRange);
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (fromDate && new Date(r.created_at) < fromDate) return false;
      if (q) {
        const hay = [r.email, r.name ?? "", r.status].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, statusFilter, timeRange, search]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    filtered.forEach((r) => {
      if (r.status in c) (c as any)[r.status]++;
    });
    return c;
  }, [filtered]);

  return (
    <section className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
              placeholder="Email or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
          <span>Showing {filtered.length}</span>
          <span>· {counts.pending} pending</span>
          <span>· {counts.approved} approved</span>
          <span>· {counts.rejected} rejected</span>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading…</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No CV requests match your filters</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                layout
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {statusBadge(request.status)}
                      </div>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-foreground">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{request.email}</span>
                        </p>
                        {request.name && (
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-4 h-4" />
                            {request.name}
                          </p>
                        )}
                        <p className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" />
                          Submitted: {new Date(request.created_at).toLocaleString()}
                        </p>
                        {request.processed_at && (
                          <p className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Calendar className="w-4 h-4" />
                            Processed: {new Date(request.processed_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => onAction(request.token, "approve")}
                          disabled={processing === request.token}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onAction(request.token, "reject")}
                          disabled={processing === request.token}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
