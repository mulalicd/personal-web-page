// Public webhook endpoint that receives Resend delivery events and writes
// them onto the matching email_send_metrics row. Correlation works either via
// provider_message_id (data.email_id from Resend) or — preferred — via the
// `idempotency_key` tag we attach when sending. Optional signature
// verification when RESEND_WEBHOOK_SECRET is set.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

const TYPE_TO_STATUS: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delayed",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.failed": "failed",
};

// Verify Svix signature (Resend uses Svix). Returns true if valid OR if no
// secret is configured AND ALLOW_UNSIGNED_WEBHOOKS=true (dev escape hatch).
async function verifySvixSignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  svixSignatureHeader: string,
  body: string,
): Promise<boolean> {
  // Reject events older than 5 minutes (replay protection)
  const ts = Number(svixTimestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  // Secret format: "whsec_<base64>" — strip the prefix before decoding.
  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const keyBytes = Uint8Array.from(atob(rawSecret), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const toSign = `${svixId}.${svixTimestamp}.${body}`;
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(toSign));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));

  // Header may contain multiple space-separated "v1,<sig>" entries — accept any match.
  const provided = svixSignatureHeader
    .split(" ")
    .map((p) => p.split(",")[1])
    .filter(Boolean);
  return provided.some((sig) => sig === expected);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const raw = await req.text();

    // ---- Signature verification ----
    const secret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    const allowUnsigned = Deno.env.get("ALLOW_UNSIGNED_WEBHOOKS") === "true";
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (secret) {
      if (!svixId || !svixTimestamp || !svixSignature) {
        console.warn("resend-webhook: missing svix headers");
        return new Response(JSON.stringify({ error: "missing signature headers" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const ok = await verifySvixSignature(secret, svixId, svixTimestamp, svixSignature, raw);
      if (!ok) {
        console.warn("resend-webhook: invalid signature", { svixId });
        return new Response(JSON.stringify({ error: "invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    } else if (!allowUnsigned) {
      console.error("resend-webhook: RESEND_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "webhook secret not configured" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const event = JSON.parse(raw) as {
      type?: string;
      created_at?: string;
      data?: {
        email_id?: string;
        tags?: Array<{ name: string; value: string }> | Record<string, string>;
        bounce?: unknown;
        click?: unknown;
      };
    };

    const type = event.type ?? "unknown";
    const status = TYPE_TO_STATUS[type] ?? type;
    const emailId = event.data?.email_id ?? null;
    const tagsRaw = event.data?.tags;
    const tagMap: Record<string, string> = Array.isArray(tagsRaw)
      ? Object.fromEntries(tagsRaw.map((t) => [t.name, t.value]))
      : (tagsRaw as Record<string, string>) ?? {};
    const idempotencyKey = tagMap["idempotency_key"] ?? null;

    if (!emailId && !idempotencyKey) {
      return new Response(JSON.stringify({ ok: true, ignored: "no correlation id" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find the metric row.
    let query = sb.from("email_send_metrics").select("id, delivery_events");
    if (idempotencyKey) query = query.eq("idempotency_key", idempotencyKey);
    else if (emailId) query = query.eq("provider_message_id", emailId);
    const { data: row } = await query.maybeSingle();

    if (!row) {
      console.warn("resend-webhook: no matching row", { type, emailId, idempotencyKey });
      return new Response(JSON.stringify({ ok: true, ignored: "no row" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const events = Array.isArray(row.delivery_events) ? row.delivery_events : [];
    events.push({
      type,
      status,
      at: event.created_at ?? new Date().toISOString(),
    });

    await sb
      .from("email_send_metrics")
      .update({
        delivery_status: status,
        delivery_events: events,
        last_delivery_at: new Date().toISOString(),
        ...(emailId ? { provider_message_id: emailId } : {}),
      })
      .eq("id", row.id);

    return new Response(JSON.stringify({ ok: true, status }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    console.error("resend-webhook error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
