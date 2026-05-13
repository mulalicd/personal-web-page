import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(input: string | undefined | null, maxLen: number): string {
  if (!input) return "";
  return input.trim().slice(0, maxLen).replace(/[<>]/g, "");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const name = sanitize(body.name, 100);
    const email = sanitize(body.email, 255).toLowerCase();
    const message = sanitize(body.message, 2000) || null;

    if (!name || name.length < 1) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Please provide a valid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: 3 consultations per email per hour
    const { data: rl, error: rlErr } = await supabase.rpc("check_rate_limit_v2", {
      p_identifier: email,
      p_action_type: "consultation_request",
      p_max_attempts: 3,
      p_window_minutes: 60,
      p_block_minutes: 60,
    });

    if (rlErr) console.error("Rate limit error:", rlErr);

    if (rl && rl.allowed === false) {
      const retryAfter = rl.retry_after ?? 60;
      return new Response(
        JSON.stringify({
          error: "Too many consultation requests. Please wait before trying again.",
          retry_after: retryAfter,
          endpoint: "consultation_request",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
            ...corsHeaders,
          },
        }
      );
    }

    const { data, error } = await supabase
      .from("consultation_requests")
      .insert({ name, email, message })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("submit-consultation error:", err.message);
    return new Response(JSON.stringify({ error: "An error occurred. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
