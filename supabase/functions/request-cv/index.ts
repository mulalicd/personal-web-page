/**
 * POST /functions/v1/request-cv
 * Role required: none (public visitor)
 * Body: cvRequestSchema — { email, name?, idempotencyKey? }
 * Response: { success: true, data: { alreadyRequested: boolean } }
 * Errors: 400 (validation), 429 (rate limit), 500 (unexpected)
 *
 * Stores a pending request and notifies the Director. The visitor never learns
 * whether an address was already approved — only that the request is on file.
 */
import { cvRequestSchema } from "../../../src/lib/validation/schemas.ts";
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
    const parsed = cvRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return fail(req, 400, parsed.error.errors[0]?.message ?? "Please check your details.", "VALIDATION_ERROR");
    }
    const { email } = parsed.data;
    const name = parsed.data.name?.trim() || null;

    const db = serviceClient();
    const limit = await checkRateLimit(db, `${await clientFingerprint(req)}:${email}`, "cv_request", RATE_LIMITS.cvRequest);
    if (!limit.allowed) return rateLimited(req, limit.retryAfter);

    const { data: existing, error: existingError } = await db
      .from("cv_requests")
      .select("id")
      .eq("email", email)
      .in("status", ["pending", "approved"])
      .limit(1)
      .maybeSingle();
    if (existingError) throw new Error(`cv_requests lookup failed: ${existingError.message}`);
    if (existing) return ok(req, { alreadyRequested: true });

    const { data: created, error: insertError } = await db
      .from("cv_requests")
      .insert({ email, name })
      .select("id")
      .single();
    if (insertError) throw new Error(`cv_requests insert failed: ${insertError.message}`);

    const displayName = name ? escapeHtml(name) : "(no name given)";
    const notify = await sendEmail(db, {
      functionName: "request-cv",
      idempotencyKey: `cv-request-notify-${created.id}`,
      message: {
        to: ADMIN_NOTIFY_EMAIL,
        replyTo: email,
        subject: singleLine(`New CV request — ${name ?? email}`),
        html: emailLayout(
          "New CV download request",
          `<p><strong>From:</strong> ${displayName} &lt;${escapeHtml(email)}&gt;</p>
           <p>Approve or reject it in the <a href="${SITE_URL}/admin">admin panel</a>.
           On approval the requester receives a personal download link.</p>`,
        ),
      },
    });
    // The request is saved either way; a failed notification is visible in Email Metrics.
    if (!notify.ok) logError("request-cv.notify", notify.code, { requestId: created.id });

    return ok(req, { alreadyRequested: false });
  } catch (error) {
    logError("request-cv", error);
    return fail(req, 500, "Something went wrong. Please try again in a few minutes.", "INTERNAL_ERROR");
  }
});
