/**
 * The "your CV request has been approved" email with the requester's personal
 * download link. Shared by process-cv-request (first approval) and request-cv
 * (an already-approved visitor asks again and gets the link again).
 */
import { SITE_URL } from "./constants.ts";
import { emailLayout, escapeHtml } from "./html.ts";

export const CV_APPROVED_SUBJECT = "Your CV request has been approved — Davor Mulalić";

/**
 * @param name - Requester's name, or null.
 * @param token - The request's personal token (cv_requests.token).
 * @returns Email HTML.
 */
export function cvApprovedEmailHtml(name: string | null, token: string): string {
  const greeting = name ? `Dear ${escapeHtml(name)},` : "Hello,";
  const personalLink = `${SITE_URL}/cv-status?token=${token}`;
  return emailLayout(
    "Your CV request has been approved",
    `<p>${greeting}</p>
           <p>Thank you for your interest. Your request to access Davor Mulalić's CV has been approved.</p>
           <p style="text-align:center;margin:28px 0;">
             <a href="${personalLink}" style="background:#1a6fbf;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Download the CV</a>
           </p>
           <p style="color:#666;font-size:13px;">This link is personal — please do not forward it.</p>`,
  );
}
