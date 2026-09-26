/**
 * api.ts — the one way the React app calls Supabase Edge Functions
 * (Application layer entry point for Presentation, Commander M-5).
 *
 * Normalises every outcome into the standard response shape (E-5) so UI code
 * never has to dig through fetch / FunctionsHttpError internals.
 */
import { BACKEND_UNAVAILABLE_MESSAGE } from "@/constants";
import { functionsBaseUrl } from "@/integrations/supabase/config";

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string; retryAfter?: number };

export type EdgeFunctionName =
  | "request-cv"
  | "check-cv-status"
  | "send-contact-email"
  | "submit-consultation"
  | "process-cv-request";

interface ErrorBody {
  success?: false;
  error?: string;
  code?: string;
  retry_after?: number;
}

/**
 * POST JSON to an Edge Function.
 * @param name - Function name.
 * @param body - JSON-serialisable payload (validated again server-side).
 * @param options.authenticated - Send the signed-in user's session token (admin functions).
 * @returns Standard success/error result; never throws.
 */
export async function callFunction<T>(
  name: EdgeFunctionName,
  body: unknown,
  options: { authenticated?: boolean } = {},
): Promise<ApiResult<T>> {
  if (!functionsBaseUrl) {
    return { success: false, error: BACKEND_UNAVAILABLE_MESSAGE, code: "BACKEND_NOT_CONFIGURED" };
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (options.authenticated) {
      // Loaded on demand: only admin pages send authenticated calls.
      const { supabase } = await import("@/integrations/supabase/client");
      if (!supabase) return { success: false, error: BACKEND_UNAVAILABLE_MESSAGE, code: "BACKEND_NOT_CONFIGURED" };
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return { success: false, error: "Please sign in again.", code: "UNAUTHENTICATED" };
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${functionsBaseUrl}/${name}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => null)) as ({ success: true; data: T } | ErrorBody) | null;

    if (response.ok && payload && payload.success === true) return { success: true, data: payload.data };

    const errorBody = (payload ?? {}) as ErrorBody;
    return {
      success: false,
      error: errorBody.error ?? "Something went wrong. Please try again in a few minutes.",
      code: errorBody.code ?? `HTTP_${response.status}`,
      retryAfter: errorBody.retry_after,
    };
  } catch (error) {
    console.error(`[api] ${name} request failed:`, error);
    return {
      success: false,
      error: "Could not reach the server. Please check your connection and try again.",
      code: "NETWORK_ERROR",
    };
  }
}

/** New random key so a double-click never sends the same message twice. */
export function newIdempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
