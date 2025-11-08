"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ModernChatInterface, Message } from '@/components/chat/modern-chat-interface'
import { AIModeSelector } from '@/components/chat/ai-mode-selector'
import { WorkspaceView } from '@/components/workspace/workspace-view'
import { useAIMode } from '@/lib/hooks/use-ai-mode'
import { AIMode } from '@/lib/types/ai-mode'

interface Task {
  id: string
  title: string
  preview: string
  timestamp: string
  isActive?: boolean
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content: string | ArrayBuffer | null
  preview?: string
}

export default function ChatPage() {
  const { mode, setMode, config, showWorkspace, placeholder } = useAIMode('web-builder')
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'New Chat',
      preview: 'Start a new conversation',
      timestamp: 'Just now',
      isActive: true
    }
  ])
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  
  // Workspace state
  const [projectFiles, setProjectFiles] = useState<{ path: string; content: string }[]>([])
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [previewHtml, setPreviewHtml] = useState<string>()
  
  const user = {
    name: 'User',
    email: 'user@example.com'
  }

  const handleSendMessage = async (content: string, files?: UploadedFile[]) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setIsStreaming(true)

    try {
      // TODO: Replace with actual API call
      // For now, simulate AI response
      await simulateAIResponse(content, mode)
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const simulateAIResponse = async (userInput: string, currentMode: AIMode) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    let responseContent = ''

    switch (currentMode) {
      case 'web-builder':
        responseContent = `ได้เลยครับ! ผมจะสร้างเว็บไซต์ให้คุณ

ผมกำลังวิเคราะห์ความต้องการของคุณ: "${userInput}"

## แผนการสร้างเว็บ

1. **Frontend**: Next.js 14 + React + TypeScript
2. **Styling**: TailwindCSS
3. **Components**: Responsive UI components
4. **Features**: ตามที่คุณระบุ

กำลังสร้างไฟล์...

\`\`\`typescript
// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">
        Welcome to Your Website
      </h1>
    </main>
  )
}
\`\`\`

คุณสามารถดูโค้ดและ preview ได้ทางด้านขวาครับ!`

        // Simulate file creation
        setProjectFiles([
          {
            path: 'app/page.tsx',
            content: `export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Your Website
        </h1>
        <p className="text-xl text-gray-600">
          Built with Next.js, React, and TailwindCSS
        </p>
      </div>
    </main>
  )
}`
          },
          {
            path: 'app/layout.tsx',
            content: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}`
          }
        ])

        setPreviewHtml(`
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <main class="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome to Your Website
      </h1>
      <p class="text-xl text-gray-600">
        Built with Next.js, React, and TailwindCSS
      </p>
    </div>
  </main>
</body>
</html>
        `)
        break

      case 'code-assistant':
        responseContent = `ได้เลยครับ! นี่คือโค้ดที่คุณต้องการ:

\`\`\`typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  return emailRegex.test(email)
}

// ตัวอย่างการใช้งาน
console.log(validateEmail('user@example.com')) // true
console.log(validateEmail('invalid-email')) // false
\`\`\`

**คำอธิบาย:**
- ใช้ Regular Expression ตรวจสอบรูปแบบ email
- Return \`true\` ถ้า email ถูกต้อง
- Return \`false\` ถ้า email ไม่ถูกต้อง`
        break

      case 'code-review':
        responseContent = `ผมได้ทำการ review โค้ดของคุณแล้ว นี่คือผลการวิเคราะห์:

## ✅ จุดดี
- โครงสร้างโค้ดชัดเจน อ่านง่าย
- ใช้ TypeScript ทำให้มี type safety

## ⚠️ จุดที่ควรปรับปรุง
1. **Error Handling**: ควรเพิ่ม try-catch
2. **Performance**: ควรใช้ memoization
3. **Security**: ควร validate input

## 💡 คำแนะนำ
\`\`\`typescript
// ปรับปรุงโค้ดแบบนี้จะดีกว่า
try {
  // your code here
} catch (error) {
  console.error('Error:', error)
}
\`\`\``
        break

      default:
        responseContent = `ขอบคุณสำหรับคำถามครับ!

ผมเข้าใจว่าคุณต้องการทราบเกี่ยวกับ "${userInput}"

ผมสามารถช่วยคุณได้หลายอย่าง:
- ตอบคำถามทั่วไป
- ให้คำแนะนำ
- อธิบายแนวคิด

ลองถามอะไรผมเพิ่มเติมได้เลยครับ! 😊`
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, aiMessage])
  }

  const handleNewTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New Chat',
      preview: 'Start a new conversation',
      timestamp: 'Just now',
      isActive: true
    }
    
    setTasks(prev => prev.map(t => ({ ...t, isActive: false })))
    setTasks(prev => [newTask, ...prev])
    
    // Reset state
    setMessages([])
    setProjectFiles([])
    setPreviewUrl(undefined)
    setPreviewHtml(undefined)
  }

  const handleSelectTask = (taskId: string) => {
    setTasks(prev => prev.map(t => ({ ...t, isActive: t.id === taskId })))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const handleFileChange = (path: string, content: string) => {
    setProjectFiles(prev => 
      prev.map(f => f.path === path ? { ...f, content } : f)
    )
  }

  const chatInterface = (
    <ModernChatInterface
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      isStreaming={isStreaming}
      mode={mode}
      placeholder={placeholder}
      userName={user.name}
    />
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        user={user}
        tasks={tasks}
        onNewTask={handleNewTask}
        onSelectTask={handleSelectTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with AI Mode Selector */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <AIModeSelector value={mode} onChange={setMode} />
          
          <div className="text-sm text-muted-foreground">
            {config.description}
          </div>
        </div>

        {/* Chat/Workspace Area */}
        {showWorkspace && projectFiles.length > 0 ? (
          <WorkspaceView
            files={projectFiles}
            previewUrl={previewUrl}
            previewHtml={previewHtml}
            onFileChange={handleFileChange}
            chatComponent={chatInterface}
          />
        ) : (
          chatInterface
        )}
      </div>
    </div>
  )
}
