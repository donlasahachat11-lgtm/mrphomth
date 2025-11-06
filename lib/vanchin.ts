import { OpenAI } from 'openai';

const VANCHIN_BASE_URL = 'https://vanchin.streamlake.ai/api/gateway/v1/endpoints';

export const AGENT_ENDPOINTS = {
  agent1: 'ep-lpvcnv-1761467347624133479',
  agent2: 'ep-j9pysc-1761467653839114083',
  agent3: 'ep-2uyob4-1761467835762653881',
  agent4: 'ep-nqjal5-1762460264139958733',
  agent5: 'ep-mhsvw6-1762460362477023705',
  agent6: 'ep-h614n9-1762460436283699679',
  agent7: 'ep-ohxawl-1762460514611065743',
} satisfies Record<string, string>;

export async function getAgentApiKey(agentId: string): Promise<string> {
  const envKey = process.env[`VANCHIN_AGENT_${agentId.toUpperCase()}_KEY`];
  if (!envKey) {
    throw new Error(`Missing API key for agent ${agentId}`);
  }
  return envKey;
}

export function createVanchinClient(apiKey: string) {
  if (!apiKey) {
    throw new Error('VanchinAI API key is required');
  }

  return new OpenAI({
    baseURL: VANCHIN_BASE_URL,
    apiKey,
  });
}

export async function callAgent(
  agentId: keyof typeof AGENT_ENDPOINTS,
  prompt: string,
  options?: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  },
): Promise<string> {
  const apiKey = await getAgentApiKey(agentId);
  const client = createVanchinClient(apiKey);
  const endpointId = AGENT_ENDPOINTS[agentId];

  const completion = await client.chat.completions.create({
    model: endpointId,
    messages: [
      {
        role: 'system',
        content: 'You are a world-class software developer. Always respond with valid JSON when requested.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 4000,
    stream: options?.stream ?? false,
  });

  return completion.choices[0]?.message?.content ?? '';
}

export function parseAgentResponse<T>(response: string): T {
  try {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T;
    }
    return JSON.parse(response) as T;
  } catch (error) {
    throw new Error(`Failed to parse agent response: ${error instanceof Error ? error.message : error}`);
  }
}
