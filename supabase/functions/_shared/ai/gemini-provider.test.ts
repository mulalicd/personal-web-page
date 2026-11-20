/**
 * Self-healing model fallback (Director requirement 2026-11-20).
 * Run: npx -y deno@2 test --allow-env supabase/functions/_shared/ai/gemini-provider.test.ts
 */
import { GeminiProvider } from "./gemini-provider.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/** Fake Google API: every preferred alias is retired; only `liveModel` exists. */
function fakeGoogle(liveModel: string, calls: string[]): typeof fetch {
  return ((input: string | URL | Request) => {
    const url = String(input instanceof Request ? input.url : input);
    calls.push(url);
    if (url.includes("/models?")) {
      return Promise.resolve(Response.json({
        models: [
          { name: "models/gemini-9.0-flash-preview", supportedGenerationMethods: ["generateContent"] },
          { name: "models/text-embedding-004", supportedGenerationMethods: ["embedContent"] },
          { name: `models/${liveModel}`, supportedGenerationMethods: ["generateContent"] },
          { name: "models/gemini-2.0-flash", supportedGenerationMethods: ["generateContent"] },
        ],
      }));
    }
    if (url.includes(`/${liveModel}:streamGenerateContent`)) {
      const sse = 'data: {"candidates":[{"content":{"parts":[{"text":"Hello from the new model"}]}}]}\n\n';
      return Promise.resolve(new Response(sse, { status: 200 }));
    }
    return Promise.resolve(Response.json({ error: { status: "NOT_FOUND" } }, { status: 404 }));
  }) as typeof fetch;
}

Deno.test("falls back to the newest stable Flash model when every preferred model is retired", async () => {
  const calls: string[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = fakeGoogle("gemini-5.0-flash", calls);
  try {
    const provider = new GeminiProvider(["test-key"]);
    let text = "";
    for await (const chunk of provider.streamChat("system", [{ role: "user", content: "hi" }], { maxTokens: 64, temperature: 0.3 })) {
      text += chunk;
    }
    assert(text === "Hello from the new model", `unexpected answer: ${text}`);
    assert(calls.some((url) => url.includes("gemini-flash-lite-latest:")), "preferred alias was not tried first");
    assert(calls.some((url) => url.includes("gemini-flash-latest:")), "second preferred alias was not tried");
    assert(!calls.some((url) => url.includes("preview")), "a preview model was tried");
    const newest = calls.findIndex((url) => url.includes("gemini-5.0-flash:"));
    const older = calls.findIndex((url) => url.includes("gemini-2.0-flash:"));
    assert(newest !== -1 && (older === -1 || newest < older), "newest model was not tried first");
  } finally {
    globalThis.fetch = realFetch;
  }
});
