/**
 * Selects the configured AIProvider. Only Gemini exists today (DL-005).
 */
import { AIProviderError, type AIProvider } from "./ai-provider.interface.ts";
import { GeminiProvider } from "./gemini-provider.ts";

/**
 * @returns The active provider.
 * @throws AIProviderError("NOT_CONFIGURED") when the API key secret is missing.
 */
export function getAIProvider(): AIProvider {
  const apiKey = Deno.env.get("GEMINI_API_KEY_1");
  if (!apiKey) throw new AIProviderError("GEMINI_API_KEY_1 secret is not set", "NOT_CONFIGURED");
  return new GeminiProvider(apiKey);
}
