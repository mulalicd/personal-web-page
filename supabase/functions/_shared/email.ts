/**
 * email.ts — outbound email through the Resend API (Infrastructure layer).
 *
 * Direct Resend API integration (PDL-002). Features:
 *  - retry on 429 / 5xx with exponential backoff + jitter, honouring Retry-After
 *  - idempotency: a key that already produced a "sent" row is not sent again
 *  - one `email_send_metrics` row per logical send (admin "Email Metrics" tab)
 *  - Resend tags so the resend-webhook function can attach delivery events
 *
 * Required secrets: RESEND_API_KEY, EMAIL_FROM (e.g. "Davor Mulalić <noreply@your-verified-domain>").
 */
import type { SupabaseClient } from "npm:@supabase/supabase-js@2.87.1";
import {
  EMAIL_BASE_BACKOFF_MS,
  EMAIL_MAX_ATTEMPTS,
  EMAIL_MAX_BACKOFF_MS,
  RESEND_API_URL,
} from "./constants.ts";
import { logError, sha256Hex } from "./http.ts";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailOptions {
  /** Function name recorded in metrics. */
  functionName: string;
  message: EmailMessage;
  /** Same key → sent at most once. */
  idempotencyKey?: string;
}

export type SendEmailResult =
  | { ok: true; deduped: boolean }
  | { ok: false; code: "EMAIL_NOT_CONFIGURED" | "EMAIL_REJECTED" | "EMAIL_UNAVAILABLE" };

interface AttemptLog {
  attempt: number;
  status: number | null;
  ms: number;
  reason?: string;
}

const RESEND_TAG_SAFE = /[^a-zA-Z0-9_-]/g;

function backoffMs(attempt: number): number {
  const exponential = Math.min(EMAIL_MAX_BACKOFF_MS, EMAIL_BASE_BACKOFF_MS * 2 ** (attempt - 1));
  return exponential + Math.floor(Math.random() * EMAIL_BASE_BACKOFF_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function alreadySent(db: SupabaseClient, idempotencyKey: string): Promise<boolean> {
  const { data, error } = await db
    .from("email_send_metrics")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .eq("status", "sent")
    .maybeSingle();
  if (error) throw new Error(`alreadySent lookup failed: ${error.message}`);
  return !!data;
}

async function recordMetric(
  db: SupabaseClient,
  row: Record<string, unknown>,
  idempotencyKey: string | undefined,
): Promise<void> {
  try {
    if (idempotencyKey) {
      // The unique index on idempotency_key is partial, so ON CONFLICT cannot
      // target it — update an existing row, otherwise insert.
      const { data: existing, error: findError } = await db
        .from("email_send_metrics")
        .select("id")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (findError) throw findError;
      const { error } = existing
        ? await db.from("email_send_metrics").update(row).eq("id", existing.id)
        : await db.from("email_send_metrics").insert(row);
      if (error) throw error;
      return;
    }
    const { error } = await db.from("email_send_metrics").insert(row);
    if (error) throw error;
  } catch (error) {
    logError("email.recordMetric", error);
  }
}

/**
 * Send one email through Resend with retries, idempotency and metrics.
 * Never throws for delivery problems — returns `{ ok: false, code }` so callers
 * can answer the visitor honestly.
 */
export async function sendEmail(db: SupabaseClient, options: SendEmailOptions): Promise<SendEmailResult> {
  const { functionName, message, idempotencyKey } = options;
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  const recipientHash = await sha256Hex(message.to.toLowerCase());
  const startedAt = Date.now();
  const log: AttemptLog[] = [];

  const baseRow = {
    function_name: functionName,
    recipient_hash: recipientHash,
    idempotency_key: idempotencyKey ?? null,
  };

  if (idempotencyKey && (await alreadySent(db, idempotencyKey))) {
    return { ok: true, deduped: true };
  }

  if (!apiKey || !from) {
    logError("sendEmail", "RESEND_API_KEY or EMAIL_FROM secret is not set", { functionName });
    await recordMetric(db, {
      ...baseRow,
      status: "failed",
      attempts: 0,
      last_error_code: "not_configured",
      last_error_message: "RESEND_API_KEY or EMAIL_FROM missing",
    }, idempotencyKey);
    return { ok: false, code: "EMAIL_NOT_CONFIGURED" };
  }

  const tags = [{ name: "function_name", value: functionName.replace(RESEND_TAG_SAFE, "_") }];
  if (idempotencyKey) tags.push({ name: "idempotency_key", value: idempotencyKey.replace(RESEND_TAG_SAFE, "_") });

  const body = JSON.stringify({
    from,
    to: [message.to],
    subject: message.subject,
    html: message.html,
    ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    tags,
  });

  let lastStatus = 0;
  let lastReason = "";

  for (let attempt = 1; attempt <= EMAIL_MAX_ATTEMPTS; attempt++) {
    const attemptStart = Date.now();
    let response: Response;
    try {
      response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        },
        body,
      });
    } catch (error) {
      lastReason = error instanceof Error ? error.message : String(error);
      log.push({ attempt, status: null, ms: Date.now() - attemptStart, reason: lastReason });
      if (attempt < EMAIL_MAX_ATTEMPTS) await sleep(backoffMs(attempt));
      continue;
    }

    lastStatus = response.status;
    const parsed = (await response.json().catch(() => null)) as { id?: string; message?: string; name?: string } | null;

    if (response.ok) {
      log.push({ attempt, status: response.status, ms: Date.now() - attemptStart });
      await recordMetric(db, {
        ...baseRow,
        status: "sent",
        attempts: attempt,
        total_latency_ms: Date.now() - startedAt,
        attempt_log: log,
        provider_message_id: parsed?.id ?? null,
        delivery_status: "sent",
        last_error_code: null,
        last_error_message: null,
      }, idempotencyKey);
      return { ok: true, deduped: false };
    }

    // Allowlisted diagnostics only: Resend's error name and message, never the key or payload (E-8).
    lastReason = [parsed?.name, parsed?.message].filter(Boolean).join(": ") || `HTTP ${response.status}`;
    log.push({ attempt, status: response.status, ms: Date.now() - attemptStart, reason: lastReason });

    const retriable = response.status === 429 || response.status >= 500;
    if (!retriable || attempt === EMAIL_MAX_ATTEMPTS) break;
    const retryAfterSeconds = Number(response.headers.get("retry-after"));
    await sleep(Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : backoffMs(attempt));
  }

  logError("sendEmail", lastReason, { functionName, status: lastStatus });
  await recordMetric(db, {
    ...baseRow,
    status: "failed",
    attempts: log.length,
    total_latency_ms: Date.now() - startedAt,
    attempt_log: log,
    last_error_code: lastStatus ? String(lastStatus) : "network_error",
    last_error_message: lastReason,
  }, idempotencyKey);

  const rejected = lastStatus >= 400 && lastStatus < 500 && lastStatus !== 429;
  return { ok: false, code: rejected ? "EMAIL_REJECTED" : "EMAIL_UNAVAILABLE" };
}
