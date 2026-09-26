/**
 * Selects the configured AIProvider. Only Gemini exists today (DL-005).
 */
import { AIProviderError, type AIProvider } from "./ai-provider.interface.ts";
import { GeminiProvider } from "./gemini-provider.ts";

/** Upper bound of GEMINI_API_KEY_n secrets scanned (far above any realistic count). */
const MAX_GEMINI_KEYS = 50;

/**
 * @returns The active provider.
 * @throws AIProviderError("NOT_CONFIGURED") when the API key secret is missing.
 */
export function getAIProvider(): AIProvider {
  // Scan generously (ARCHITECTURE_PATTERNS A-7 gotcha): keys added later must not be ignored.
  const keys: string[] = [];
  for (let index = 1; index <= MAX_GEMINI_KEYS; index++) {
    const key = Deno.env.get(`GEMINI_API_KEY_${index}`);
    if (key) keys.push(key);
  }
  if (keys.length === 0) throw new AIProviderError("GEMINI_API_KEY_1 secret is not set", "NOT_CONFIGURED");
  return new GeminiProvider(keys);
}
