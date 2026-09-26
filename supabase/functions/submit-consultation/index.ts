/**
 * POST /functions/v1/submit-consultation
 * Role required: none (public visitor)
 * Body: consultationRequestSchema — { name, email, message? }
 * Response: { success: true, data: { received: true } }
 * Errors: 400 (validation), 429 (rate limit), 500 (unexpected)
 *
 * Stores the request (visible in the admin panel) and notifies the Director.
 * The visitor then picks a time in the Zoho Bookings calendar.
 */
import { consultationRequestSchema } from "../../../src/lib/validation/schemas.ts";
import { ADMIN_NOTIFY_EMAIL, RATE_LIMITS, SITE_URL } from "../_shared/constants.ts";
import { sendEmail } from "../_shared/email.ts";
import { emailLayout, escapeHtml, singleLine } from "../_shared/html.ts";
import { clientFingerprint, fail, handlePreflight, logError, ok, rateLimited } from "../_shared/http.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return fail(req, 405, "Method not allowed.", "METHOD_NOT_ALLOWED");

  try {
    const parsed = consultationRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return fail(req, 400, parsed.error.errors[0]?.message ?? "Please check your details.", "VALIDATION_ERROR");
    }
    const { name, email } = parsed.data;
    const message = parsed.data.message?.trim() || null;

    const db = serviceClient();
    const limit = await checkRateLimit(db, `${await clientFingerprint(req)}:${email}`, "consultation", RATE_LIMITS.consultation);
    if (!limit.allowed) return rateLimited(req, limit.retryAfter);

    const { data: created, error } = await db
      .from("consultation_requests")
      .insert({ name, email, message })
      .select("id")
      .single();
    if (error) throw new Error(`consultation_requests insert failed: ${error.message}`);

    const notify = await sendEmail(db, {
      functionName: "submit-consultation",
      idempotencyKey: `consultation-notify-${created.id}`,
      message: {
        to: ADMIN_NOTIFY_EMAIL,
        replyTo: email,
        subject: singleLine(`New consultation request — ${name}`),
        html: emailLayout(
          "New consultation request",
          `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
           ${message ? `<div style="padding:14px;background:#f5f5f5;border-radius:8px;white-space:pre-wrap;">${escapeHtml(message)}</div>` : ""}
           <p>The visitor was sent to the Zoho Bookings calendar. Manage it in the <a href="${SITE_URL}/admin">admin panel</a>.</p>`,
        ),
      },
    });
    if (!notify.ok) logError("submit-consultation.notify", notify.code, { requestId: created.id });

    return ok(req, { received: true });
  } catch (error) {
    logError("submit-consultation", error);
    return fail(req, 500, "Something went wrong. Please try again in a few minutes.", "INTERNAL_ERROR");
  }
});
