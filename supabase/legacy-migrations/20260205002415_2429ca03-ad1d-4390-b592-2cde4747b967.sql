-- ============================================
-- REMOVE PUBLIC SELECT FROM CV_REQUESTS
-- Now using edge function for secure status checks
-- ============================================

-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Public can check CV status by email" ON public.cv_requests;

-- Only admins can view all cv_requests
CREATE POLICY "Only admins can view all cv_requests"
ON public.cv_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));