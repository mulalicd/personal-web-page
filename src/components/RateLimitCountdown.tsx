import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

interface RateLimitCountdownProps {
  retryAfterSeconds: number;
  endpoint?: string;
  onComplete?: () => void;
}

function formatMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function RateLimitCountdown({
  retryAfterSeconds,
  endpoint,
  onComplete,
}: RateLimitCountdownProps) {
  const [remaining, setRemaining] = useState(retryAfterSeconds);

  useEffect(() => {
    setRemaining(retryAfterSeconds);
  }, [retryAfterSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.();
      return;
    }
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryAfterSeconds]);

  if (remaining <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-md border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3"
      role="status"
      aria-live="polite"
    >
      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Too many requests
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {endpoint
            ? `The "${endpoint}" endpoint is temporarily blocked.`
            : "This action is temporarily blocked."}{" "}
          Please try again in:
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-destructive" />
          <span className="font-mono text-lg font-semibold tabular-nums text-destructive">
            {formatMMSS(remaining)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
