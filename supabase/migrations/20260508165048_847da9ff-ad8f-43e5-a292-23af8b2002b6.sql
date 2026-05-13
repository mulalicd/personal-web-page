ALTER TABLE public.email_send_metrics
  ADD COLUMN IF NOT EXISTS provider_message_id text,
  ADD COLUMN IF NOT EXISTS delivery_status text,
  ADD COLUMN IF NOT EXISTS delivery_events jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_delivery_at timestamptz;

CREATE INDEX IF NOT EXISTS email_send_metrics_provider_message_id_idx
  ON public.email_send_metrics (provider_message_id);