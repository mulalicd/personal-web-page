/**
 * AIProvider — the only way business code talks to an AI model
 * (Commander A-5, DL-005). Swapping providers = new class + factory change.
 */

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  maxTokens: number;
  temperature: number;
}

export interface AIProvider {
  /**
   * Stream a chat completion as plain-text chunks.
   * @param system - System prompt.
   * @param turns - Conversation, oldest first; the last turn is the user's.
   * @param options - Generation limits.
   * @throws AIProviderError when the provider rejects or fails the request.
   */
  streamChat(system: string, turns: ChatTurn[], options: GenerateOptions): AsyncIterable<string>;
}

/** Provider failure with a machine-readable reason for the caller. */
export class AIProviderError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_CONFIGURED" | "RATE_LIMITED" | "UNAVAILABLE",
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}
