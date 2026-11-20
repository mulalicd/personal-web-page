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
  /** Which model answered the last call and how long it took to start (operational, no secrets). */
  readonly lastCall: { model: string; ms: number; thinking: boolean } | null;
}

/** Provider failure with a machine-readable reason for the caller. */
export class AIProviderError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_CONFIGURED" | "RATE_LIMITED" | "REJECTED" | "UNAVAILABLE",
    /** Provider's own error enum (e.g. "NOT_FOUND", "PERMISSION_DENIED") — never a message or key. */
    readonly providerStatus?: string,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}
