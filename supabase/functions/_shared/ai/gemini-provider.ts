/**
 * Gemini implementation of AIProvider (DL-005), via the REST streaming API.
 * Secrets: GEMINI_API_KEY_1 … GEMINI_API_KEY_n (DL-005 multi-key pattern).
 */
import { AIProviderError, type AIProvider, type ChatTurn, type GenerateOptions } from "./ai-provider.interface.ts";

/**
 * Preferred models, tried first (PDL-005). Google-maintained aliases that move
 * to each new Flash generation, so a model retirement normally needs no change.
 * Optional secret GEMINI_MODELS ("model-a,model-b") overrides this list.
 */
export const PREFERRED_GEMINI_MODELS: readonly string[] = ["gemini-flash-latest", "gemini-flash-lite-latest"];
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
/** Pause before retrying the same model+key after a 5xx overload (seen live 2026-09-26). */
const GEMINI_OVERLOAD_RETRY_MS = 700;
/** Discovered models are re-listed at most this often per function instance. */
const DISCOVERY_TTL_MS = 6 * 60 * 60 * 1000;
/** How many discovered models are tried after the preferred ones. */
const DISCOVERED_MODEL_LIMIT = 3;
/** Variants that are not a plain text chat model (or not stable enough to rely on). */
const EXCLUDED_MODEL_WORDS = /(preview|exp|tts|image|audio|live|embedding|vision|thinking|learnlm|gemma|computer|robotics)/i;

let discoveryCache: { at: number; models: string[] } | null = null;

/**
 * Self-healing fallback (Director requirement 2026-11-20): ask Google which
 * models this key can use right now and keep the newest stable "flash" ones.
 * A retired model is replaced automatically by its successor.
 * @returns Model ids, newest first; [] when the listing fails (never throws).
 */
export async function discoverGeminiModels(apiKey: string): Promise<string[]> {
  if (discoveryCache && Date.now() - discoveryCache.at < DISCOVERY_TTL_MS) return discoveryCache.models;
  try {
    const response = await fetch(`${GEMINI_API_BASE}?pageSize=200`, { headers: { "x-goog-api-key": apiKey } });
    if (!response.ok) return [];
    const data = (await response.json()) as { models?: Array<{ name?: string; supportedGenerationMethods?: string[] }> };
    const models = (data.models ?? [])
      .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
      .map((model) => (model.name ?? "").replace(/^models\//, ""))
      .filter((id) => /^gemini-/.test(id) && /flash/.test(id) && !EXCLUDED_MODEL_WORDS.test(id))
      .sort(compareModelVersions);
    discoveryCache = { at: Date.now(), models };
    return models;
  } catch {
    return [];
  }
}

/** Newest version first ("gemini-4.0-flash" before "gemini-3.5-flash"); full Flash before Flash-Lite. */
function compareModelVersions(a: string, b: string): number {
  const version = (id: string) => Number(/^gemini-(\d+(?:\.\d+)?)/.exec(id)?.[1] ?? 0);
  if (version(a) !== version(b)) return version(b) - version(a);
  return Number(a.includes("lite")) - Number(b.includes("lite"));
}

function configuredModels(): string[] {
  const override = (Deno.env.get("GEMINI_MODELS") ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  return override.length > 0 ? override : [...PREFERRED_GEMINI_MODELS];
}

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
    const preferred = configuredModels();
    const first = await this.tryModels(preferred, body);
    if (first.ok) return first.response;
    // Every preferred model failed: discover what Google offers today and try
    // the newest stable Flash models before giving up.
    const discovered = (await discoverGeminiModels(this.apiKeys[0]))
      .filter((model) => !preferred.includes(model))
      .slice(0, DISCOVERED_MODEL_LIMIT);
    if (discovered.length > 0) {
      console.warn(JSON.stringify({ level: "warn", location: "GeminiProvider", fallbackToDiscovered: discovered }));
      if (first.response) await first.response.body?.cancel();
      const second = await this.tryModels(discovered, body);
      if (second.response) return second.response;
    }
    if (!first.response) throw new AIProviderError("Gemini: no response from any model", "UNAVAILABLE");
    return first.response;
  }

  /** @returns the first successful response, or the last failed one (ok=false). */
  private async tryModels(
    models: readonly string[],
    body: string,
  ): Promise<{ ok: true; response: Response } | { ok: false; response: Response | null }> {
    let last: Response | null = null;
    for (const model of models) {
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
          if (response.ok && response.body) {
            if (last) await last.body?.cancel();
            return { ok: true, response };
          }
          const overloaded = response.status >= 500;
          const tryNext = overloaded || response.status === 429 || response.status === 404;
          console.warn(JSON.stringify({ level: "warn", location: "GeminiProvider", model, status: response.status, attempt }));
          if (!tryNext) {
            // 400/403: a key or request problem — no other model will fix it.
            if (last) await last.body?.cancel();
            return { ok: false, response };
          }
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
    return { ok: false, response: last };
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
