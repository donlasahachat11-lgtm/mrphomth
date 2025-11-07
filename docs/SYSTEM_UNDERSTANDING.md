# 🧠 ความเข้าใจระบบ Mr.Promth AI Agent Chain

## 📋 สรุปการทำงาน

### ระบบ AI Agent Chain

Mr.Promth ใช้ **7 AI Agents** ทำงานแบบ **Sequential Chain** (ต่อเนื่องกัน) โดยแต่ละ agent จะรับ output จาก agent ก่อนหน้าเป็น input

### กระบวนการทำงาน

```
User Prompt 
    ↓
Agent 1: Prompt Expander & Analyzer
    ↓ (expanded_prompt, project_spec)
Agent 2: Architecture Designer  
    ↓ (database_schema, api_structure, folder_structure)
Agent 3: Database & Backend Developer
    ↓ (migrations, api_routes)
Agent 4: Frontend Component Developer
    ↓ (components, pages)
Agent 5: Integration & Logic Developer
    ↓ (integrations, state_management)
Agent 6: Testing & Quality Assurance
    ↓ (test_files, quality_checks)
Agent 7: Optimization & Deployment
    ↓ (deployment_config, optimizations)
Final Project (Ready to Deploy)
```

---

## 🔧 Component หลัก

### 1. **AgentChainOrchestrator** (`lib/agents/orchestrator.ts`)

**หน้าที่:** จัดการการทำงานของ 7 agents แบบต่อเนื่อง

**การทำงาน:**
- รับ `userPrompt` จาก user
- รัน agents ทีละตัวตามลำดับ (sequential)
- แต่ละ agent รับ output จาก agent ก่อนหน้า
- บันทึก progress ลง database (projects, agent_logs)
- มี retry mechanism (default 1 retry)
- Emit progress events สำหรับ real-time updates

**Key Methods:**
- `execute(userPrompt)` - รัน agent chain ทั้งหมด
- `updateProject()` - อัปเดตสถานะโปรเจค
- `insertAgentLog()` - บันทึก log แต่ละ agent
- `emitProgress()` - ส่ง progress events

---

### 2. **VanchinAI Integration** (`lib/vanchin.ts`)

**หน้าที่:** เชื่อมต่อกับ VanchinAI API (OpenAI-compatible)

**Agent Endpoints:**
```typescript
agent1: "ep-lpvcnv-1761467347624133479"  // Prompt Expander
agent2: "ep-j9pysc-1761467653839114083"  // Architecture Designer
agent3: "ep-2uyob4-1761467835762653881"  // Backend Developer
agent4: "ep-nqjal5-1762460264139958733"  // Frontend Developer
agent5: "ep-mhsvw6-1762460362477023705"  // Integration Specialist
agent6: "ep-h614n9-1762460436283699679"  // Quality Assurance
agent7: "ep-ohxawl-1762460514611065743"  // Deployment Expert
```

**Key Functions:**
- `callAgent(agentId, prompt, options)` - เรียกใช้ agent
- `createVanchinClient(apiKey)` - สร้าง OpenAI client
- `parseAgentResponse<T>(response)` - parse JSON response

**Environment Variables ที่ต้องการ:**
```
VANCHIN_AGENT_AGENT1_KEY
VANCHIN_AGENT_AGENT2_KEY
VANCHIN_AGENT_AGENT3_KEY
VANCHIN_AGENT_AGENT4_KEY
VANCHIN_AGENT_AGENT5_KEY
VANCHIN_AGENT_AGENT6_KEY
VANCHIN_AGENT_AGENT7_KEY
VANCHIN_BASE_URL (optional)
```

---

### 3. **API Routes**

#### `/api/agent-chain` (POST)
**หน้าที่:** รับ prompt จาก user และเริ่ม agent chain

**Flow:**
1. ตรวจสอบ authentication
2. สร้าง project ใหม่ใน database (status: pending)
3. รัน `AgentChainOrchestrator.execute()` แบบ background
4. ส่ง `project_id` กลับให้ user ทันที
5. Agent chain ทำงานต่อใน background
6. อัปเดตสถานะใน database ตลอดเวลา

**Request:**
```json
{
  "prompt": "สร้างเว็บขายของออนไลน์"
}
```

**Response:**
```json
{
  "project_id": "uuid",
  "status": "pending"
}
```

#### `/api/chat` (POST)
**หน้าที่:** Chat แบบ streaming กับ AI

**Flow:**
1. รับ messages history
2. เรียก AI provider (OpenAI)
3. Stream response กลับเป็น SSE (Server-Sent Events)
4. Support tool calls

---

### 4. **Chat System** (`app/app/chat/[session_id]/page.tsx`)

**หน้าที่:** หน้าแชทสำหรับคุยกับ AI

**Features:**
- ✅ Streaming responses
- ✅ Message history
- ✅ Tool call support
- ✅ Real-time updates

**Components:**
- `MessageList` - แสดง messages
- `ChatInput` - input box สำหรับพิมพ์

---

### 5. **Database Schema**

#### Table: `projects`
```sql
- id (uuid)
- user_id (uuid)
- name (text)
- user_prompt (text)
- status (text) -- pending, running, completed, error
- current_agent (int) -- 1-7
- agent_outputs (jsonb) -- output จาก agents
- final_output (jsonb) -- ผลลัพธ์สุดท้าย
- error_message (text)
- created_at, updated_at
```

#### Table: `agent_logs`
```sql
- id (uuid)
- project_id (uuid)
- agent_number (int) -- 1-7
- agent_name (text)
- status (text) -- pending, running, completed, error
- output (jsonb)
- error_message (text)
- execution_time_ms (int)
- created_at
```

---

## 🎯 ทำไม User ไม่เห็น UI ของระบบ?

### ปัญหาที่พบ:

1. **Landing Page ไม่ได้เชื่อมต่อกับระบบจริง**
   - แค่แสดง features แบบ static
   - ไม่มีปุ่มเริ่มใช้งานที่ทำงานจริง

2. **Chat UI มีอยู่แล้วแต่ซ่อนอยู่**
   - อยู่ที่ `/app/chat/[session_id]`
   - ต้อง login ก่อน
   - ไม่มี link จาก landing page

3. **ไม่มีหน้าแสดง Agent Chain Progress**
   - Agent ทำงานใน background
   - ไม่มี UI แสดงว่า agent ไหนกำลังทำงาน
   - ไม่เห็น real-time progress

4. **ไม่มีหน้าแสดง Terminal/Code Editor**
   - Agent สร้าง code แล้ว
   - แต่ไม่มี UI ให้ดู code
   - ไม่มี terminal แสดงการทำงาน

---

## ✅ สิ่งที่ต้องทำ

### 1. ปรับ Landing Page
- เพิ่มปุ่ม "เริ่มสร้างเว็บไซต์" ที่ทำงานจริง
- เชื่อมต่อกับ `/api/agent-chain`
- แสดง modal สำหรับใส่ prompt

### 2. สร้างหน้า Agent Progress
- แสดง 7 agents แบบ step-by-step
- Real-time updates (WebSocket หรือ polling)
- แสดง output แต่ละ agent
- แสดง execution time

### 3. สร้างหน้า Code Viewer
- แสดง code ที่ agents สร้าง
- Syntax highlighting
- File tree navigation
- Download project

### 4. สร้างหน้า Terminal Viewer
- แสดง logs จาก agents
- แสดงคำสั่งที่รัน
- แสดง errors (ถ้ามี)

### 5. ปรับ Chat UI
- ทำให้เข้าถึงง่ายขึ้น
- เพิ่มภาษาไทย
- ปรับ design ให้สวยขึ้น

---

## 🚀 Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    Landing Page                          │
│  - Hero Section                                          │
│  - Features (7 Agents)                                   │
│  - [เริ่มสร้างเว็บไซต์] Button ← ต้องทำให้ทำงาน!         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Prompt Input Modal                          │
│  - Text area สำหรับใส่ prompt                            │
│  - Submit → POST /api/agent-chain                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│           Agent Progress Page (ต้องสร้างใหม่!)           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Agent 1: Prompt Expander        [✓] Completed   │    │
│  │ Agent 2: Architecture Designer  [⟳] Running     │    │
│  │ Agent 3: Backend Developer      [ ] Pending     │    │
│  │ Agent 4: Frontend Developer     [ ] Pending     │    │
│  │ Agent 5: Integration Specialist [ ] Pending     │    │
│  │ Agent 6: Quality Assurance      [ ] Pending     │    │
│  │ Agent 7: Deployment Expert      [ ] Pending     │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Code Viewer Page (ต้องสร้างใหม่!)                │
│  ┌──────────┐  ┌────────────────────────────────────┐   │
│  │ Files    │  │ Code Editor (Read-only)            │   │
│  │ ├ app/   │  │ import { ... } from ...            │   │
│  │ ├ lib/   │  │                                    │   │
│  │ ├ api/   │  │ export default function Page() {   │   │
│  │ └ ...    │  │   return <div>...</div>            │   │
│  └──────────┘  │ }                                  │   │
│                └────────────────────────────────────┘   │
│  [Download Project] [Deploy to Vercel]                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Notes

- **Sequential Chain**: Agents ทำงานทีละตัว ไม่ใช่ parallel
- **Background Processing**: Agent chain รันใน background หลัง API return
- **Real-time Updates**: ใช้ database polling หรือ WebSocket
- **VanchinAI**: ใช้ OpenAI-compatible API
- **7 Agents**: แต่ละตัวมี endpoint และ API key แยกกัน

---

**สรุป:** ระบบมีอยู่แล้วครบ แค่ต้องสร้าง UI ให้ user เห็นและใช้งานได้!
