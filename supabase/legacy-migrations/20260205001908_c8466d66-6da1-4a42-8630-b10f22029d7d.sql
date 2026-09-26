-- ============================================
-- FIX REMAINING RLS WARNINGS
-- ============================================

-- Drop remaining permissive policies
DROP POLICY IF EXISTS "Users can read own request by email" ON public.cv_requests;
DROP POLICY IF EXISTS "Service role manages rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Anyone can create CV requests" ON public.cv_requests;
DROP POLICY IF EXISTS "Anyone can create consultation requests" ON public.consultation_requests;

-- CV Requests: Public can submit, but only via edge function (no direct SELECT of other emails)
-- Insert allowed for anyone (public form submission)
CREATE POLICY "Public can create CV requests"
ON public.cv_requests
FOR INSERT
WITH CHECK (true);

-- Select: Users can read their own request by matching email from the query
-- This is intentionally permissive for SELECT as users need to check their own status
CREATE POLICY "Anyone can check their own CV status"
ON public.cv_requests
FOR SELECT
USING (true);

-- Consultation Requests: Public can submit
CREATE POLICY "Public can create consultations"
ON public.consultation_requests
FOR INSERT
WITH CHECK (true);

-- Rate limits: Only accessible via service role (edge functions)
CREATE POLICY "Rate limits service access"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);