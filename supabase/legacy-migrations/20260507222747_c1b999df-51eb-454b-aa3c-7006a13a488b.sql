
CREATE TABLE IF NOT EXISTS public.email_send_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  recipient_hash text,
  idempotency_key text,
  status text NOT NULL,
  attempts integer NOT NULL DEFAULT 1,
  total_latency_ms integer,
  last_error_code text,
  last_error_message text,
  attempt_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS email_send_metrics_idem_idx
  ON public.email_send_metrics (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS email_send_metrics_created_at_idx
  ON public.email_send_metrics (created_at DESC);

CREATE INDEX IF NOT EXISTS email_send_metrics_function_idx
  ON public.email_send_metrics (function_name, created_at DESC);

ALTER TABLE public.email_send_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read email metrics"
  ON public.email_send_metrics FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages email metrics"
  ON public.email_send_metrics FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
