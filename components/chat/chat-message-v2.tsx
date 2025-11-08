'use client'

import { memo } from 'react'
import { User, Bot, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'
import { chatColors } from '@/lib/design-system'

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  isStreaming?: boolean
}

export const ChatMessageV2 = memo(function ChatMessageV2({
  role,
  content,
  timestamp,
  isStreaming = false
}: ChatMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  const isUser = role === 'user'
  const isAssistant = role === 'assistant'
  
  const handleCopyCode = async (code: string, language: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(language)
    setTimeout(() => setCopiedCode(null), 2000)
  }
  
  return (
    <div
      className={cn(
        'group flex gap-4 px-6 py-6 transition-all duration-200',
        isUser && 'bg-gradient-to-br from-sky-50/50 to-blue-50/50',
        isAssistant && 'bg-white hover:bg-gray-50/50'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-all duration-200',
            isUser && 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-200',
            isAssistant && 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-200',
            'group-hover:shadow-md group-hover:scale-105'
          )}
        >
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className={cn(
            'text-sm font-semibold',
            isUser && 'text-sky-700',
            isAssistant && 'text-purple-700'
          )}>
            {isUser ? 'คุณ' : 'Mr.Prompt'}
          </span>
          {timestamp && (
            <span className="text-xs text-gray-400">
              {timestamp}
            </span>
          )}
          {isStreaming && (
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className={cn(
          'prose prose-sm max-w-none',
          isUser && 'prose-sky',
          isAssistant && 'prose-gray'
        )}>
          <ReactMarkdown
            components={{
              code({ className, children, ...props }: any) {
                const inline = !className
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : ''
                const code = String(children).replace(/\n$/, '')
                
                if (!inline && language) {
                  return (
                    <div className="relative group/code my-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      {/* Language badge and copy button */}
                      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                        <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                          {language}
                        </span>
                        <button
                          onClick={() => handleCopyCode(code, language)}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                            copiedCode === language
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          )}
                        >
                          {copiedCode === language ? (
                            <>
                              <Check className="h-3 w-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Code content */}
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={language}
                        PreTag="div"
                        className="!m-0 !bg-gray-900"
                        showLineNumbers
                        lineNumberStyle={{
                          minWidth: '3em',
                          paddingRight: '1em',
                          color: '#6b7280',
                          userSelect: 'none'
                        }}
                        {...props}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  )
                }
                
                return (
                  <code
                    className={cn(
                      className,
                      'px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 text-sm font-mono border border-gray-200'
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                )
              },
              
              p({ children }) {
                return <p className="mb-3 leading-relaxed text-gray-700">{children}</p>
              },
              
              h1({ children }) {
                return <h1 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">{children}</h1>
              },
              
              h2({ children }) {
                return <h2 className="text-xl font-bold mb-3 text-gray-900 mt-6">{children}</h2>
              },
              
              h3({ children }) {
                return <h3 className="text-lg font-semibold mb-2 text-gray-800 mt-4">{children}</h3>
              },
              
              ul({ children }) {
                return <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">{children}</ul>
              },
              
              ol({ children }) {
                return <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">{children}</ol>
              },
              
              li({ children }) {
                return <li className="ml-2">{children}</li>
              },
              
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-sky-500 pl-4 py-2 my-3 bg-sky-50 text-gray-700 italic rounded-r-lg">
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
                    className="text-sky-600 hover:text-sky-700 underline decoration-sky-300 hover:decoration-sky-500 transition-colors"
                  >
                    {children}
                  </a>
                )
              },
              
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4 rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      {children}
                    </table>
                  </div>
                )
              },
              
              thead({ children }) {
                return <thead className="bg-gray-50">{children}</thead>
              },
              
              tbody({ children }) {
                return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
              },
              
              tr({ children }) {
                return <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
              },
              
              th({ children }) {
                return (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {children}
                  </th>
                )
              },
              
              td({ children }) {
                return <td className="px-4 py-3 text-sm text-gray-700">{children}</td>
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
})
