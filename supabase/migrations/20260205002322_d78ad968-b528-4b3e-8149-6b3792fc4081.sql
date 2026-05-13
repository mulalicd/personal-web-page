-- ============================================
-- COMPLETE SECURITY HARDENING - DELETE POLICIES AND USER_ROLES
-- ============================================

-- 1. Add DELETE policies to cv_requests (admin only)
CREATE POLICY "Only admins can delete cv_requests"
ON public.cv_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Add DELETE policies to consultation_requests (admin only)
CREATE POLICY "Only admins can delete consultations"
ON public.consultation_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Complete user_roles protection - INSERT/UPDATE/DELETE for admins only
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Protect audit log from tampering (deny all UPDATE/DELETE)
-- Using a policy that always returns false
CREATE POLICY "No one can update audit logs"
ON public.admin_audit_log
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No one can delete audit logs"
ON public.admin_audit_log
FOR DELETE
TO authenticated
USING (false);