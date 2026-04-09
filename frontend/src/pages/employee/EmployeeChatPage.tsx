import { useState, useRef } from "react";
import { useAuth } from "../../state/auth";
import { PageHeader } from "../../components/common/PageHeader";
import { apiClient } from "../../config/api";
import { Send, Bot, User, Sparkles, FileText, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  sources?: Array<{ name: string; section: string }>;
  timestamp: Date;
};

const SUGGESTIONS = [
  "What should I do today?",
  "How do I apply for leave?",
  "Where do I upload documents?",
  "What is the VPN setup process?",
  "What's the payroll schedule?",
];

export const EmployeeChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Hi! 👋 I'm your onboarding assistant. I can help you with tasks, documents, policies, and team information. What would you like to know?",
      sources: [],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    scrollToBottom();

    try {
      const result = await apiClient<{ answer: string; sources: Array<{ name: string; section: string }> }>(
        "/api/chat/query",
        {
          method: "POST",
          body: { question: text.trim(), context: `User: ${user?.displayName}, Role: ${user?.role}` },
        },
      );

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        content: result.answer,
        sources: result.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        content: "I'm having trouble connecting right now. Please try again later or contact HR at hr@company.com.",
        sources: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="animate-fade-in flex h-[calc(100vh-6rem)] flex-col">
      <PageHeader title="Chatbot" subtitle="Ask questions about onboarding, policies, or anything else." />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "bot" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                  <Bot size={16} />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-navy-900 text-white" : "bg-slate-50 text-slate-700"}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-200/50 pt-2">
                    {msg.sources.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-200">
                        <FileText size={10} />
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking…
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-slate-400">
            <Sparkles size={12} className="mr-1 inline" />
            Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-navy-300 hover:bg-navy-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          disabled={isTyping}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-white transition-all hover:bg-navy-800 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
