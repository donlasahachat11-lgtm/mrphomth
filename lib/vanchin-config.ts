/**
 * VanchinAI Agent Configuration
 * 
 * This file contains all VanchinAI agent endpoints and their API keys.
 * Each agent is specialized for a specific task in the AI agent chain.
 */

export interface VanchinAgent {
  name: string;
  description: string;
  apiKey: string;
  endpoint: string;
}

export const VANCHIN_BASE_URL = "https://vanchin.streamlake.ai/api/gateway/v1/endpoints";

/**
 * VanchinAI Agent Endpoints
 * 
 * แต่ละ agent มีหน้าที่เฉพาะในการสร้างเว็บไซต์:
 * 1. Prompt Expander - ขยายความ prompt ให้ละเอียด
 * 2. Architecture Designer - ออกแบบ database และ API structure
 * 3. Backend Developer - สร้าง API routes และ authentication
 * 4. Frontend Developer - สร้าง React components และ pages
 * 5. Integration Specialist - เชื่อมต่อ frontend กับ backend
 * 6. Quality Assurance - ตรวจสอบคุณภาพและสร้าง tests
 * 7. Deployment Expert - เตรียมและ optimize สำหรับ production
 */
export const VANCHIN_AGENTS: Record<string, VanchinAgent> = {
  PROMPT_EXPANDER: {
    name: "Prompt Expander",
    description: "Analyzes and expands user prompts into detailed specifications",
    apiKey: process.env.VANCHIN_PROMPT_EXPANDER_KEY || "WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g",
    endpoint: "ep-lpvcnv-1761467347624133479",
  },
  
  ARCHITECTURE_DESIGNER: {
    name: "Architecture Designer",
    description: "Designs database schema, API structure, and folder organization",
    apiKey: process.env.VANCHIN_ARCHITECTURE_KEY || "3gZ9oCeG3sgxUTcfesqhfVnkAOO3JAEJTZWeQKwqzrk",
    endpoint: "ep-j9pysc-1761467653839114083",
  },
  
  BACKEND_DEVELOPER: {
    name: "Backend Developer",
    description: "Creates database migrations, API routes, and authentication",
    apiKey: process.env.VANCHIN_BACKEND_KEY || "npthpUsOWQ68u2VibXDmN3IWTM2IGDJeAxQQL1HVQ50",
    endpoint: "ep-2uyob4-1761467835762653881",
  },
  
  FRONTEND_DEVELOPER: {
    name: "Frontend Developer",
    description: "Builds React components, pages, and responsive layouts",
    apiKey: process.env.VANCHIN_FRONTEND_KEY || "l1BsR_0ttZ9edaMf9NGBhFzuAfAS64KUmDGAkaz4VBU",
    endpoint: "ep-nqjal5-1762460264139958733",
  },
  
  INTEGRATION_SPECIALIST: {
    name: "Integration Specialist",
    description: "Connects frontend with backend, adds state management",
    apiKey: process.env.VANCHIN_INTEGRATION_KEY || "Bt5nUT0GnP20fjZLDKsIvQKW5KOOoU4OsmQrK8SuUE8",
    endpoint: "ep-mhsvw6-1762460362477023705",
  },
  
  QUALITY_ASSURANCE: {
    name: "Quality Assurance",
    description: "Generates tests, ensures code quality and accessibility",
    apiKey: process.env.VANCHIN_QA_KEY || "vsgJFTYUao7OVR7_hfvrbKX2AMykOAEwuwEPomro-zg",
    endpoint: "ep-h614n9-1762460436283699679",
  },
  
  DEPLOYMENT_EXPERT: {
    name: "Deployment Expert",
    description: "Optimizes performance and prepares for production deployment",
    apiKey: process.env.VANCHIN_DEPLOYMENT_KEY || "pgBW4ALnqV-RtjlC4EICPbOcH_mY4jpQKAu3VXX6Y9k",
    endpoint: "ep-ohxawl-1762460514611065743",
  },
};

/**
 * Additional VanchinAI Agents (Backup/Alternative)
 */
export const VANCHIN_ADDITIONAL_AGENTS: Record<string, VanchinAgent> = {
  AGENT_8: {
    name: "Agent 8",
    description: "Additional specialized agent",
    apiKey: "cOkB4mwHHjs95szkuOLGyoSRtzTwP2u6-0YBdcQKszI",
    endpoint: "ep-bng3os-1762460592040033785",
  },
  
  AGENT_9: {
    name: "Agent 9",
    description: "Additional specialized agent",
    apiKey: "6quSWJIN9tLotXUQNQypn_U2u6BwvvVLAOk7pgl7ybI",
    endpoint: "ep-kazx9x-1761818165668826967",
  },
  
  AGENT_10: {
    name: "Agent 10",
    description: "Additional specialized agent",
    apiKey: "Co8IQ684LePQeq4t2bCB567d4zFa92N_7zaZLhJqkTo",
    endpoint: "ep-6bl8j9-1761818251624808527",
  },
  
  AGENT_11: {
    name: "Agent 11",
    description: "Additional specialized agent",
    apiKey: "a9ciwI-1lgQW8128LG-QK_W0XWtYZ5Kt2aa2Zkjrq9w",
    endpoint: "ep-2d9ubo-1761818334800110875",
  },
  
  AGENT_12: {
    name: "Agent 12",
    description: "Additional specialized agent",
    apiKey: "Ln-Z6aKGDxaMGXvN9hjMunpDNr975AncIpRtK7XrtTw",
    endpoint: "ep-dnxrl0-1761818420368606961",
  },
  
  AGENT_13: {
    name: "Agent 13",
    description: "Additional specialized agent",
    apiKey: "CzQtP9g9qwM6wyxKJZ9spUloShOYH8hR-CHcymRks6w",
    endpoint: "ep-nmgm5b-1761818484923833700",
  },
  
  AGENT_14: {
    name: "Agent 14",
    description: "Additional specialized agent",
    apiKey: "ylFdJan4VXsgm698_XaQZrc9KC_1EE7MRARV6sNapzI",
    endpoint: "ep-8rvmfy-1762460863026449765",
  },
};

/**
 * Get all available agents
 */
export function getAllAgents(): VanchinAgent[] {
  return [
    ...Object.values(VANCHIN_AGENTS),
    ...Object.values(VANCHIN_ADDITIONAL_AGENTS),
  ];
}

/**
 * Get agent by name
 */
export function getAgent(name: keyof typeof VANCHIN_AGENTS): VanchinAgent {
  return VANCHIN_AGENTS[name];
}

/**
 * Validate agent configuration
 */
export function validateAgentConfig(agent: VanchinAgent): boolean {
  return !!(agent.name && agent.apiKey && agent.endpoint);
}
