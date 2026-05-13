/**
 * Lightweight client-side analytics helper.
 *
 * Sinks:
 *  1. `console.info("[analytics]", ...)` — captured by Lovable's project
 *     analytics dashboard.
 *  2. Custom DOM event "lovable:analytics" for future integrations
 *     (Plausible / GA / Umami) without changing call-sites.
 *
 * Zero deps, zero cost, zero PII by default.
 */

export type AnalyticsEvent =
  // CTA / navigation
  | "cta_book_consultation_click"
  | "cta_view_experience_click"
  | "cta_download_cv_click"
  // Dialog lifecycle
  | "dialog_cv_request_open"
  | "dialog_cv_request_submit_success"
  | "dialog_cv_request_submit_error"
  | "dialog_cv_request_rate_limited"
  | "dialog_consultation_open"
  | "dialog_consultation_submit_success"
  | "dialog_consultation_submit_error"
  | "dialog_consultation_rate_limited"
  // Contact form
  | "contact_form_submit_success"
  | "contact_form_submit_error"
  | "contact_form_validation_error"
  // CV file download (after approval)
  | "cv_file_download"
  | "cv_download_started"
  | "cv_download_confirm_open"
  | "cv_download_confirmed"
  | "cv_download_cancelled"
  // CV status page
  | "cv_status_check_success"
  | "cv_status_check_not_found"
  | "cv_status_check_error"
  | "cv_status_validation_error"
  // Section visibility
  | "section_view";

export type EventResult = "success" | "error" | "rate_limited" | "validation_error" | "info";

export interface AnalyticsPayload {
  /** Where the event originated, e.g. "hero", "navigation", "footer", "cv_status_page" */
  source?: string;
  /** Outcome class — drives funnel analysis */
  result?: EventResult;
  /** Machine-readable error code (e.g. "ZodError", "FunctionsHttpError", "not_found") */
  error_code?: string;
  /** Human-readable error message */
  error_message?: string;
  /** Last visible section when this event fired (auto-attached) */
  last_section?: string;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Globally tracked "last visible section" — auto-attached to every event.
 * Updated by useSectionTracking() via the section_view event.
 */
let lastVisibleSection: string | null = null;

export function setLastVisibleSection(id: string): void {
  lastVisibleSection = id;
}

export function getLastVisibleSection(): string | null {
  return lastVisibleSection;
}

const STORAGE_KEY = "lovable:analytics:events";
const MAX_BUFFERED = 500;

export interface StoredAnalyticsEvent extends AnalyticsPayload {
  event: AnalyticsEvent;
  timestamp: string;
  route: string;
  referrer: string | null;
  last_section: string | null;
}

function appendToBuffer(entry: StoredAnalyticsEvent): void {
  if (typeof localStorage === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: StoredAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    arr.push(entry);
    // Keep last MAX_BUFFERED only
    const trimmed = arr.length > MAX_BUFFERED ? arr.slice(-MAX_BUFFERED) : arr;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Quota or parse error — ignore
  }
}

export function getStoredEvents(): StoredAnalyticsEvent[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearStoredEvents(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Emit an analytics event. Safe to call from any component.
 * Never throws — analytics must never break user flow.
 */
export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  try {
    const enriched: StoredAnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      route: typeof window !== "undefined" ? window.location.pathname : "",
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      last_section: lastVisibleSection,
      ...payload,
    };

    // eslint-disable-next-line no-console
    console.info("[analytics]", event, enriched);

    appendToBuffer(enriched);

    if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("lovable:analytics", { detail: enriched })
      );
    }
  } catch {
    // Swallow — analytics must never break UX
  }
}
