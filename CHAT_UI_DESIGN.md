# 🎨 Chat UI Upgrade Design Document

**Date:** November 9, 2025  
**Version:** 1.0.0  
**Status:** Design Phase

---

## 📋 Overview

Upgrade Mr.Prompt Chat UI from Terminal-style to Modern Chat Interface inspired by ChatGPT, Manus.im, and Cursor AI.

---

## 🎯 Design Goals

1. **Modern Chat Interface** - Bubble-style messages like ChatGPT/Manus
2. **AI Mode Selector** - 7 specialized modes with dropdown
3. **Workspace Integration** - VS Code editor + Browser preview + File tree
4. **Enhanced Features** - Streaming, code highlighting, file upload, export

---

## 🏗️ Component Architecture

### 1. Main Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header: AI Mode Selector + Project Name + Actions          │
├──────────┬──────────────────────────────────┬───────────────┤
│          │                                  │               │
│ Sidebar  │      Chat/Workspace Area         │  File Tree    │
│          │                                  │  (optional)   │
│ - Chats  │  - Messages (bubble style)       │               │
│ - New    │  - Code blocks with copy         │  - Files      │
│          │  - Markdown rendering            │  - Folders    │
│          │  - Streaming indicator           │               │
│          │                                  │               │
│          ├──────────────────────────────────┤               │
│          │  Input Area                      │               │
│          │  - Textarea                      │               │
│          │  - File upload                   │               │
│          │  - Send button                   │               │
└──────────┴──────────────────────────────────┴───────────────┘
```

### 2. Web Builder Mode Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header: [Web Builder Mode] + Toggle Views                  │
├──────────┬──────────────────────────────────┬───────────────┤
│          │                                  │               │
│ Sidebar  │      Split View                  │  File Tree    │
│          │                                  │               │
│          │  ┌────────────┬────────────┐     │  📁 project/  │
│          │  │            │            │     │   📁 app/     │
│          │  │  Monaco    │  Browser   │     │     page.tsx  │
│          │  │  Editor    │  Preview   │     │   📁 comp/    │
│          │  │            │            │     │     ui.tsx    │
│          │  │  (Code)    │  (Live)    │     │               │
│          │  │            │            │     │               │
│          │  └────────────┴────────────┘     │               │
│          │                                  │               │
│          │  Chat Messages (below)           │               │
└──────────┴──────────────────────────────────┴───────────────┘
```

---

## 🎨 UI Components

### 1. AI Mode Selector

**Component:** `<AIModeSelector />`

**Location:** Header (top-left)

**Modes:**
```typescript
type AIMode = 
  | 'web-builder'      // 🌐 สร้างเว็บเต็มรูปแบบ
  | 'general-chat'     // 💬 คุยทั่วไป
  | 'code-assistant'   // 💻 ช่วยเขียนโค้ด
  | 'code-review'      // 🔍 Review code
  | 'ui-ux-design'     // 🎨 ออกแบบ UI
  | 'database-design'  // 🗄️ ออกแบบ database
  | 'deployment'       // 🚀 Deploy และ DevOps
```

**UI Design:**
```
┌─────────────────────────────────┐
│ 🌐 Web Builder            ▼     │  <- Dropdown button
└─────────────────────────────────┘

When clicked:
┌─────────────────────────────────┐
│ 🌐 Web Builder            ✓     │
│ 💬 General Chat                 │
│ 💻 Code Assistant               │
│ 🔍 Code Review                  │
│ 🎨 UI/UX Design                 │
│ 🗄️ Database Design              │
│ 🚀 Deployment                   │
└─────────────────────────────────┘
```

### 2. Modern Chat Messages

**Component:** `<ModernChatMessage />`

**Features:**
- ✅ Bubble-style design
- ✅ User/Assistant avatars
- ✅ Markdown rendering
- ✅ Code syntax highlighting (Prism.js or Shiki)
- ✅ Copy code button
- ✅ Streaming animation
- ✅ Timestamp

**Message Bubble Design:**

**User Message:**
```
                                    ┌─────────────────┐
                                    │ สร้างเว็บขายกาแฟ │
                                    │ ให้หน่อยครับ     │
                                    └─────────────────┘ 👤
                                    คุณ • 10:30
```

**Assistant Message:**
```
🤖  ┌──────────────────────────────────────┐
    │ ได้เลยครับ! ผมจะสร้างเว็บขายกาแฟ    │
    │ ให้คุณ มีฟีเจอร์:                    │
    │                                      │
    │ 1. หน้าแรก (Landing page)            │
    │ 2. เมนูสินค้า                        │
    │ 3. ระบบสั่งซื้อ                      │
    │                                      │
    │ ```typescript                        │
    │ const app = createApp({              │
    │   name: 'Coffee Shop'                │
    │ })                            [Copy] │
    │ ```                                  │
    └──────────────────────────────────────┘
    Mr.Prompt • 10:31
```

### 3. Workspace Integration

**Component:** `<WorkspaceView />`

**Sub-components:**
- `<MonacoEditor />` - Code editor
- `<BrowserPreview />` - Live preview in iframe
- `<FileTreeView />` - File explorer

**Toggle Views:**
```
┌──────────────────────────────────────┐
│ [Chat] [Code] [Preview] [Split]      │  <- View toggle buttons
└──────────────────────────────────────┘
```

**Views:**
1. **Chat** - Full chat view (default for non-web-builder modes)
2. **Code** - Full Monaco editor
3. **Preview** - Full browser preview
4. **Split** - Code + Preview side-by-side

### 4. Code Block with Copy

**Component:** `<CodeBlock />`

**Features:**
- Syntax highlighting (using `react-syntax-highlighter`)
- Language badge
- Copy button
- Line numbers (optional)

**Design:**
```
┌─────────────────────────────────────────┐
│ typescript                       [Copy] │
├─────────────────────────────────────────┤
│ 1  const greeting = "Hello"             │
│ 2  console.log(greeting)                │
└─────────────────────────────────────────┘
```

### 5. File Upload

**Component:** `<FileUploadButton />`

**Location:** Input area (left of textarea)

**Supported:**
- Images (for UI reference)
- Code files (for review)
- Documents (for context)

**UI:**
```
┌────┐  ┌──────────────────────────┐  ┌────┐
│ 📎 │  │ พิมพ์ข้อความ...          │  │ ➤  │
└────┘  └──────────────────────────┘  └────┘
```

### 6. Streaming Indicator

**Component:** `<StreamingIndicator />`

**Animation:**
```
Mr.Prompt is typing...
▓▓▓▓▓▓▓░░░░░░░░  (animated progress)
```

---

## 🎨 Color Scheme & Styling

### Theme Variables (Tailwind)

```css
/* Light Mode */
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--card: 0 0% 100%
--card-foreground: 222.2 84% 4.9%
--primary: 221.2 83.2% 53.3%
--primary-foreground: 210 40% 98%
--muted: 210 40% 96.1%
--muted-foreground: 215.4 16.3% 46.9%

/* Dark Mode */
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
--card: 222.2 84% 4.9%
--card-foreground: 210 40% 98%
--primary: 217.2 91.2% 59.8%
--primary-foreground: 222.2 47.4% 11.2%
--muted: 217.2 32.6% 17.5%
--muted-foreground: 215 20.2% 65.1%
```

### Message Bubble Colors

**User Message:**
- Background: `bg-primary` (blue)
- Text: `text-primary-foreground` (white)
- Border radius: `rounded-2xl`

**Assistant Message:**
- Background: `bg-muted` (light gray)
- Text: `text-foreground` (dark)
- Border radius: `rounded-2xl`

---

## 📁 File Structure

```
components/
├── chat/
│   ├── modern-chat-interface.tsx      # Main chat component
│   ├── ai-mode-selector.tsx           # Mode dropdown
│   ├── chat-message.tsx               # Message bubble
│   ├── code-block.tsx                 # Code with syntax highlighting
│   ├── file-upload-button.tsx         # File upload
│   └── streaming-indicator.tsx        # Typing animation
├── workspace/
│   ├── workspace-view.tsx             # Main workspace
│   ├── monaco-editor.tsx              # Code editor
│   ├── browser-preview.tsx            # Live preview
│   ├── file-tree-view.tsx             # File explorer
│   └── view-toggle.tsx                # View switcher
└── ui/
    ├── button.tsx                     # (existing)
    ├── dropdown-menu.tsx              # (existing)
    ├── scroll-area.tsx                # (existing)
    └── tabs.tsx                       # (existing)
```

---

## 🔧 Technical Implementation

### 1. AI Mode Management

```typescript
// lib/hooks/use-ai-mode.ts
export function useAIMode() {
  const [mode, setMode] = useState<AIMode>('web-builder')
  const [agent, setAgent] = useState<AgentType>('project-planner')
  
  // Map mode to agent
  useEffect(() => {
    const agentMap: Record<AIMode, AgentType> = {
      'web-builder': 'project-planner',
      'general-chat': 'project-planner',
      'code-assistant': 'frontend-developer',
      'code-review': 'code-reviewer',
      'ui-ux-design': 'ui-ux-designer',
      'database-design': 'database-designer',
      'deployment': 'deployment-agent'
    }
    setAgent(agentMap[mode])
  }, [mode])
  
  return { mode, setMode, agent }
}
```

### 2. Streaming Responses

```typescript
// lib/api/chat-stream.ts
export async function streamChatResponse(
  message: string,
  mode: AIMode,
  onChunk: (chunk: string) => void,
  onComplete: () => void
) {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, mode })
  })
  
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader!.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    onChunk(chunk)
  }
  
  onComplete()
}
```

### 3. Monaco Editor Integration

```typescript
// components/workspace/monaco-editor.tsx
import Editor from '@monaco-editor/react'

export function MonacoEditor({ 
  file, 
  onChange 
}: MonacoEditorProps) {
  return (
    <Editor
      height="100%"
      language={getLanguageFromFile(file.path)}
      value={file.content}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true
      }}
    />
  )
}
```

### 4. File Tree

```typescript
// components/workspace/file-tree-view.tsx
interface FileNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileNode[]
}

export function FileTreeView({ 
  files, 
  onFileSelect 
}: FileTreeViewProps) {
  return (
    <div className="file-tree">
      {files.map(node => (
        <FileTreeNode 
          key={node.path}
          node={node}
          onSelect={onFileSelect}
        />
      ))}
    </div>
  )
}
```

---

## 🚀 Implementation Phases

### Phase 1: Core Chat UI ✅
- [x] Modern chat message bubbles
- [x] Markdown rendering
- [x] Code syntax highlighting
- [x] Copy code button
- [x] Avatars and timestamps

### Phase 2: AI Mode Selector ⏳
- [ ] Create mode dropdown component
- [ ] Implement mode switching logic
- [ ] Map modes to agents
- [ ] Update UI based on mode

### Phase 3: Workspace Integration ⏳
- [ ] Install Monaco Editor
- [ ] Create editor component
- [ ] Create browser preview component
- [ ] Create file tree component
- [ ] Implement view toggle

### Phase 4: Enhanced Features ⏳
- [ ] Streaming responses (SSE)
- [ ] File upload support
- [ ] Project export (ZIP)
- [ ] Deploy to Vercel button

### Phase 5: Testing & Polish ⏳
- [ ] Test all modes
- [ ] Test workspace views
- [ ] Test streaming
- [ ] Responsive design
- [ ] Performance optimization

---

## 📦 Dependencies to Install

```bash
npm install @monaco-editor/react
npm install react-syntax-highlighter
npm install @types/react-syntax-highlighter
npm install prismjs
npm install jszip  # for project export
npm install react-dropzone  # for file upload
```

---

## 🎯 Success Criteria

1. ✅ Chat UI looks like ChatGPT/Manus
2. ✅ 7 AI modes working correctly
3. ✅ Workspace shows code + preview + files
4. ✅ Streaming responses work smoothly
5. ✅ Code blocks have syntax highlighting + copy
6. ✅ Can upload files
7. ✅ Can export project as ZIP
8. ✅ Responsive on all screen sizes

---

## 📚 References

- **ChatGPT UI:** https://chat.openai.com
- **Manus.im:** https://manus.im
- **Cursor AI:** https://cursor.sh
- **v0.dev:** https://v0.dev
- **Monaco Editor:** https://microsoft.github.io/monaco-editor/

---

**Next Steps:**
1. Install dependencies
2. Create AI mode selector component
3. Enhance chat message component
4. Integrate Monaco Editor
5. Add browser preview
6. Implement streaming

---

**Status:** Ready to implement 🚀
