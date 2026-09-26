/**
 * Named constants shared by all Edge Functions (Commander E-11: no magic values).
 */

/** Public site URL — used in email links. */
export const SITE_URL = "https://mulalic.ai-studio.wiki";

/**
 * Browser origins allowed to call the public functions (CORS allowlist,
 * DONE_CHECKLIST: "CORS is an allowlist, not *").
 * Local Vite dev (8080) and preview (4173) servers are included for testing.
 */
export const ALLOWED_ORIGINS: readonly string[] = [
  SITE_URL,
  "https://www.mulalic.ai-studio.wiki",
  "https://davor-mulalic-c-level-leader-mulalicds-projects.vercel.app",
  "http://localhost:8080",
  "http://localhost:4173",
];

/** Where visitor notifications (contact, CV request, consultation) are delivered — Director decision 2026-09-26. */
export const ADMIN_NOTIFY_EMAIL = "mulalic.davor@outlook.com";

/** Public contact address shown to visitors in outgoing emails (profile.ts `email`). */
export const PUBLIC_CONTACT_EMAIL = "mulalic.davor@outlook.com";

/** Private storage location of the approval-gated CV. */
export const CV_BUCKET = "cv";
export const CV_OBJECT_PATH = "Davor_Mulalic_CV.pdf";
export const CV_DOWNLOAD_FILENAME = "Davor_Mulalic_CV.pdf";
/** Lifetime of a signed CV download URL. */
export const CV_SIGNED_URL_TTL_SECONDS = 600;

/** Rate-limit budgets per action: attempts per window, then a block. */
export const RATE_LIMITS = {
  cvRequest: { maxAttempts: 5, windowMinutes: 15, blockMinutes: 60 },
  cvStatus: { maxAttempts: 20, windowMinutes: 15, blockMinutes: 30 },
  contact: { maxAttempts: 5, windowMinutes: 60, blockMinutes: 60 },
  consultation: { maxAttempts: 3, windowMinutes: 60, blockMinutes: 60 },
  chat: { maxAttempts: 30, windowMinutes: 10, blockMinutes: 30 },
} as const;

/** Resend REST endpoint. */
export const RESEND_API_URL = "https://api.resend.com/emails";
/** Retry budget for transient email failures (429 / 5xx). */
export const EMAIL_MAX_ATTEMPTS = 4;
export const EMAIL_BASE_BACKOFF_MS = 400;
export const EMAIL_MAX_BACKOFF_MS = 4000;

/** Chatbot generation settings (sized for the longest expected answer — A-5). */
export const CHAT_MAX_OUTPUT_TOKENS = 2048;
export const CHAT_TEMPERATURE = 0.3;
