"use client"

import { Loader2 } from 'lucide-react'

interface StreamingIndicatorProps {
  text?: string
}

export function StreamingIndicator({ text = 'Mr.Prompt กำลังพิมพ์...' }: StreamingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
      <div className="flex gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex gap-1 p-3">
      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}
