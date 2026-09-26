/**
 * schemas.ts — every Zod schema of the project (Commander E-2, M-7).
 *
 * Shared by the React app (Vite resolves the bare "zod" import from
 * node_modules) and by the Supabase Edge Functions (Deno resolves "zod"
 * through supabase/functions/deno.json). Keep this file dependency-free
 * apart from zod.
 */
import { z } from "zod";

/** Allowed "area of interest" values of the contact form. */
export const CONTACT_INTEREST_OPTIONS = [
  "Executive Advisory",
  "AI Strategy Consulting",
  "Speaking Engagement",
  "Other",
] as const;

// Any Unicode letter or combining mark (č, ć, š, ž, đ, ü, é, …), then letters,
// spaces, apostrophes, periods and hyphens. The old ASCII-only rule rejected
// "Mulalić" — the site owner's own surname.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u;
const NAME_MESSAGE = "Name can only contain letters, spaces, apostrophes, periods and hyphens";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email must be less than 255 characters")
  .email("Please enter a valid email address")
  .transform((value) => value.toLowerCase());

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .regex(NAME_PATTERN, NAME_MESSAGE);

export const optionalNameSchema = z
  .string()
  .trim()
  .max(100, "Name must be less than 100 characters")
  .refine((value) => value === "" || NAME_PATTERN.test(value), NAME_MESSAGE)
  .optional();

export const idempotencyKeySchema = z.string().trim().min(8).max(100).optional();

export const cvRequestSchema = z.object({
  email: emailSchema,
  name: optionalNameSchema,
  idempotencyKey: idempotencyKeySchema,
});

export const consultationRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: z.string().trim().max(2000, "Message must be less than 2000 characters").optional(),
});

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  organization: z.string().trim().max(200, "Organization name must be less than 200 characters").optional(),
  interest: z.enum(CONTACT_INTEREST_OPTIONS).optional(),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
  idempotencyKey: idempotencyKeySchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/** Chat history sent to the chat-assistant function (last 20 turns max). */
export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

/** Personal CV link token from the approval email. */
export const cvStatusSchema = z.object({
  token: z.string().uuid("This link is not valid"),
});

/** Admin decision on a CV request. */
export const processCvRequestSchema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
});

export type CvRequestInput = z.infer<typeof cvRequestSchema>;
export type ConsultationRequestInput = z.infer<typeof consultationRequestSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type ProcessCvRequestInput = z.infer<typeof processCvRequestSchema>;
