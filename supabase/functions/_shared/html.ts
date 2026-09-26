/**
 * Output-safety helpers for outbound email (Commander E-4: one shared helper).
 */

/**
 * HTML-escape user-controlled text before inserting it into an email body.
 * @param value - Untrusted text.
 * @returns Text safe to place inside HTML element content or attribute values.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Remove CR/LF from text used in an email subject (header-injection defence).
 * @param value - Untrusted text.
 * @returns Single-line text.
 */
export function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/**
 * Wrap email content in the site's standard email layout.
 * @param title - Heading (already safe text).
 * @param bodyHtml - Inner HTML built only from escaped values.
 */
export function emailLayout(title: string, bodyHtml: string): string {
  return `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h2 style="border-bottom: 2px solid #1a6fbf; padding-bottom: 10px; margin-top: 0;">${title}</h2>
  ${bodyHtml}
  <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0 12px;" />
  <p style="color: #888; font-size: 12px; margin: 0;">Davor Mulalić — C-Level AI Leader · mulalic.ai-studio.wiki</p>
</div>`;
}
