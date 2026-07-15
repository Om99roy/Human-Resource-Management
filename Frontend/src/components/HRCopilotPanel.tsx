import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface HRCopilotPanelProps {
  threadId: string;
  initialInsights?: string[];
}

const HRCopilotPanel = ({ threadId, initialInsights = [] }: HRCopilotPanelProps) => {
  const [messages, setMessages] = useState<Message[]>(
    initialInsights.map((insight, i) => ({
      id: `insight-${i}`,
      role: "assistant",
      content: insight,
      timestamp: new Date(),
    }))
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadIdRef = useRef(threadId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const askCopilot = async (question: string) => {
    if (!question.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);
    scrollToBottom();

    try {
      const res = await fetch("http://localhost:8000/ask-hr-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, thread_id: threadIdRef.current }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const { answer } = (await res.json()) as { answer: string; thread_id: string };

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer || "No response received.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError("HR Copilot is unavailable. Make sure the AI server is running on port 8000.");
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void askCopilot(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-primary mb-1">HR Copilot</p>
        <h2 className="text-xl font-semibold">AI-driven insights for the admin team</h2>
        <p className="text-sm text-text-muted mt-1">Ask anything about attendance, payroll, or employees.</p>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 max-h-[400px] pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">
            No messages yet. Ask a question below.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-2xl border p-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "border-primary/30 bg-primary/10 text-text ml-6"
                : "border-white/10 bg-background/70 text-text-muted"
            }`}
          >
            {msg.role === "assistant" && (
              <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                HR Copilot
              </p>
            )}
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-background/70 p-3 text-sm text-text-muted">
            <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">HR Copilot</p>
            <span className="inline-flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
            </span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 p-3">
        <textarea
          className="w-full h-20 bg-transparent text-sm text-text outline-none resize-none placeholder-text-muted/50"
          placeholder="Ask HR Copilot… (Enter to send, Shift+Enter for newline)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => void askCopilot(input)}
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Thinking…" : "Ask Copilot"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRCopilotPanel;
