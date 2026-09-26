/**
 * Supabase clients for Edge Functions (Infrastructure layer).
 * The service-role client bypasses RLS — use it only inside Edge Functions.
 */
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.87.1";

/**
 * Service-role client (bypasses RLS). Server-side only.
 * @throws Error when the platform env vars are missing.
 */
export function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not available");
  return createClient(url, key, { auth: { persistSession: false } });
}

export type AdminCheck =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; code: "UNAUTHENTICATED" | "FORBIDDEN" };

/**
 * Authenticate the caller from the Bearer token and authorise the admin role.
 * The role is resolved from `user_roles` on every request — never from token
 * claims (Commander E-4 confirmed-safe RBAC pattern).
 * @param req - Incoming request.
 * @param db - Service-role client.
 */
export async function requireAdmin(req: Request, db: SupabaseClient): Promise<AdminCheck> {
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return { ok: false, status: 401, code: "UNAUTHENTICATED" };
  const token = header.slice("Bearer ".length);

  const { data: userData, error: userError } = await db.auth.getUser(token);
  if (userError || !userData?.user) return { ok: false, status: 401, code: "UNAUTHENTICATED" };

  const { data: role, error: roleError } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (roleError) throw new Error(`requireAdmin role lookup failed: ${roleError.message}`);
  if (!role) return { ok: false, status: 403, code: "FORBIDDEN" };

  return { ok: true, userId: userData.user.id };
}
