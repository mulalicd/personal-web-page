import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendEmailWithRetry } from "../_shared/email-retry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-idempotency-key",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(input: string | undefined | null, maxLength: number): string {
  if (!input) return "";
  return input.trim().slice(0, maxLength).replace(/[<>]/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const name = sanitize(body.name, 100);
    const email = sanitize(body.email, 255)?.toLowerCase();
    const organization = sanitize(body.organization, 200);
    const interest = sanitize(body.interest, 100);
    const message = sanitize(body.message, 2000);
    const idempotencyKey =
      sanitize(body.idempotencyKey, 100) ||
      req.headers.get("x-idempotency-key") ||
      undefined;

    if (!name || !email || !emailRegex.test(email) || !message) {
      return new Response(
        JSON.stringify({ error: "Name, valid email, and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #c8a870; padding-bottom: 10px;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Name:</td><td style="padding: 8px 0;">${name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          ${organization ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Organization:</td><td style="padding: 8px 0;">${organization}</td></tr>` : ""}
          ${interest ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Interest:</td><td style="padding: 8px 0;">${interest}</td></tr>` : ""}
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
          <h3 style="margin: 0 0 10px; color: #555;">Message:</h3>
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `;

    const result = await sendEmailWithRetry({
      functionName: "send-contact-email",
      recipientEmail: email,
      idempotencyKey,
      payload: {
        from: "Davor Mulalić Website <onboarding@resend.dev>",
        to: ["mulalic71@gmail.com"],
        reply_to: email,
        subject: `[Website Contact] ${interest || "General Inquiry"} from ${name}`,
        html: htmlBody,
      },
    });

    if (!result.ok) {
      console.error("Contact send failed:", result.errorCode, result.errorMessage);
      return new Response(
        JSON.stringify({ error: "Failed to send message. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        attempts: result.attempts,
        latency_ms: result.totalMs,
        deduped: !!result.deduped,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: any) {
    console.error("Error in send-contact-email:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to send message. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
