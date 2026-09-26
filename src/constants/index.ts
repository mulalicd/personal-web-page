/**
 * Global named constants for the React app (Commander E-11: no magic values).
 * Facts about Davor live in src/content/profile.ts, not here.
 */
import { profile } from "@/content/profile";

/** Zoho Bookings calendar for consultations. */
export const BOOKING_CALENDAR_URL = "https://davormulali.zohobookings.eu/#/253150000000046052";

/** Amazon author page listing all of Davor's books. */
export const AMAZON_AUTHOR_URL =
  "https://www.amazon.com/s?i=digital-text&rh=p_27%3ADavor%2BMulali%25C4%2587&s=relevancerank&text=Davor+Mulali%C4%87&ref=dp_byline_sr_ebooks_1";

/** PayPal checkout used by the "Buy" button of the books. */
export const BOOKS_PAYPAL_URL = "https://www.paypal.com/ncp/payment/FKMN5XAS97TEY";

/** Chat: how many previous turns are sent to the assistant (server accepts max 20). */
export const CHAT_HISTORY_LIMIT = 20;
/** Chat: max characters per visitor message (matches chatRequestSchema). */
export const CHAT_MESSAGE_MAX_LENGTH = 2000;

/** Suggested first questions in the chat window. */
export const CHAT_SUGGESTIONS = [
  "What are Davor's key achievements?",
  "Tell me about his books",
  "What industries has he worked in?",
] as const;

/** Scroll offset (px) after which the navigation bar becomes solid. */
export const NAV_SOLID_SCROLL_OFFSET = 20;

/** Generic visitor-facing fallback when the backend is not reachable. */
export const BACKEND_UNAVAILABLE_MESSAGE = `This feature is temporarily unavailable. Please email ${profile.email} directly.`;
