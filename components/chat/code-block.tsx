"use client"

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  filename?: string
}

export function CodeBlock({ 
  code, 
  language = 'typescript', 
  showLineNumbers = true,
  filename 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border my-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-xs font-medium text-muted-foreground">
              {filename}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">
            {language}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={theme === 'dark' ? oneDark : oneLight}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem'
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)'
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
