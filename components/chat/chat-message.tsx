"use client"

import { Bot, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { CodeBlock } from './code-block'
import { TypingIndicator } from './streaming-indicator'

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  isStreaming?: boolean
  userName?: string
  avatarUrl?: string
}

export function ChatMessage({
  role,
  content,
  timestamp,
  isStreaming = false,
  userName = 'คุณ',
  avatarUrl
}: ChatMessageProps) {
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'เมื่อสักครู่'
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
    if (days < 7) return `${days} วันที่แล้ว`
    return date.toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  if (role === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-muted/50 rounded-full text-xs text-muted-foreground">
          {content}
        </div>
      </div>
    )
  }

  const isUser = role === 'user'
  const displayName = isUser ? userName : 'Mr.Prompt'

  return (
    <div
      className={cn(
        "flex gap-3 mb-6",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        {isUser ? (
          <>
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={userName} />
            ) : (
              <AvatarFallback className="bg-secondary">
                <User className="h-4 w-4" />
              </AvatarFallback>
            )}
          </>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%]",
          isUser && "items-end"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center gap-2",
          isUser && "flex-row-reverse"
        )}>
          <span className="text-xs font-semibold text-foreground">
            {displayName}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 break-words",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          {isStreaming && !content ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:m-0">
              <ReactMarkdown
                components={{
                  code(props: any) {
                    const { node, inline, className, children, ...rest } = props
                    const match = /language-(\w+)/.exec(className || '')
                    const codeString = String(children).replace(/\n$/, '')
                    
                    return !inline && match ? (
                      <CodeBlock
                        code={codeString}
                        language={match[1]}
                        showLineNumbers={true}
                      />
                    ) : (
                      <code
                        className={cn(
                          "px-1.5 py-0.5 rounded bg-muted/50 text-foreground font-mono text-xs",
                          className
                        )}
                        {...rest}
                      >
                        {children}
                      </code>
                    )
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                  },
                  ul({ children }) {
                    return <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>
                  },
                  ol({ children }) {
                    return <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>
                  },
                  li({ children }) {
                    return <li className="leading-relaxed">{children}</li>
                  },
                  h1({ children }) {
                    return <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>
                  },
                  h2({ children }) {
                    return <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>
                  },
                  h3({ children }) {
                    return <h3 className="text-base font-bold mb-2 mt-2 first:mt-0">{children}</h3>
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-primary/50 pl-4 italic my-2 text-muted-foreground">
                        {children}
                      </blockquote>
                    )
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {children}
                      </a>
                    )
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
