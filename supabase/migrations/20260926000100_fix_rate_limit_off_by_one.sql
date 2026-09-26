-- Migration: 20260926000100_fix_rate_limit_off_by_one
-- Date: 2026-09-26
-- Author: ACA (Claude Code)
-- Description: check_rate_limit_v2 (inherited from the legacy migrations) set
--   blocked_until when the PREVIOUS attempt count reached max-1, so a budget of
--   3 attempts actually blocked the 3rd attempt (found by live smoke test).
--   Now the block starts only once attempts exceed p_max_attempts.
-- Rollback: re-run the function body from 20260926000000_initial_schema.sql.

CREATE OR REPLACE FUNCTION public.check_rate_limit_v2(
  p_identifier TEXT,
  p_action_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15,
  p_block_minutes INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record public.rate_limits%ROWTYPE;
  v_now TIMESTAMPTZ := now();
  v_window INTERVAL := make_interval(mins => p_window_minutes);
  v_retry_after INTEGER := 0;
  v_allowed BOOLEAN := TRUE;
BEGIN
  INSERT INTO public.rate_limits (identifier, action_type, attempts, first_attempt, last_attempt)
  VALUES (p_identifier, p_action_type, 1, v_now, v_now)
  ON CONFLICT (identifier, action_type) DO UPDATE
  SET
    attempts = CASE WHEN rate_limits.first_attempt < v_now - v_window THEN 1
                    ELSE rate_limits.attempts + 1 END,
    first_attempt = CASE WHEN rate_limits.first_attempt < v_now - v_window THEN v_now
                         ELSE rate_limits.first_attempt END,
    last_attempt = v_now,
    -- Block when THIS attempt (previous count + 1) exceeds the budget inside the window.
    blocked_until = CASE
      WHEN rate_limits.first_attempt >= v_now - v_window
       AND rate_limits.attempts + 1 > p_max_attempts
      THEN v_now + make_interval(mins => p_block_minutes)
      ELSE rate_limits.blocked_until END
  RETURNING * INTO v_record;

  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
    v_allowed := FALSE;
    v_retry_after := EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::INTEGER;
  ELSIF v_record.attempts > p_max_attempts THEN
    v_allowed := FALSE;
    v_retry_after := GREATEST(
      EXTRACT(EPOCH FROM ((v_record.first_attempt + v_window) - v_now))::INTEGER, 60);
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'retry_after', GREATEST(v_retry_after, 0),
    'attempts', v_record.attempts,
    'max_attempts', p_max_attempts
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit_v2(text, text, integer, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit_v2(text, text, integer, integer, integer)
  TO service_role;
