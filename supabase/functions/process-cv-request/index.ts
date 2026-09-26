/**
 * POST /functions/v1/process-cv-request
 * Role required: admin (Bearer session token; role read from user_roles)
 * Body: processCvRequestSchema — { requestId: uuid, action: "approve" | "reject" }
 * Response: { success: true, data: { status: "approved" | "rejected", emailSent: boolean } }
 * Errors: 400 (validation), 401 (unauthenticated), 403 (not admin), 404 (unknown request),
 *   409 (already processed), 500 (unexpected)
 *
 * Replaces the legacy notify-cv-approval, which let the browser update the row
 * and then emailed the DIRECTOR instead of the requester. Here the status
 * change, the audit entry and the requester email happen server-side together.
 */
import { processCvRequestSchema } from "../../../src/lib/validation/schemas.ts";
import { PUBLIC_CONTACT_EMAIL, SITE_URL } from "../_shared/constants.ts";
import { sendEmail } from "../_shared/email.ts";
import { emailLayout, escapeHtml } from "../_shared/html.ts";
import { fail, handlePreflight, logError, ok } from "../_shared/http.ts";
import { requireAdmin, serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return fail(req, 405, "Method not allowed.", "METHOD_NOT_ALLOWED");

  try {
    const db = serviceClient();

    // 1. Authenticate + 2. Authorise (E-6)
    const admin = await requireAdmin(req, db);
    if (!admin.ok) {
      return fail(req, admin.status, admin.status === 401 ? "Please sign in again." : "Admin access required.", admin.code);
    }

    // 3. Validate
    const parsed = processCvRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail(req, 400, "Invalid request.", "VALIDATION_ERROR");
    const { requestId, action } = parsed.data;

    // 4. Execute
    const { data: request, error: loadError } = await db
      .from("cv_requests")
      .select("id, email, name, status, token")
      .eq("id", requestId)
      .maybeSingle();
    if (loadError) throw new Error(`cv_requests load failed: ${loadError.message}`);
    if (!request) return fail(req, 404, "This request no longer exists.", "NOT_FOUND");
    if (request.status !== "pending") {
      return fail(req, 409, `This request was already ${request.status}.`, "ALREADY_PROCESSED");
    }

    const newStatus = action === "approve" ? "approved" : "rejected";
    const { error: updateError } = await db
      .from("cv_requests")
      .update({ status: newStatus, processed_at: new Date().toISOString() })
      .eq("id", requestId)
      .eq("status", "pending");
    if (updateError) throw new Error(`cv_requests update failed: ${updateError.message}`);

    const { error: auditError } = await db.from("admin_audit_log").insert({
      admin_user_id: admin.userId,
      action: `cv_request.${newStatus}`,
      target_table: "cv_requests",
      target_id: request.id,
      old_value: { status: request.status },
      new_value: { status: newStatus },
      user_agent: req.headers.get("user-agent"),
    });
    if (auditError) logError("process-cv-request.audit", auditError, { requestId });

    const greeting = request.name ? `Dear ${escapeHtml(request.name)},` : "Hello,";
    const personalLink = `${SITE_URL}/cv-status?token=${request.token}`;
    const html =
      newStatus === "approved"
        ? emailLayout(
          "Your CV request has been approved",
          `<p>${greeting}</p>
           <p>Thank you for your interest. Your request to access Davor Mulalić's CV has been approved.</p>
           <p style="text-align:center;margin:28px 0;">
             <a href="${personalLink}" style="background:#1a6fbf;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Download the CV</a>
           </p>
           <p style="color:#666;font-size:13px;">This link is personal — please do not forward it.</p>`,
        )
        : emailLayout(
          "Update on your CV request",
          `<p>${greeting}</p>
           <p>Thank you for your interest. Unfortunately, your CV request could not be approved at this time.</p>
           <p>You are welcome to get in touch directly: <a href="mailto:${PUBLIC_CONTACT_EMAIL}">${PUBLIC_CONTACT_EMAIL}</a></p>`,
        );

    const email = await sendEmail(db, {
      functionName: "process-cv-request",
      idempotencyKey: `cv-${newStatus}-${request.id}`,
      message: {
        to: request.email,
        replyTo: PUBLIC_CONTACT_EMAIL,
        subject: newStatus === "approved" ? "Your CV request has been approved — Davor Mulalić" : "Your CV request — Davor Mulalić",
        html,
      },
    });
    if (!email.ok) logError("process-cv-request.email", email.code, { requestId });

    // 5. Return
    return ok(req, { status: newStatus, emailSent: email.ok });
  } catch (error) {
    logError("process-cv-request", error);
    return fail(req, 500, "Something went wrong. Please try again.", "INTERNAL_ERROR");
  }
});
