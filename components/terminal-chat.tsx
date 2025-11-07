"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Terminal, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface TerminalChatProps {
  sessionId?: string;
}

export function TerminalChat({ sessionId }: TerminalChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Mr.Promth AI Agent System v1.0.0\nพร้อมรับคำสั่ง...",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // TODO: Call API to agent-chain
      const response = await fetch("/api/agent-chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || "default",
          prompt: input,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.result || "ได้รับคำสั่งแล้ว กำลังดำเนินการ...",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: "เกิดข้อผิดพลาด: ไม่สามารถเชื่อมต่อกับระบบได้",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e]">
        <Terminal className="w-4 h-4 text-[#4ec9b0]" />
        <span className="text-[#cccccc] font-semibold">Terminal</span>
        <span className="text-[#858585] text-xs ml-auto">
          {sessionId || "default"}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            {/* Timestamp and Role */}
            <div className="flex items-center gap-2 text-xs text-[#858585]">
              <span>[{formatTime(message.timestamp)}]</span>
              <span
                className={
                  message.role === "user"
                    ? "text-[#4ec9b0]"
                    : message.role === "assistant"
                    ? "text-[#569cd6]"
                    : "text-[#ce9178]"
                }
              >
                {message.role === "user"
                  ? "user@mrpromth"
                  : message.role === "assistant"
                  ? "ai-agent"
                  : "system"}
              </span>
            </div>

            {/* Message Content */}
            <div
              className={`pl-4 border-l-2 ${
                message.role === "user"
                  ? "border-[#4ec9b0]"
                  : message.role === "assistant"
                  ? "border-[#569cd6]"
                  : "border-[#ce9178]"
              }`}
            >
              <pre className="whitespace-pre-wrap break-words font-mono text-[#d4d4d4]">
                {message.content}
              </pre>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-[#858585]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>กำลังประมวลผล...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-t border-[#3e3e3e]"
      >
        <span className="text-[#4ec9b0]">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำสั่งหรือคำถาม..."
          disabled={isLoading}
          className="flex-1 bg-transparent border-none outline-none text-[#d4d4d4] placeholder:text-[#6a6a6a] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded hover:bg-[#3e3e3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 text-[#569cd6]" />
        </button>
      </form>
    </div>
  );
}
