import { AgentType } from '@/lib/ai/model-config'

export type AIMode =
  | 'web-builder'
  | 'general-chat'
  | 'code-assistant'
  | 'code-review'
  | 'ui-ux-design'
  | 'database-design'
  | 'deployment'

export interface AIModeConfig {
  id: AIMode
  name: string
  icon: string
  description: string
  agent: AgentType
  placeholder: string
  systemPrompt: string
  showWorkspace: boolean
  features: string[]
}

export const AI_MODE_CONFIGS: Record<AIMode, AIModeConfig> = {
  'web-builder': {
    id: 'web-builder',
    name: 'Web Builder',
    icon: '🌐',
    description: 'สร้างเว็บไซต์เต็มรูปแบบ พร้อมท์เดียว',
    agent: 'project-planner',
    placeholder: 'อธิบายเว็บไซต์ที่คุณต้องการสร้าง เช่น "สร้างเว็บขายกาแฟ มีระบบสั่งซื้อออนไลน์"',
    systemPrompt: 'คุณคือ Web Builder AI ที่สามารถสร้างเว็บไซต์เต็มรูปแบบจากคำอธิบาย คุณจะวิเคราะห์ความต้องการ ออกแบบสถาปัตยกรรม และสร้างโค้ดให้ครบทุกส่วน',
    showWorkspace: true,
    features: [
      'สร้างเว็บไซต์ครบวงจร',
      'Next.js + React + TypeScript',
      'Database schema design',
      'API endpoints',
      'UI/UX design',
      'Deployment ready'
    ]
  },
  'general-chat': {
    id: 'general-chat',
    name: 'General Chat',
    icon: '💬',
    description: 'คุยทั่วไป ถาม-ตอบ',
    agent: 'project-planner',
    placeholder: 'ถามอะไรก็ได้ เช่น "อธิบาย React hooks" หรือ "แนะนำหนังสือเขียนโปรแกรม"',
    systemPrompt: 'คุณคือ AI ผู้ช่วยที่เป็นมิตร สามารถตอบคำถามทั่วไป ให้คำแนะนำ และคุยเรื่องต่างๆ ได้',
    showWorkspace: false,
    features: [
      'ตอบคำถามทั่วไป',
      'ให้คำแนะนำ',
      'อธิบายแนวคิด',
      'แชทเป็นกันเอง'
    ]
  },
  'code-assistant': {
    id: 'code-assistant',
    name: 'Code Assistant',
    icon: '💻',
    description: 'ช่วยเขียนโค้ด แก้บั๊ก',
    agent: 'frontend-developer',
    placeholder: 'บอกว่าต้องการเขียนโค้ดอะไร เช่น "เขียน function สำหรับ validate email"',
    systemPrompt: 'คุณคือ Code Assistant ที่เชี่ยวชาญในการเขียนโค้ด แก้บั๊ก และอธิบายโค้ด คุณจะให้โค้ดที่มีคุณภาพ มี comments และ best practices',
    showWorkspace: false,
    features: [
      'เขียนโค้ดให้',
      'แก้บั๊ก',
      'อธิบายโค้ด',
      'Refactor code',
      'เพิ่ม unit tests'
    ]
  },
  'code-review': {
    id: 'code-review',
    name: 'Code Review',
    icon: '🔍',
    description: 'Review โค้ด หาจุดปรับปรุง',
    agent: 'code-reviewer',
    placeholder: 'วางโค้ดที่ต้องการ review หรืออัพโหลดไฟล์',
    systemPrompt: 'คุณคือ Senior Code Reviewer ที่จะวิเคราะห์โค้ด ตรวจสอบ code quality, security, performance และให้ feedback ที่สร้างสรรค์',
    showWorkspace: false,
    features: [
      'Code quality analysis',
      'Security audit',
      'Performance review',
      'Best practices check',
      'Refactoring suggestions'
    ]
  },
  'ui-ux-design': {
    id: 'ui-ux-design',
    name: 'UI/UX Design',
    icon: '🎨',
    description: 'ออกแบบ UI/UX',
    agent: 'ui-ux-designer',
    placeholder: 'อธิบาย UI ที่ต้องการ เช่น "ออกแบบหน้า login ที่ทันสมัย"',
    systemPrompt: 'คุณคือ UI/UX Designer ที่เชี่ยวชาญในการออกแบบ interface ที่สวยงาม ใช้งานง่าย และ responsive คุณจะให้ design system และ component code',
    showWorkspace: false,
    features: [
      'Design system',
      'Component design',
      'Responsive layouts',
      'Accessibility',
      'Color schemes',
      'Typography'
    ]
  },
  'database-design': {
    id: 'database-design',
    name: 'Database Design',
    icon: '🗄️',
    description: 'ออกแบบ database schema',
    agent: 'database-designer',
    placeholder: 'อธิบายระบบที่ต้องการ database เช่น "ออกแบบ database สำหรับระบบ e-commerce"',
    systemPrompt: 'คุณคือ Database Designer ที่เชี่ยวชาญในการออกแบบ schema, relationships, indexes และ migrations คุณจะให้ SQL schema และ best practices',
    showWorkspace: false,
    features: [
      'Schema design',
      'ER diagrams',
      'Migration scripts',
      'Index optimization',
      'Query optimization',
      'Data modeling'
    ]
  },
  'deployment': {
    id: 'deployment',
    name: 'Deployment',
    icon: '🚀',
    description: 'Deploy และ DevOps',
    agent: 'deployment-agent',
    placeholder: 'บอกว่าต้องการ deploy อะไร ที่ไหน เช่น "deploy Next.js app ไป Vercel"',
    systemPrompt: 'คุณคือ DevOps Engineer ที่เชี่ยวชาญในการ deploy applications, setup CI/CD, และ infrastructure configuration',
    showWorkspace: false,
    features: [
      'Deployment scripts',
      'CI/CD setup',
      'Docker configuration',
      'Environment variables',
      'Production optimization',
      'Monitoring setup'
    ]
  }
}

export function getAIModeConfig(mode: AIMode): AIModeConfig {
  return AI_MODE_CONFIGS[mode]
}

export function getAllAIModes(): AIModeConfig[] {
  return Object.values(AI_MODE_CONFIGS)
}

export function getAgentForMode(mode: AIMode): AgentType {
  return AI_MODE_CONFIGS[mode].agent
}
