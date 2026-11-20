/**
 * GET /api/keepalive — Vercel Cron, once a day (vercel.json).
 *
 * Supabase pauses free-plan projects after 7 days without activity, which
 * took the chatbot, CV requests and contact form offline (2026-11-20). One
 * cheap read-only database query per day keeps the project active.
 * Uses only the public URL + publishable key (the same values the browser has).
 */
export async function GET(): Promise<Response> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return Response.json({ success: false, error: "Supabase env vars missing", code: "NOT_CONFIGURED" }, { status: 500 });
  }
  try {
    // RLS returns [] to the anon role, but the query still reaches Postgres.
    const response = await fetch(`${url}/rest/v1/cv_requests?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const ok = response.ok;
    console.log(JSON.stringify({ level: ok ? "info" : "error", location: "keepalive", status: response.status }));
    return Response.json({ success: ok, data: { status: response.status } }, { status: ok ? 200 : 502 });
  } catch (error) {
    console.error(JSON.stringify({ level: "error", location: "keepalive", error: String(error) }));
    return Response.json({ success: false, error: "Supabase unreachable", code: "UNREACHABLE" }, { status: 502 });
  }
}
