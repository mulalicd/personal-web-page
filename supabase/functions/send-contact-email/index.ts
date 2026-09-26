/**
 * POST /functions/v1/send-contact-email
 * Role required: none (public contact form)
 * Body: contactFormSchema — { name, email, organization?, interest?, message, idempotencyKey? }
 * Response: { success: true, data: { delivered: true } }
 * Errors: 400 (validation), 429 (rate limit), 502 (email provider failed), 500 (unexpected)
 */
import { contactFormSchema } from "../../../src/lib/validation/schemas.ts";
import { ADMIN_NOTIFY_EMAIL, RATE_LIMITS } from "../_shared/constants.ts";
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
    const parsed = contactFormSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return fail(req, 400, parsed.error.errors[0]?.message ?? "Please check your details.", "VALIDATION_ERROR");
    }
    const { name, email, organization, interest, message, idempotencyKey } = parsed.data;

    const db = serviceClient();
    const limit = await checkRateLimit(db, await clientFingerprint(req), "contact", RATE_LIMITS.contact);
    if (!limit.allowed) return rateLimited(req, limit.retryAfter);

    const rows = [
      ["Name", escapeHtml(name)],
      ["Email", `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`],
      ...(organization ? [["Organization", escapeHtml(organization)]] : []),
      ...(interest ? [["Interest", escapeHtml(interest)]] : []),
    ]
      .map(([label, value]) => `<tr><td style="padding:6px 12px 6px 0;font-weight:bold;color:#555;">${label}</td><td>${value}</td></tr>`)
      .join("");

    const result = await sendEmail(db, {
      functionName: "send-contact-email",
      idempotencyKey: idempotencyKey ? `contact-${idempotencyKey}` : undefined,
      message: {
        to: ADMIN_NOTIFY_EMAIL,
        replyTo: email,
        subject: singleLine(`[Website Contact] ${interest ?? "General Inquiry"} from ${name}`),
        html: emailLayout(
          "New contact form message",
          `<table style="border-collapse:collapse;">${rows}</table>
           <div style="margin-top:18px;padding:14px;background:#f5f5f5;border-radius:8px;white-space:pre-wrap;">${escapeHtml(message)}</div>`,
        ),
      },
    });

    if (!result.ok) {
      return fail(req, 502, "Your message could not be sent right now. Please try again later or email directly.", "EMAIL_FAILED");
    }
    return ok(req, { delivered: true });
  } catch (error) {
    logError("send-contact-email", error);
    return fail(req, 500, "Something went wrong. Please try again in a few minutes.", "INTERNAL_ERROR");
  }
});
