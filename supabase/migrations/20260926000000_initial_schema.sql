-- Migration: 20260926000000_initial_schema
-- Date: 2026-09-26
-- Author: ACA (Claude Code)
-- Description: Initial schema for Supabase project qixpdeqjrkvfurqhzvtc.
--   Consolidates the legacy Lovable migrations (see supabase/legacy-migrations/)
--   minus their security holes: no auto-admin trigger, no anonymous writes.
--   RLS is enabled and deny-by-default on every table; the service role
--   (Edge Functions only) bypasses RLS for public writes.
-- Rollback:
--   DROP TABLE IF EXISTS public.email_send_metrics, public.rate_limits,
--     public.admin_audit_log, public.consultation_requests, public.cv_requests,
--     public.user_roles CASCADE;
--   DROP FUNCTION IF EXISTS public.check_rate_limit_v2(text, text, integer, integer, integer);
--   DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
--   DROP TYPE IF EXISTS public.app_role;
--   DELETE FROM storage.buckets WHERE id = 'cv';

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER so RLS policies can call it without recursing into user_roles RLS.
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- A user may read their own role rows (needed by the client-side admin check);
-- nobody can write roles through the API — roles are assigned with SQL only.
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- CV requests (approval-gated CV download)
-- ---------------------------------------------------------------------------
CREATE TABLE public.cv_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
CREATE INDEX cv_requests_email_idx ON public.cv_requests (email);
ALTER TABLE public.cv_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read cv_requests" ON public.cv_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete cv_requests" ON public.cv_requests
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- Status changes go through the process-cv-request Edge Function (service role).

-- ---------------------------------------------------------------------------
-- Consultation requests
-- ---------------------------------------------------------------------------
CREATE TABLE public.consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read consultations" ON public.consultation_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update consultations" ON public.consultation_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete consultations" ON public.consultation_requests
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- Admin audit log (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX admin_audit_log_created_at_idx ON public.admin_audit_log (created_at DESC);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit log" ON public.admin_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins append own audit entries" ON public.admin_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_user_id = auth.uid());
-- No UPDATE / DELETE policies: the log is immutable through the API.

-- ---------------------------------------------------------------------------
-- Rate limiting (service role only — no policies)
-- ---------------------------------------------------------------------------
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  first_attempt TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_attempt TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  UNIQUE (identifier, action_type)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

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
    blocked_until = CASE
      WHEN rate_limits.attempts >= p_max_attempts - 1
       AND rate_limits.first_attempt >= v_now - v_window
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

-- ---------------------------------------------------------------------------
-- Email send metrics (written by Edge Functions, read by admin)
-- ---------------------------------------------------------------------------
CREATE TABLE public.email_send_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  recipient_hash TEXT,
  idempotency_key TEXT,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  total_latency_ms INTEGER,
  last_error_code TEXT,
  last_error_message TEXT,
  attempt_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  provider_message_id TEXT,
  delivery_status TEXT,
  delivery_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_delivery_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX email_send_metrics_idem_idx
  ON public.email_send_metrics (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX email_send_metrics_created_at_idx ON public.email_send_metrics (created_at DESC);
CREATE INDEX email_send_metrics_provider_message_id_idx ON public.email_send_metrics (provider_message_id);
ALTER TABLE public.email_send_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read email metrics" ON public.email_send_metrics
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- Private storage bucket for the approval-gated CV (signed URLs only)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cv', 'cv', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;
-- No storage.objects policies for 'cv': only the service role can read/write it.
