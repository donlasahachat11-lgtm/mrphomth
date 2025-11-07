/**
 * VanchinAI Client Utility
 * 
 * OpenAI-compatible client for VanchinAI agents
 */

import { VANCHIN_BASE_URL, VANCHIN_AGENTS, type VanchinAgent } from "./vanchin-config";

export interface VanchinMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface VanchinCompletionOptions {
  model?: string;
  messages: VanchinMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface VanchinCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Create a VanchinAI client for a specific agent
 */
export function createVanchinClient(agentName: keyof typeof VANCHIN_AGENTS) {
  const agent = VANCHIN_AGENTS[agentName];
  
  if (!agent) {
    throw new Error(`Agent ${agentName} not found`);
  }

  return {
    agent,
    
    /**
     * Create a chat completion
     */
    async createCompletion(
      messages: VanchinMessage[],
      options?: Partial<VanchinCompletionOptions>
    ): Promise<VanchinCompletionResponse> {
      const response = await fetch(VANCHIN_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${agent.apiKey}`,
        },
        body: JSON.stringify({
          model: agent.endpoint,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 2000,
          stream: options?.stream ?? false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`VanchinAI API error: ${response.status} - ${error}`);
      }

      return response.json();
    },

    /**
     * Create a streaming chat completion
     */
    async createStreamingCompletion(
      messages: VanchinMessage[],
      onChunk: (chunk: string) => void,
      options?: Partial<VanchinCompletionOptions>
    ): Promise<void> {
      const response = await fetch(VANCHIN_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${agent.apiKey}`,
        },
        body: JSON.stringify({
          model: agent.endpoint,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 2000,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`VanchinAI API error: ${response.status} - ${error}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.trim() !== "");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    },
  };
}

/**
 * Example usage for Python developers
 * 
 * Python equivalent:
 * ```python
 * from openai import OpenAI
 * 
 * client = OpenAI(
 *     base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
 *     api_key="YOUR_API_KEY"
 * )
 * 
 * completion = client.chat.completions.create(
 *     model="ep-xxxxxxxxxxxxxxxxx",
 *     messages=[
 *         {"role": "system", "content": "You are an AI assistant"},
 *         {"role": "user", "content": "Hello!"}
 *     ]
 * )
 * 
 * print(completion.choices[0].message.content)
 * ```
 * 
 * TypeScript equivalent:
 * ```typescript
 * const client = createVanchinClient("PROMPT_EXPANDER");
 * 
 * const response = await client.createCompletion([
 *   { role: "system", content: "You are an AI assistant" },
 *   { role: "user", content: "Hello!" }
 * ]);
 * 
 * console.log(response.choices[0].message.content);
 * ```
 */

/**
 * Helper function to test an agent
 */
export async function testAgent(agentName: keyof typeof VANCHIN_AGENTS) {
  const client = createVanchinClient(agentName);
  
  console.log(`Testing agent: ${client.agent.name}`);
  console.log(`Description: ${client.agent.description}`);
  console.log(`Endpoint: ${client.agent.endpoint}`);
  
  try {
    const response = await client.createCompletion([
      { role: "system", content: "You are a helpful AI assistant" },
      { role: "user", content: "Say hello in one sentence" },
    ]);
    
    console.log(`Response: ${response.choices[0].message.content}`);
    console.log("✅ Agent test successful");
    
    return true;
  } catch (error) {
    console.error("❌ Agent test failed:", error);
    return false;
  }
}
