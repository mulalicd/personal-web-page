/**
 * POST /functions/v1/check-cv-status
 * Role required: none — possession of the personal link token is the credential
 * Body: cvStatusSchema — { token: uuid } (from the approval email link)
 * Response: { success: true, data: { status: "pending" | "approved" | "rejected", downloadUrl?: string } }
 *   downloadUrl is a short-lived signed URL, present only when approved.
 * Errors: 400 (validation), 404 (unknown token), 429 (rate limit), 500 (unexpected)
 */
import { cvStatusSchema } from "../../../src/lib/validation/schemas.ts";
import {
  CV_BUCKET,
  CV_DOWNLOAD_FILENAME,
  CV_OBJECT_PATH,
  CV_SIGNED_URL_TTL_SECONDS,
  RATE_LIMITS,
} from "../_shared/constants.ts";
import { clientFingerprint, fail, handlePreflight, logError, ok, rateLimited } from "../_shared/http.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return fail(req, 405, "Method not allowed.", "METHOD_NOT_ALLOWED");

  try {
    const parsed = cvStatusSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail(req, 400, "This link is not valid.", "VALIDATION_ERROR");

    const db = serviceClient();
    const limit = await checkRateLimit(db, await clientFingerprint(req), "cv_status", RATE_LIMITS.cvStatus);
    if (!limit.allowed) return rateLimited(req, limit.retryAfter);

    const { data: request, error } = await db
      .from("cv_requests")
      .select("status")
      .eq("token", parsed.data.token)
      .maybeSingle();
    if (error) throw new Error(`cv_requests token lookup failed: ${error.message}`);
    if (!request) return fail(req, 404, "This link is not valid.", "NOT_FOUND");

    if (request.status !== "approved") return ok(req, { status: request.status });

    const { data: signed, error: signError } = await db.storage
      .from(CV_BUCKET)
      .createSignedUrl(CV_OBJECT_PATH, CV_SIGNED_URL_TTL_SECONDS, { download: CV_DOWNLOAD_FILENAME });
    if (signError || !signed) throw new Error(`createSignedUrl failed: ${signError?.message ?? "no data"}`);

    return ok(req, { status: "approved", downloadUrl: signed.signedUrl });
  } catch (error) {
    logError("check-cv-status", error);
    return fail(req, 500, "Something went wrong. Please try again in a few minutes.", "INTERNAL_ERROR");
  }
});
