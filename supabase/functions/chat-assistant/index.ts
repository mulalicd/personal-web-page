/**
 * POST /functions/v1/chat-assistant
 * Role required: none (public visitor chatbot)
 * Body: chatRequestSchema — { messages: { role: "user" | "assistant", content }[] } (max 20)
 * Response: text/event-stream of `data: {"text": "..."}` lines, ending with `data: [DONE]`
 * Errors (JSON { success: false, error, code }): 400 (validation), 429 (rate limit),
 *   503 (AI not configured / unavailable), 500 (unexpected)
 */
import { chatRequestSchema } from "../../../src/lib/validation/schemas.ts";
import { buildChatSystemPrompt } from "../../../src/content/knowledge.ts";
import { getAIProvider } from "../_shared/ai/ai-provider.factory.ts";
import { AIProviderError } from "../_shared/ai/ai-provider.interface.ts";
import { CHAT_MAX_OUTPUT_TOKENS, CHAT_TEMPERATURE, RATE_LIMITS } from "../_shared/constants.ts";
import { clientFingerprint, corsHeaders, fail, handlePreflight, logError, rateLimited } from "../_shared/http.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { serviceClient } from "../_shared/supabase.ts";

// Built once per instance: the knowledge base only changes on redeploy.
const SYSTEM_PROMPT = buildChatSystemPrompt();
const encoder = new TextEncoder();

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return fail(req, 405, "Method not allowed.", "METHOD_NOT_ALLOWED");

  try {
    const parsed = chatRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail(req, 400, "Please type a message.", "VALIDATION_ERROR");
    const turns = parsed.data.messages;
    if (turns[turns.length - 1].role !== "user") {
      return fail(req, 400, "Please type a message.", "VALIDATION_ERROR");
    }

    const db = serviceClient();
    const limit = await checkRateLimit(db, await clientFingerprint(req), "chat", RATE_LIMITS.chat);
    if (!limit.allowed) return rateLimited(req, limit.retryAfter);

    const stream = getAIProvider().streamChat(SYSTEM_PROMPT, turns, {
      maxTokens: CHAT_MAX_OUTPUT_TOKENS,
      temperature: CHAT_TEMPERATURE,
    });
    const iterator = stream[Symbol.asyncIterator]();
    // Pull the first chunk before answering so provider errors become a clean JSON error.
    const first = await iterator.next();

    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          if (!first.done) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: first.value })}\n\n`));
          while (true) {
            const next = await iterator.next();
            if (next.done) break;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: next.value })}\n\n`));
          }
        } catch (error) {
          logError("chat-assistant.stream", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "The answer was interrupted. Please ask again." })}\n\n`));
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: { ...corsHeaders(req), "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    if (error instanceof AIProviderError) {
      logError("chat-assistant", error, { code: error.code });
      if (error.code === "RATE_LIMITED") return rateLimited(req, 60);
      // Distinct machine codes (no provider details) so the operator can tell a
      // missing/invalid key or model (config) from a provider outage (wait).
      const code = error.providerStatus ? `AI_${error.code}_${error.providerStatus}` : `AI_${error.code}`;
      return fail(req, 503, "The assistant is temporarily unavailable. Please try again later.", code);
    }
    logError("chat-assistant", error);
    return fail(req, 500, "Something went wrong. Please try again.", "INTERNAL_ERROR");
  }
});
