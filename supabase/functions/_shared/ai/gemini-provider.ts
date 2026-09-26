/**
 * Gemini implementation of AIProvider (DL-005), via the REST streaming API.
 * Secrets: GEMINI_API_KEY_1 … GEMINI_API_KEY_n (DL-005 multi-key pattern).
 */
import { AIProviderError, type AIProvider, type ChatTurn, type GenerateOptions } from "./ai-provider.interface.ts";

/**
 * Models tried in order (PDL-005). Primary: the alias the Director chose.
 * Fallback: a stable Flash-Lite model with its own free-tier quota — used when
 * the primary is overloaded (503) or out of requests-per-minute (429).
 */
export const GEMINI_MODELS: readonly string[] = ["gemini-flash-latest", "gemini-3.5-flash-lite"];
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
/** Pause before retrying the same model+key after a 5xx overload (seen live 2026-09-26). */
const GEMINI_OVERLOAD_RETRY_MS = 700;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GeminiChunk {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

export class GeminiProvider implements AIProvider {
  /** @param apiKeys - One or more keys; each has its own free-tier quota. */
  constructor(private readonly apiKeys: readonly string[]) {}

  /**
   * Try every model × key combination until one accepts the request.
   * 429 (quota) and 404 (model unavailable) move on immediately; 5xx gets one
   * short retry first. Nothing is streamed until a request succeeds, so the
   * visitor never sees the failed attempts.
   */
  private async open(body: string): Promise<Response> {
    let last: Response | null = null;
    for (const model of GEMINI_MODELS) {
      const url = `${GEMINI_API_BASE}/${model}:streamGenerateContent?alt=sse`;
      for (const key of this.apiKeys) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          let response: Response;
          try {
            response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": key },
              body,
            });
          } catch (error) {
            console.warn(JSON.stringify({ level: "warn", location: "GeminiProvider", model, network: String(error) }));
            break;
          }
          if (response.ok && response.body) return response;
          const overloaded = response.status >= 500;
          const tryNext = overloaded || response.status === 429 || response.status === 404;
          console.warn(JSON.stringify({ level: "warn", location: "GeminiProvider", model, status: response.status, attempt }));
          if (!tryNext) return response; // e.g. 400/403: a config problem, report it
          if (last) await last.body?.cancel();
          last = response;
          if (overloaded && attempt === 1) {
            await sleep(GEMINI_OVERLOAD_RETRY_MS);
            continue;
          }
          break;
        }
      }
    }
    if (!last) throw new AIProviderError("Gemini: no response from any model", "UNAVAILABLE");
    return last;
  }

  async *streamChat(system: string, turns: ChatTurn[], options: GenerateOptions): AsyncIterable<string> {
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((turn) => ({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.content }],
      })),
      generationConfig: { maxOutputTokens: options.maxTokens, temperature: options.temperature },
    });

    const response = await this.open(body);

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
