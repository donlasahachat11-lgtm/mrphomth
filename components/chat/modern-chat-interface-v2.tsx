'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessageV2 } from './chat-message-v2'
import { FileUploadV2 } from './file-upload-v2'
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

interface ModernChatInterfaceV2Props {
  messages: Message[]
  onSendMessage: (content: string, files?: UploadedFile[]) => void
  onClearChat?: () => void
  isLoading?: boolean
  isStreaming?: boolean
  mode: AIMode
  placeholder?: string
  userName?: string
  userAvatar?: string
  className?: string
}

export function ModernChatInterfaceV2({
  messages,
  onSendMessage,
  onClearChat,
  isLoading = false,
  isStreaming = false,
  mode,
  placeholder = "พิมพ์ข้อความของคุณ...",
  userName = "คุณ",
  userAvatar,
  className
}: ModernChatInterfaceV2Props) {
  const [input, setInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showFileUpload, setShowFileUpload] = useState(false)
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
    setShowFileUpload(false)
    
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

  const handleClearChat = () => {
    if (onClearChat) {
      onClearChat()
      setInput('')
      setUploadedFiles([])
      setShowFileUpload(false)
    }
  }

  return (
    <div className={cn('flex h-full flex-col bg-gradient-to-b from-gray-50 to-white', className)}>
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        <div className="mx-auto max-w-4xl py-8">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
              {/* Animated Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-purple-600 shadow-2xl shadow-sky-300/50">
                  <Sparkles className="h-12 w-12 text-white animate-pulse" />
                </div>
              </div>
              
              {/* Welcome Text */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
                  สวัสดี! ผมคือ Mr.Prompt
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                  ผมพร้อมช่วยคุณสร้างเว็บไซต์ เขียนโค้ด ออกแบบ UI/UX<br />
                  และอีกมากมาย ด้วย AI ที่ทรงพลัง
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-8">
                {[
                  { icon: '🌐', title: 'สร้างเว็บไซต์', desc: 'สร้างเว็บเต็มรูปแบบ' },
                  { icon: '💻', title: 'เขียนโค้ด', desc: 'ช่วยเขียนและแก้โค้ด' },
                  { icon: '🎨', title: 'ออกแบบ UI', desc: 'ออกแบบ interface สวยงาม' },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(action.title)}
                    className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-sky-400 hover:shadow-xl hover:shadow-sky-200/50 hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative space-y-2">
                      <div className="text-3xl">{action.icon}</div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Hint */}
              <p className="text-sm text-gray-400 mt-8">
                ลองถามอะไรผมสักอย่างสิ! 🚀
              </p>
            </div>
          ) : (
            // Messages List
            <div className="space-y-1">
              {messages.map((message) => (
                <ChatMessageV2
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  isStreaming={isStreaming && message.id === messages[messages.length - 1].id}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-4">
          {/* File Upload Area (Collapsible) */}
          {showFileUpload && (
            <div className="mb-4 animate-in slide-in-from-bottom-4 duration-300">
              <FileUploadV2
                onFilesChange={setUploadedFiles}
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
              />
            </div>
          )}
          
          {/* Input Container */}
          <div className="relative">
            {/* Clear Chat Button (when messages exist) */}
            {messages.length > 0 && (
              <div className="absolute -top-12 right-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  ล้างแชท
                </Button>
              </div>
            )}
            
            {/* Main Input Box */}
            <div className="group relative rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all focus-within:border-sky-400 focus-within:shadow-xl focus-within:shadow-sky-200/50">
              {/* Gradient Border Effect */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-sky-400 to-purple-600 opacity-0 group-focus-within:opacity-100 blur transition-opacity -z-10" />
              
              <div className="relative flex items-end gap-2 p-3">
                {/* Textarea */}
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={isLoading}
                  className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent px-3 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                  rows={1}
                />
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 pb-2">
                  {/* File Upload Toggle */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                    className={cn(
                      "h-10 w-10 rounded-xl transition-all",
                      showFileUpload 
                        ? "bg-sky-100 text-sky-600 hover:bg-sky-200" 
                        : "text-gray-400 hover:text-sky-600 hover:bg-sky-50"
                    )}
                    title="แนบไฟล์"
                  >
                    <Plus className={cn(
                      "h-5 w-5 transition-transform",
                      showFileUpload && "rotate-45"
                    )} />
                  </Button>
                  
                  {/* Send Button */}
                  <Button
                    onClick={handleSend}
                    disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                    className={cn(
                      "h-10 w-10 rounded-xl transition-all duration-300",
                      "bg-gradient-to-r from-sky-500 to-purple-600",
                      "hover:from-sky-600 hover:to-purple-700",
                      "hover:shadow-lg hover:shadow-sky-300/50 hover:scale-105",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    )}
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Send className="h-5 w-5 text-white" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Helper Text */}
              <div className="px-4 pb-3 pt-1">
                <p className="text-xs text-gray-400">
                  กด <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 font-mono text-gray-600">Enter</kbd> เพื่อส่ง, 
                  <kbd className="ml-1 px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 font-mono text-gray-600">Shift + Enter</kbd> เพื่อขึ้นบรรทัดใหม่
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
