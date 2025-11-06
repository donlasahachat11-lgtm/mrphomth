import { callAgent, parseAgentResponse } from '@/lib/vanchin';

import type { Agent1Output } from './Agent1';

export interface Agent2Output {
  database_schema: {
    tables: Array<{
      name: string;
      columns: string[];
    }>;
  };
  folder_structure: {
    app: string[];
    components: string[];
    lib: string[];
  };
  api_endpoints: string[];
  dependencies: Record<string, string>;
}

export async function executeAgent2(agent1Output: Agent1Output): Promise<Agent2Output> {
  const prompt = `
You are a senior software engineer. Based on the following project specification, design the system architecture. The output must be a JSON object.

Project Specification:
${JSON.stringify(agent1Output, null, 2)}

Generate a JSON object with the following structure:
{
  "database_schema": {
    "tables": [
      {
        "name": "<table_name>",
        "columns": ["<column_1>", "<column_2>", ...]
      }
    ]
  },
  "folder_structure": {
    "app": ["<folder_1>", "<folder_2>", ...],
    "components": ["<component_1>", "<component_2>", ...],
    "lib": ["<lib_1>", "<lib_2>", ...]
  },
  "api_endpoints": ["<endpoint_1>", "<endpoint_2>", ...],
  "dependencies": {
    "<dependency_1>": "<version>",
    "<dependency_2>": "<version>",
    ...
  }
}

Rules:
- Design a scalable and maintainable architecture
- Include all necessary database tables with proper columns
- Organize folders logically
- Define clear API endpoints
- Use latest stable versions of dependencies

Respond with ONLY the JSON object, no additional text.
  `.trim();

  const response = await callAgent('agent2', prompt, {
    temperature: 0.7,
    max_tokens: 2500,
  });

  return parseAgentResponse<Agent2Output>(response);
}
