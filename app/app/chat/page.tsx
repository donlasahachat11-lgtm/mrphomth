'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ModernChatInterfaceV2, Message } from '@/components/chat/modern-chat-interface-v2'
import { AIModeSelectorV3 } from '@/components/chat/ai-mode-selector-v3'
import { WorkspaceViewV2 } from '@/components/workspace/workspace-view-v2'
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

export default function ChatPageV2() {
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
      timestamp: new Date().toLocaleString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setIsStreaming(true)

    try {
      // TODO: Replace with actual API call
      await simulateAIResponse(content, mode, files)
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date().toLocaleString('th-TH', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const simulateAIResponse = async (userInput: string, currentMode: AIMode, files?: UploadedFile[]) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    let responseContent = ''
    
    // Include file info if files were uploaded
    let fileInfo = ''
    if (files && files.length > 0) {
      fileInfo = `\n\nได้รับไฟล์: ${files.map(f => f.name).join(', ')}\n\n`
    }

    switch (currentMode) {
      case 'web-builder':
        responseContent = `${fileInfo}ได้เลยครับ! ผมจะสร้างเว็บไซต์ให้คุณ

ผมกำลังวิเคราะห์ความต้องการของคุณ: **"${userInput}"**

## 🎯 แผนการสร้างเว็บ

1. **Frontend**: Next.js 14 + React + TypeScript
2. **Styling**: TailwindCSS + Modern Design System
3. **Components**: Responsive UI components
4. **Features**: ตามที่คุณระบุ

## 💻 กำลังสร้างไฟล์...

\`\`\`typescript
// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Your Website
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          สร้างโดย Mr.Prompt AI
        </p>
      </div>
    </main>
  )
}
\`\`\`

คุณสามารถดูโค้ดและ preview ได้ทางด้านขวาครับ! 🚀`
        
        // Simulate file creation for workspace
        setProjectFiles([
          {
            path: 'app/page.tsx',
            content: `export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Your Website
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          สร้างโดย Mr.Prompt AI
        </p>
      </div>
    </main>
  )
}`
          }
        ])
        break

      case 'general-chat':
        responseContent = `${fileInfo}สวัสดีครับ! ผมยินดีช่วยเหลือคุณ

คุณถามเกี่ยวกับ: **"${userInput}"**

ผมสามารถช่วยคุณได้หลายอย่าง:
- ตอบคำถามทั่วไป
- ให้คำแนะนำ
- อธิบายแนวคิด
- แชร์ความรู้

มีอะไรให้ผมช่วยเพิ่มเติมไหมครับ? 😊`
        break

      case 'code-assistant':
        responseContent = `${fileInfo}ได้เลยครับ! ผมจะช่วยเขียนโค้ดให้

สำหรับ: **"${userInput}"**

\`\`\`typescript
// Example Code
function example() {
  console.log('Hello from Mr.Prompt!')
  return 'Code generated successfully'
}
\`\`\`

โค้ดนี้:
- ✅ ใช้ TypeScript
- ✅ มี type safety
- ✅ Clean และ readable

ต้องการให้ปรับปรุงอะไรเพิ่มเติมไหมครับ?`
        break

      case 'code-review':
        responseContent = `${fileInfo}ผมจะ review โค้ดให้ครับ

## 📝 Code Review: "${userInput}"

## ✅ จุดดี
- โครงสร้างโค้ดชัดเจน อ่านง่าย
- ใช้ TypeScript ทำให้มี type safety
- Naming conventions ดี

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
\`\`\`

มีส่วนไหนอยากให้อธิบายเพิ่มเติมไหมครับ?`
        break

      case 'ui-ux-design':
        responseContent = `${fileInfo}ผมจะออกแบบ UI ให้ครับ!

## 🎨 UI Design: "${userInput}"

### Color Palette
- **Primary**: Sky Blue (#0ea5e9)
- **Secondary**: Purple (#a855f7)
- **Accent**: Green (#22c55e)

### Components
\`\`\`tsx
<Button className="bg-gradient-to-r from-sky-500 to-purple-600">
  Click Me
</Button>
\`\`\`

### Design Principles
- ✨ Modern & Clean
- 📱 Mobile-first
- ♿ Accessible
- 🎯 User-friendly

ต้องการ mockup หรือ prototype ไหมครับ?`
        break

      case 'database-design':
        responseContent = `${fileInfo}ผมจะออกแบบ database ให้ครับ!

## 🗄️ Database Design: "${userInput}"

### Schema Design
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Relationships
- Users → Projects (One-to-Many)
- Projects → Tasks (One-to-Many)

### Indexes
\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
\`\`\`

ต้องการ ER diagram หรือ migration scripts ไหมครับ?`
        break

      case 'deployment':
        responseContent = `${fileInfo}ผมจะช่วย deploy ให้ครับ!

## 🚀 Deployment Guide: "${userInput}"

### Step 1: Build
\`\`\`bash
npm run build
\`\`\`

### Step 2: Deploy to Vercel
\`\`\`bash
vercel --prod
\`\`\`

### Environment Variables
\`\`\`env
DATABASE_URL=your_database_url
API_KEY=your_api_key
\`\`\`

### Post-Deployment
- ✅ Check deployment status
- ✅ Test all features
- ✅ Monitor performance

ต้องการความช่วยเหลือเพิ่มเติมไหมครับ?`
        break

      default:
        responseContent = `${fileInfo}ขอบคุณสำหรับคำถามครับ!

ผมเข้าใจว่าคุณต้องการทราบเกี่ยวกับ **"${userInput}"**

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
      timestamp: new Date().toLocaleString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
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
    handleClearChat()
  }

  const handleSelectTask = (taskId: string) => {
    setTasks(prev => prev.map(t => ({ ...t, isActive: t.id === taskId })))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const handleClearChat = () => {
    setMessages([])
    setProjectFiles([])
    setPreviewUrl(undefined)
    setPreviewHtml(undefined)
  }

  const handleFileChange = (path: string, content: string) => {
    setProjectFiles(prev => 
      prev.map(f => f.path === path ? { ...f, content } : f)
    )
  }

  const chatInterface = (
    <ModernChatInterfaceV2
      messages={messages}
      onSendMessage={handleSendMessage}
      onClearChat={handleClearChat}
      isLoading={isLoading}
      isStreaming={isStreaming}
      mode={mode}
      placeholder={placeholder}
      userName={user.name}
    />
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
          <AIModeSelectorV3 value={mode} onChange={setMode} />
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 max-w-md truncate">
              {config.description}
            </div>
          </div>
        </div>

        {/* Chat/Workspace Area */}
        {showWorkspace && projectFiles.length > 0 ? (
          <WorkspaceViewV2
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
