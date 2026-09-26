/**
 * Backend configuration without the Supabase SDK, so the public homepage can
 * call Edge Functions without downloading supabase-js (stress test, perf).
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** True when the build was configured with a backend. */
export const isBackendConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/** Base URL of the Edge Functions, or null when the backend is not configured. */
export const functionsBaseUrl = isBackendConfigured ? `${SUPABASE_URL}/functions/v1` : null;
