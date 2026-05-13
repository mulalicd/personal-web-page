 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 // Email validation regex
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
 // Sanitize string input
 function sanitizeString(input: string | undefined | null, maxLength: number): string {
   if (!input) return "";
   return input
     .trim()
     .slice(0, maxLength)
     .replace(/[<>]/g, "");
 }
 
 const handler = async (req: Request): Promise<Response> => {
   console.log("Check CV status function called");
   
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     const body = await req.json();
     
     // Sanitize and validate email
     const email = sanitizeString(body.email, 255)?.toLowerCase();
 
     if (!email || !emailRegex.test(email)) {
       return new Response(
         JSON.stringify({ error: "Please provide a valid email address" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     console.log("Checking status for email (hashed):", email.substring(0, 3) + "***");
 
     // Create Supabase client with service role
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     // Check rate limit
     const { data: rateLimitOk } = await supabase
       .rpc("check_rate_limit", {
         p_identifier: email,
         p_action_type: "cv_status_check",
         p_max_attempts: 10,
         p_window_minutes: 5,
         p_block_minutes: 30,
       });
 
     if (rateLimitOk === false) {
       return new Response(
         JSON.stringify({ error: "Too many requests. Please try again later." }),
         { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     // Query CV request - only return safe fields (no token, no internal id)
     const { data, error } = await supabase
       .from("cv_requests")
       .select("status, name, created_at")
       .eq("email", email)
       .order("created_at", { ascending: false })
       .limit(1)
       .maybeSingle();
 
     if (error) {
       console.error("Database error:", error.message);
       throw error;
     }
 
     if (!data) {
       return new Response(
         JSON.stringify({ found: false }),
         { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     // Return only necessary status info (no sensitive data)
     return new Response(
       JSON.stringify({
         found: true,
         status: data.status,
         name: data.name,
         created_at: data.created_at,
       }),
       { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
     );
   } catch (error: any) {
     console.error("Error in check-cv-status:", error.message);
     return new Response(
       JSON.stringify({ error: "An error occurred. Please try again." }),
       { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
     );
   }
 };
 
 serve(handler);