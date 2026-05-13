CREATE OR REPLACE FUNCTION public.check_rate_limit_v2(
  p_identifier text,
  p_action_type text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15,
  p_block_minutes integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_record rate_limits%ROWTYPE;
    v_now TIMESTAMP WITH TIME ZONE := now();
    v_retry_after INTEGER := 0;
    v_allowed BOOLEAN := TRUE;
BEGIN
    INSERT INTO rate_limits (identifier, action_type, attempts, first_attempt, last_attempt)
    VALUES (p_identifier, p_action_type, 1, v_now, v_now)
    ON CONFLICT (identifier, action_type) DO UPDATE
    SET 
        attempts = CASE 
            WHEN rate_limits.first_attempt < v_now - (p_window_minutes || ' minutes')::INTERVAL THEN 1
            ELSE rate_limits.attempts + 1
        END,
        first_attempt = CASE 
            WHEN rate_limits.first_attempt < v_now - (p_window_minutes || ' minutes')::INTERVAL THEN v_now
            ELSE rate_limits.first_attempt
        END,
        last_attempt = v_now,
        blocked_until = CASE 
            WHEN rate_limits.attempts >= p_max_attempts - 1 
                AND rate_limits.first_attempt >= v_now - (p_window_minutes || ' minutes')::INTERVAL
            THEN v_now + (p_block_minutes || ' minutes')::INTERVAL
            ELSE rate_limits.blocked_until
        END
    RETURNING * INTO v_record;

    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
        v_allowed := FALSE;
        v_retry_after := EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::INTEGER;
    ELSIF v_record.attempts > p_max_attempts THEN
        v_allowed := FALSE;
        v_retry_after := EXTRACT(EPOCH FROM ((v_record.first_attempt + (p_window_minutes || ' minutes')::INTERVAL) - v_now))::INTEGER;
        IF v_retry_after < 1 THEN v_retry_after := 60; END IF;
    END IF;

    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'retry_after', GREATEST(v_retry_after, 0),
        'attempts', v_record.attempts,
        'max_attempts', p_max_attempts
    );
END;
$function$;