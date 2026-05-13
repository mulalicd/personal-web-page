// Shared helpers for retried Resend gateway sends with metrics + idempotency.
// Used by send-contact-email, request-cv (admin notify), and notify-cv-approval.
//
// Concerns:
//  - Retry on 429 / 5xx with exponential backoff + jitter, honoring Retry-After.
//  - Persist a row in `email_send_metrics` per logical send (one row per
//    idempotency_key) so admins can inspect attempts, latency and errors.
//  - Idempotency: if a row with the same idempotency_key already exists with
//    status="sent", skip the send and return success.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AttemptLog {
  attempt: number;
  status: number | null;
  ms: number;
  reason?: string;
}

export interface SendRetryResult {
  ok: boolean;
  status: number;
  attempts: number;
  totalMs: number;
  body: any;
  log: AttemptLog[];
  errorCode?: string;
  errorMessage?: string;
  deduped?: boolean;
}

const GATEWAY_EMAIL_URL = "https://connector-gateway.lovable.dev/resend/emails";

async function hashRecipient(email: string | undefined): Promise<string | null> {
  if (!email) return null;
  const data = new TextEncoder().encode(email.toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getServiceClient(): SupabaseClient | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Returns existing 'sent' row's id if a matching idempotency_key already succeeded. */
export async function checkIdempotency(idempotencyKey: string): Promise<{ alreadySent: boolean }> {
  const sb = getServiceClient();
  if (!sb || !idempotencyKey) return { alreadySent: false };
  const { data } = await sb
    .from("email_send_metrics")
    .select("id, status")
    .eq("idempotency_key", idempotencyKey)
    .eq("status", "sent")
    .maybeSingle();
  return { alreadySent: !!data };
}

export interface SendOptions {
  functionName: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
  recipientEmail?: string;
  maxAttempts?: number;
}

export async function sendEmailWithRetry(opts: SendOptions): Promise<SendRetryResult> {
  const {
    functionName,
    payload,
    idempotencyKey,
    recipientEmail,
    maxAttempts = 5,
  } = opts;

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const RESEND_API_KEY =
    Deno.env.get("RESEND_API_KEY_1") || Deno.env.get("RESEND_API_KEY");

  const recipientHash = await hashRecipient(recipientEmail);
  const sb = getServiceClient();
  const t0 = Date.now();
  const log: AttemptLog[] = [];

  // Idempotency short-circuit
  if (idempotencyKey) {
    const { alreadySent } = await checkIdempotency(idempotencyKey);
    if (alreadySent) {
      return {
        ok: true,
        status: 200,
        attempts: 0,
        totalMs: 0,
        body: { deduped: true },
        log,
        deduped: true,
      };
    }
  }

  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    const result: SendRetryResult = {
      ok: false,
      status: 0,
      attempts: 0,
      totalMs: 0,
      body: null,
      log,
      errorCode: "missing_keys",
      errorMessage: "LOVABLE_API_KEY or RESEND_API_KEY missing",
    };
    await persistMetric(sb, functionName, recipientHash, idempotencyKey, result, null);
    return result;
  }

  // Inject Resend `tags` so webhooks can correlate by idempotency_key + function.
  const enrichedPayload: Record<string, unknown> = { ...payload };
  if (idempotencyKey) {
    const safeKey = idempotencyKey.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 256);
    const safeFn = functionName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 256);
    const existing = Array.isArray((payload as any).tags) ? (payload as any).tags : [];
    enrichedPayload.tags = [
      ...existing,
      { name: "idempotency_key", value: safeKey },
      { name: "function_name", value: safeFn },
    ];
  }

  const body = JSON.stringify(enrichedPayload);
  let lastStatus = 0;
  let lastBody: any = null;
  let lastErr: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const tA = Date.now();
    let res: Response | null = null;
    try {
      res = await fetch(GATEWAY_EMAIL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body,
      });
    } catch (e: any) {
      log.push({ attempt, status: null, ms: Date.now() - tA, reason: e.message });
      lastErr = e.message;
      if (attempt === maxAttempts) break;
      await sleep(backoff(attempt));
      continue;
    }

    lastStatus = res.status;
    let parsed: any = null;
    try {
      parsed = await res.json();
    } catch {
      parsed = null;
    }
    lastBody = parsed;

    if (res.ok) {
      log.push({ attempt, status: res.status, ms: Date.now() - tA });
      const result: SendRetryResult = {
        ok: true,
        status: res.status,
        attempts: attempt,
        totalMs: Date.now() - t0,
        body: parsed,
        log,
      };
      const providerMessageId = (parsed && (parsed.id || parsed.data?.id)) ?? null;
      await persistMetric(sb, functionName, recipientHash, idempotencyKey, result, providerMessageId);
      return result;
    }

    const reason = (parsed && (parsed.message || parsed.error)) || `HTTP ${res.status}`;
    log.push({ attempt, status: res.status, ms: Date.now() - tA, reason });
    lastErr = reason;

    const retriable = res.status === 429 || res.status >= 500;
    if (!retriable || attempt === maxAttempts) break;

    const retryAfter = Number(res.headers.get("retry-after"));
    const wait =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : backoff(attempt);
    await sleep(wait);
  }

  const result: SendRetryResult = {
    ok: false,
    status: lastStatus,
    attempts: log.length,
    totalMs: Date.now() - t0,
    body: lastBody,
    log,
    errorCode: lastStatus ? String(lastStatus) : "network_error",
    errorMessage: lastErr,
  };
  await persistMetric(sb, functionName, recipientHash, idempotencyKey, result, null);
  return result;
}

function backoff(attempt: number): number {
  return Math.min(2000, 250 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 200);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function persistMetric(
  sb: SupabaseClient | null,
  functionName: string,
  recipientHash: string | null,
  idempotencyKey: string | undefined,
  result: SendRetryResult,
  providerMessageId: string | null,
): Promise<void> {
  if (!sb) return;
  try {
    const row: Record<string, unknown> = {
      function_name: functionName,
      recipient_hash: recipientHash,
      idempotency_key: idempotencyKey ?? null,
      status: result.ok ? "sent" : "failed",
      attempts: result.attempts,
      total_latency_ms: result.totalMs,
      last_error_code: result.errorCode ?? null,
      last_error_message: result.errorMessage ?? null,
      attempt_log: result.log,
    };
    if (providerMessageId) {
      row.provider_message_id = providerMessageId;
      row.delivery_status = "sent";
    }
    if (idempotencyKey) {
      await sb.from("email_send_metrics").upsert(row, { onConflict: "idempotency_key" });
    } else {
      await sb.from("email_send_metrics").insert(row);
    }
  } catch (e: any) {
    console.error("persistMetric failed:", e.message);
  }
}
