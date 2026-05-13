import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmailWithRetry } from "../_shared/email-retry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roleData } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body = await req.json();
    const { email, name, action, token: cvToken } = body;

    if (!email || !action || !cvToken) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY_1") || Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      console.error("Missing API keys");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const displayName = name || "there";
    let subject: string;
    let htmlBody: string;

    if (action === "approve") {
      subject = "Your CV Request Has Been Approved — Davor Mulalić";
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #c8a870; padding-bottom: 10px;">CV Request Approved ✅</h2>
          <p>Hi ${displayName},</p>
          <p>Your request to access Davor Mulalić's CV has been <strong>approved</strong>.</p>
          <p>You can now check your request status and access the CV at:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://mulalic.ai-studio.wiki/cv-status" 
               style="background: #c8a870; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Access Your CV
            </a>
          </p>
          <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #aaa; font-size: 12px;">Davor Mulalić — CEO & AI Strategist</p>
        </div>
      `;
    } else {
      subject = "CV Request Update — Davor Mulalić";
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #c8a870; padding-bottom: 10px;">CV Request Update</h2>
          <p>Hi ${displayName},</p>
          <p>Thank you for your interest. Unfortunately, your CV request could not be approved at this time.</p>
          <p>Feel free to reach out directly for any questions:</p>
          <p><a href="mailto:mulalic.davor@outlook.com">mulalic.davor@outlook.com</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #aaa; font-size: 12px;">Davor Mulalić — CEO & AI Strategist</p>
        </div>
      `;
    }

    console.log(`Sending ${action} notification to:`, email.substring(0, 3) + "***");

    const result = await sendEmailWithRetry({
      functionName: "notify-cv-approval",
      recipientEmail: email,
      idempotencyKey: `cv-${action}-${cvToken}`,
      payload: {
        from: "Davor Mulalić <onboarding@resend.dev>",
        to: ["mulalic71@gmail.com"],
        reply_to: "mulalic.davor@outlook.com",
        subject: `[CV Request — ${email}] ${subject}`,
        html: htmlBody,
      },
    });

    if (!result.ok) {
      console.error("notify-cv-approval failed:", result.errorCode, result.errorMessage);
      return new Response(
        JSON.stringify({ error: "Failed to send notification" }),
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
    console.error("Error in notify-cv-approval:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
