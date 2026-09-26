import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface RateLimitCountdownProps {
  retryAfterSeconds: number;
  onComplete?: () => void;
}

const SECONDS_PER_MINUTE = 60;
const TICK_MS = 1000;

function formatMMSS(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(seconds / SECONDS_PER_MINUTE)).padStart(2, "0");
  const rest = String(seconds % SECONDS_PER_MINUTE).padStart(2, "0");
  return `${minutes}:${rest}`;
}

/**
 * Friendly "please wait" notice with a live countdown, shown when the server
 * rate-limits a form. Contains no internal endpoint names (audit finding).
 */
export function RateLimitCountdown({ retryAfterSeconds, onComplete }: RateLimitCountdownProps) {
  const [remaining, setRemaining] = useState(retryAfterSeconds);
  // Keep the latest callback without restarting the timer when the parent re-renders.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemaining(retryAfterSeconds);
    const id = window.setInterval(() => {
      setRemaining((previous) => {
        if (previous <= 1) {
          window.clearInterval(id);
          onCompleteRef.current?.();
          return 0;
        }
        return previous - 1;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [retryAfterSeconds]);

  if (remaining <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3"
      role="status"
      aria-live="polite"
    >
      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Thanks for your patience</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          We received several requests in a short time. You can try again in{" "}
          <span className="font-mono font-semibold tabular-nums text-foreground">{formatMMSS(remaining)}</span>.
        </p>
      </div>
    </motion.div>
  );
}
