/**
 * Browser Supabase client (publishable key only — never a secret key).
 *
 * If the build is missing its env vars, `supabase` is null and every backend
 * feature degrades to a friendly "temporarily unavailable" message instead of
 * the whole site rendering blank (audit finding, Sprint 01).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** True when the build was configured with a backend. */
export const isBackendConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

if (!isBackendConfigured) {
  console.error("[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing — backend features disabled.");
}

export const supabase: SupabaseClient<Database> | null = isBackendConfigured
  ? createClient<Database>(SUPABASE_URL as string, SUPABASE_PUBLISHABLE_KEY as string, {
      auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
    })
  : null;

/** Base URL of the Edge Functions, or null when the backend is not configured. */
export const functionsBaseUrl = isBackendConfigured ? `${SUPABASE_URL}/functions/v1` : null;
