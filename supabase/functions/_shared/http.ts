/**
 * HTTP helpers for Edge Functions: CORS allowlist, standard response
 * shapes (Commander E-5) and client identification for rate limiting.
 */
import { ALLOWED_ORIGINS } from "./constants.ts";

const ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, " +
  "x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

/**
 * Build CORS headers for a request. Unknown origins get the site origin back,
 * which browsers then reject — no wildcard.
 * @param req - Incoming request.
 * @returns Header map to spread into every response.
 */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

/** Answer a CORS preflight, or return null for any other method. */
export function handlePreflight(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  return null;
}

/** `{ success: true, data }` response. */
export function ok<T>(req: Request, data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

/**
 * `{ success: false, error, code }` response. `error` must be visitor-safe text —
 * never an internal message or stack (E-5).
 */
export function fail(
  req: Request,
  status: number,
  error: string,
  code: string,
  extra: Record<string, unknown> = {},
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify({ success: false, error, code, ...extra }), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json", ...headers },
  });
}

/** Standard 429 response carrying `retry_after` seconds. */
export function rateLimited(req: Request, retryAfterSeconds: number): Response {
  return fail(
    req,
    429,
    "Too many requests. Please wait a little and try again.",
    "RATE_LIMITED",
    { retry_after: retryAfterSeconds },
    { "Retry-After": String(retryAfterSeconds) },
  );
}

/**
 * Stable, non-reversible identifier for the caller (first IP from the proxy
 * chain, SHA-256 hashed) — used as a rate-limit key without storing raw IPs.
 */
export async function clientFingerprint(req: Request): Promise<string> {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "unknown";
  return await sha256Hex(ip);
}

/** Hex SHA-256 of a string, truncated to 24 chars (enough to be unique, not reversible). */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Log an error with location and context — never with secrets or personal data (E-5, E-8).
 */
export function logError(location: string, error: unknown, context: Record<string, unknown> = {}): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(JSON.stringify({ level: "error", at: new Date().toISOString(), location, message, context, stack }));
}
