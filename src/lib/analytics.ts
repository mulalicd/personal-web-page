/**
 * analytics.ts — visitor analytics through Vercel Web Analytics (PDL-003).
 *
 * Page views are collected automatically by <Analytics /> in App.tsx.
 * `track()` sends named custom events (visible on Vercel plans that support
 * custom events; otherwise silently ignored by Vercel). Replaces the old
 * localStorage-only implementation, which only ever showed the admin's own
 * browser. No personal data is ever sent — only event names and small enums.
 */
import { track as vercelTrack } from "@vercel/analytics";

export type AnalyticsEvent =
  | "cta_book_consultation_click"
  | "cta_view_experience_click"
  | "cta_download_cv_click"
  | "dialog_cv_request_open"
  | "dialog_cv_request_submit_success"
  | "dialog_cv_request_submit_error"
  | "dialog_consultation_open"
  | "dialog_consultation_submit_success"
  | "dialog_consultation_submit_error"
  | "contact_form_submit_success"
  | "contact_form_submit_error"
  | "contact_form_validation_error"
  | "cv_download_started"
  | "cv_status_check_success"
  | "cv_status_check_error"
  | "section_view";

export type EventResult = "success" | "error" | "rate_limited" | "validation_error" | "info";

/** Flat, non-personal event properties (Vercel accepts string/number/boolean/null). */
export interface AnalyticsPayload {
  source?: string;
  result?: EventResult;
  error_code?: string;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Record a custom analytics event. Never throws — analytics must never break the UX.
 * @param event - Event name.
 * @param payload - Non-personal context.
 */
export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  try {
    const properties: Record<string, string | number | boolean | null> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) properties[key] = value;
    }
    vercelTrack(event, properties);
  } catch (error) {
    console.warn("[analytics] event dropped:", event, error);
  }
}
