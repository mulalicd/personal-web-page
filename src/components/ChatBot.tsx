import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Loader2 } from "lucide-react";
import { DMLogo } from "@/components/DMLogo";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: "Connection failed" }));
      onError(errorData.error || "Something went wrong. Please try again.");
      return;
    }

    if (!resp.body) {
      onError("No response received");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // Flush remaining buffer
    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (err) {
    onError("Connection failed. Please check your internet and try again.");
  }
}

// Strip all markdown and render clean plain text
function stripMarkdown(text: string): string {
  return text
    // Remove headings (###, ##, #)
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    // Remove italic *text* or _text_
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, "$1")
    // Remove inline code `text`
    .replace(/`([^`]+)`/g, "$1")
    // Remove code blocks ```text```
    .replace(/```[\s\S]*?```/g, "")
    // Remove links [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Remove blockquotes >
    .replace(/^>\s?/gm, "")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    // Clean up bullet markers (- or •) but keep the text
    .replace(/^[-•]\s+/gm, "• ");
}

function renderContent(text: string) {
  const clean = stripMarkdown(text);
  return clean
    .split("\n")
    .map((line, i) => {
      if (line.startsWith("• ")) {
        return (
          <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p key={i} className="text-sm leading-relaxed">
          {line}
        </p>
      );
    });
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Hide pulse after first open
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = "";

    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      onDelta: upsertAssistant,
      onDone: () => setIsLoading(false),
      onError: (error) => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${error}` },
        ]);
        setIsLoading(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <DMLogo size={28} />
            </motion.div>
          )}
        </AnimatePresence>
        {showPulse && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[min(500px,70vh)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
              <div className="w-8 h-8 flex items-center justify-center">
                <DMLogo size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">AI Assistant</p>
                <p className="text-xs text-muted-foreground truncate">Ask me about Davor Mulalić</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto">
                    <DMLogo size={40} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hi! I'm Davor's AI assistant. Ask me about his experience, books, portfolio, or anything else!
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {["What are Davor's key achievements?", "Tell me about his books", "What industries has he worked in?"].map(
                      (q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setInput(q);
                            setTimeout(() => handleSend(), 50);
                          }}
                          className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                        >
                          {q}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <DMLogo size={20} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-secondary-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "assistant"
                      ? renderContent(msg.content)
                      : <p className="text-sm">{msg.content}</p>}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <DMLogo size={20} />
                  </div>
                  <div className="bg-secondary px-3 py-2 rounded-xl rounded-bl-sm">
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about Davor..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
