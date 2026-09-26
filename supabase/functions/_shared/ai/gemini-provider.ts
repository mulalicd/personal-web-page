/**
 * Gemini implementation of AIProvider (DL-005), via the REST streaming API.
 * Secret: GEMINI_API_KEY_1.
 */
import { AIProviderError, type AIProvider, type ChatTurn, type GenerateOptions } from "./ai-provider.interface.ts";

/**
 * Model alias chosen by the Director on 2026-09-26 (PDL-005): Google keeps it
 * pointed at the newest Flash model. Deviates from Commander DL-005, whose
 * pinned "gemini-2.5-flash" now returns NOT_FOUND.
 */
export const GEMINI_GENERATION_MODEL = "gemini-flash-latest";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
/**
 * Google answers 503 UNAVAILABLE / 500 while a model is overloaded — usually for
 * a second or two (seen live 2026-09-26: 1 of 3 requests). Retry before
 * streaming starts; nothing has reached the visitor yet, so it is invisible.
 */
const GEMINI_MAX_ATTEMPTS = 3;
const GEMINI_RETRY_BASE_MS = 700;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GeminiChunk {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

export class GeminiProvider implements AIProvider {
  constructor(private readonly apiKey: string) {}

  async *streamChat(system: string, turns: ChatTurn[], options: GenerateOptions): AsyncIterable<string> {
    const url = `${GEMINI_API_BASE}/${GEMINI_GENERATION_MODEL}:streamGenerateContent?alt=sse`;
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((turn) => ({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.content }],
      })),
      generationConfig: { maxOutputTokens: options.maxTokens, temperature: options.temperature },
    });

    let response: Response | null = null;
    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
      try {
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
          body,
        });
      } catch (error) {
        if (attempt === GEMINI_MAX_ATTEMPTS) throw new AIProviderError(`Gemini network error: ${String(error)}`, "UNAVAILABLE");
        await sleep(GEMINI_RETRY_BASE_MS * attempt);
        continue;
      }
      const transient = response.status >= 500 || response.status === 429;
      if (!transient || attempt === GEMINI_MAX_ATTEMPTS) break;
      await response.body?.cancel();
      console.warn(JSON.stringify({ level: "warn", location: "GeminiProvider", status: response.status, attempt }));
      await sleep(GEMINI_RETRY_BASE_MS * attempt);
    }
    if (!response) throw new AIProviderError("Gemini: no response", "UNAVAILABLE");

    if (!response.ok || !response.body) {
      // Log status + allowlisted error status only; never the key or request (E-8).
      const errorBody = (await response.json().catch(() => null)) as { error?: { status?: string } } | null;
      const detail = `Gemini HTTP ${response.status} ${errorBody?.error?.status ?? ""}`.trim();
      const providerStatus = errorBody?.error?.status?.replace(/[^A-Z_]/g, "") || undefined;
      if (response.status === 429) throw new AIProviderError(detail, "RATE_LIMITED", providerStatus);
      // 4xx = our request/key/model is wrong (fix config); 5xx = provider outage (wait).
      if (response.status >= 400 && response.status < 500) throw new AIProviderError(detail, "REJECTED", providerStatus);
      throw new AIProviderError(detail, "UNAVAILABLE", providerStatus);
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    let malformedChunks = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      let newline: number;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line.startsWith("data:")) continue;
        try {
          const chunk = JSON.parse(line.slice(5).trim()) as GeminiChunk;
          const text = chunk.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
          if (text) yield text;
        } catch {
          malformedChunks++;
        }
      }
    }
    // A 200 with unparseable chunks is still a failure worth seeing (E-5, AUDIT-003).
    if (malformedChunks > 0) console.error(JSON.stringify({ level: "error", location: "GeminiProvider", malformedChunks }));
  }
}
