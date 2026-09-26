/**
 * Gemini implementation of AIProvider (DL-005), via the REST streaming API.
 * Secret: GEMINI_API_KEY_1.
 */
import { AIProviderError, type AIProvider, type ChatTurn, type GenerateOptions } from "./ai-provider.interface.ts";

/** Exact model string mandated by Commander DL-005. */
export const GEMINI_GENERATION_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiChunk {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

export class GeminiProvider implements AIProvider {
  constructor(private readonly apiKey: string) {}

  async *streamChat(system: string, turns: ChatTurn[], options: GenerateOptions): AsyncIterable<string> {
    const url = `${GEMINI_API_BASE}/${GEMINI_GENERATION_MODEL}:streamGenerateContent?alt=sse`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: turns.map((turn) => ({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.content }],
        })),
        generationConfig: { maxOutputTokens: options.maxTokens, temperature: options.temperature },
      }),
    });

    if (!response.ok || !response.body) {
      // Log status + allowlisted error status only; never the key or request (E-8).
      const errorBody = (await response.json().catch(() => null)) as { error?: { status?: string } } | null;
      const detail = `Gemini HTTP ${response.status} ${errorBody?.error?.status ?? ""}`.trim();
      if (response.status === 429) throw new AIProviderError(detail, "RATE_LIMITED");
      throw new AIProviderError(detail, "UNAVAILABLE");
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
