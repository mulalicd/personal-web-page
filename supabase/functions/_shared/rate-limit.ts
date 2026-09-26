/**
 * Rate limiting through the `check_rate_limit_v2` database function.
 */
import type { SupabaseClient } from "npm:@supabase/supabase-js@2.87.1";
import { logError } from "./http.ts";

export interface RateLimitBudget {
  maxAttempts: number;
  windowMinutes: number;
  blockMinutes: number;
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: number };

/**
 * Count one attempt for `identifier` + `action` and report whether it is allowed.
 * Fails open (allowed) if the check itself errors, and logs loudly — a broken
 * limiter must not take the contact form down, but it must not be silent (E-5).
 */
export async function checkRateLimit(
  db: SupabaseClient,
  identifier: string,
  action: string,
  budget: RateLimitBudget,
): Promise<RateLimitResult> {
  const { data, error } = await db.rpc("check_rate_limit_v2", {
    p_identifier: identifier,
    p_action_type: action,
    p_max_attempts: budget.maxAttempts,
    p_window_minutes: budget.windowMinutes,
    p_block_minutes: budget.blockMinutes,
  });
  if (error) {
    logError("checkRateLimit", error, { action });
    return { allowed: true };
  }
  const result = data as { allowed?: boolean; retry_after?: number } | null;
  if (result?.allowed === false) return { allowed: false, retryAfter: result.retry_after ?? 60 };
  return { allowed: true };
}
