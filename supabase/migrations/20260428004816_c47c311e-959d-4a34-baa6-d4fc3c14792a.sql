-- Restrict SECURITY DEFINER functions from public/authenticated execute
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_first_user_admin() FROM PUBLIC, anon, authenticated;
-- has_role MUST remain executable by authenticated for RLS policies; revoke only from anon/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;