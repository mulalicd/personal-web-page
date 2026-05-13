 import { z } from "zod";
 
 // Email validation schema
 export const emailSchema = z
   .string()
   .trim()
   .min(1, "Email is required")
   .email("Invalid email address")
   .max(255, "Email must be less than 255 characters");
 
 // Name validation schema
 export const nameSchema = z
   .string()
   .trim()
   .min(1, "Name is required")
   .max(100, "Name must be less than 100 characters")
   .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");
 
 // Optional name schema
 export const optionalNameSchema = z
   .string()
   .trim()
   .max(100, "Name must be less than 100 characters")
   .regex(/^[a-zA-ZÀ-ÿ\s'-]*$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
   .optional()
   .or(z.literal(""));
 
 // Message validation schema
 export const messageSchema = z
   .string()
   .trim()
   .max(2000, "Message must be less than 2000 characters")
   .optional()
   .or(z.literal(""));
 
 // Organization validation schema
 export const organizationSchema = z
   .string()
   .trim()
   .max(200, "Organization name must be less than 200 characters")
   .optional()
   .or(z.literal(""));
 
 // CV Request schema
 export const cvRequestSchema = z.object({
   email: emailSchema,
   name: optionalNameSchema,
 });
 
 // Consultation request schema
 export const consultationRequestSchema = z.object({
   name: nameSchema,
   email: emailSchema,
   message: messageSchema,
 });
 
 // Contact form schema
 export const contactFormSchema = z.object({
   name: nameSchema,
   email: emailSchema,
   organization: organizationSchema,
   interest: z.string().max(100).optional(),
   message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
 });
 
 // Login schema
 export const loginSchema = z.object({
   email: emailSchema,
   password: z.string().min(8, "Password must be at least 8 characters"),
 });
 
 export type CVRequestInput = z.infer<typeof cvRequestSchema>;
 export type ConsultationRequestInput = z.infer<typeof consultationRequestSchema>;
 export type ContactFormInput = z.infer<typeof contactFormSchema>;
 export type LoginInput = z.infer<typeof loginSchema>;