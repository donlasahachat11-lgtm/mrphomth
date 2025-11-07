"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";

import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import type { ChatMessage } from "@/components/chat/types";

interface ChatPageProps {
  params: { session_id: string };
}

const SYSTEM_PROMPT: ChatMessage = {
  id: "system-message",
  role: "system",
  content: "คุณคือ มิสเตอร์พรอมท์ ผู้ช่วย AI ที่เชี่ยวชาญด้านการเขียน prompt และพัฒนาเว็บแอปพลิเคชัน",
  createdAt: new Date().toISOString(),
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-message",
  role: "assistant",
  content: "สวัสดีครับ! ผมคือ **มิสเตอร์พรอมท์** 👋\n\nผมพร้อมช่วยคุณ:\n- ✨ ขยาย prompt ให้ละเอียดขึ้น\n- 🏗️ ออกแบบ architecture\n- 💻 พัฒนาเว็บแอปพลิเคชัน\n- 🚀 Deploy ไปยัง production\n\nบอกผมได้เลยว่าคุณต้องการสร้างอะไร!",
  createdAt: new Date().toISOString(),
};

export default function ChatSessionPage({ params }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([SYSTEM_PROMPT, WELCOME_MESSAGE]);
  const [isStreaming, setIsStreaming] = useState(false);

  const historyForProvider = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    [messages]
  );

  const upsertMessage = (message: ChatMessage) => {
    setMessages((prev) => {
      const index = prev.findIndex((entry) => entry.id === message.id);
      if (index === -1) {
        return [...prev, message];
      }
      const clone = [...prev];
      clone[index] = { ...prev[index], ...message };
      return clone;
    });
  };

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: params.session_id,
          stream: true,
          provider: "openai",
          messages: [...historyForProvider, { role: "user", content }],
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("ไม่สามารถเชื่อมต่อกับ AI ได้");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const segments = buffer.split("\n\n");
        buffer = segments.pop() ?? "";

        for (const segment of segments) {
          if (!segment.trim() || !segment.startsWith("data:")) continue;
          const payload = segment.replace(/^data:/, "").trim();
          if (!payload) continue;

          try {
            const parsed = JSON.parse(payload) as {
              type: string;
              content?: string;
              error?: string;
              name?: string;
              metadata?: Record<string, unknown>;
            };

            if (parsed.type === "tool" && parsed.content) {
              const toolMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `🛠️ ${parsed.name ?? "Tool"} Result\n${parsed.content}`,
                createdAt: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, toolMessage]);
            }

            if (parsed.type === "chunk" && parsed.content) {
              upsertMessage({
                ...assistantMessage,
                content: (assistantMessage.content += parsed.content),
              });
            }

            if (parsed.type === "error") {
              upsertMessage({
                ...assistantMessage,
                content: parsed.error ?? "เกิดข้อผิดพลาด",
                isStreaming: false,
              });
            }

            if (parsed.type === "done") {
              upsertMessage({ ...assistantMessage, isStreaming: false });
            }
          } catch (parseError) {
            console.warn("Unable to parse stream payload", parseError);
          }
        }
      }

      upsertMessage({ ...assistantMessage, isStreaming: false });
    } catch (error) {
      upsertMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: `❌ เกิดข้อผิดพลาด: ${String(error)}`,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              แชทกับมิสเตอร์พรอมท์
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              เซสชัน #{params.session_id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-700 dark:text-green-400">ออนไลน์</span>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <MessageList messages={messages.filter((message) => message.role !== "system")} />
        <ChatInput onSend={handleSend} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
