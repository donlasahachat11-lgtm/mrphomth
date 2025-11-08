"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './chat-message'
import { FileUploadButton } from './file-upload-button'
import { StreamingIndicator } from './streaming-indicator'
import { AIMode } from '@/lib/types/ai-mode'
import { cn } from '@/lib/utils'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content: string | ArrayBuffer | null
  preview?: string
}

interface ModernChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string, files?: UploadedFile[]) => void
  isLoading?: boolean
  isStreaming?: boolean
  mode: AIMode
  placeholder?: string
  userName?: string
  userAvatar?: string
  className?: string
}

export function ModernChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  isStreaming = false,
  mode,
  placeholder = "พิมพ์ข้อความ...",
  userName = "คุณ",
  userAvatar,
  className
}: ModernChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isStreaming])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSend = () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return
    
    onSendMessage(input.trim(), uploadedFiles)
    setInput('')
    setUploadedFiles([])
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFilesSelected = (files: UploadedFile[]) => {
    setUploadedFiles(files)
  }

  const handleClearChat = () => {
    if (confirm('ต้องการล้างประวัติการสนทนาหรือไม่?')) {
      // This should be handled by parent component
      console.log('Clear chat requested')
    }
  }

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        <div className="mx-auto max-w-4xl py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                สวัสดี! ผมคือ Mr.Prompt
              </h3>
              <p className="text-base text-muted-foreground max-w-md leading-relaxed">
                ผมสามารถช่วยคุณสร้างเว็บไซต์ ตอบคำถาม ช่วยเขียนโค้ด และอื่นๆ อีกมากมาย
                <br />
                <br />
                ลองถามอะไรผมสักอย่างสิ! 🚀
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  userName={userName}
                  avatarUrl={userAvatar}
                />
              ))}
              
              {/* Streaming indicator */}
              {isStreaming && (
                <div className="flex gap-3 mb-6">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold">Mr.Prompt</span>
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                      <StreamingIndicator text="กำลังพิมพ์" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card">
        <div className="mx-auto max-w-4xl px-4 py-4">
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs"
                >
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button
                    onClick={() => setUploadedFiles(files => files.filter(f => f.id !== file.id))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {/* File Upload */}
            <FileUploadButton onFilesSelected={handleFilesSelected} />

            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[52px] max-h-[200px] resize-none"
              rows={1}
              disabled={isLoading}
            />

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
              size="icon"
              className="h-[52px] w-[52px] flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>กด Enter เพื่อส่ง, Shift + Enter เพื่อขึ้นบรรทัดใหม่</span>
            
            {messages.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="h-7 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  ล้างแชท
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
