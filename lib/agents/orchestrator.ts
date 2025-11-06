import { executeAgent1, type Agent1Output } from '@/lib/agents/Agent1';
import { executeAgent2, type Agent2Output } from '@/lib/agents/Agent2';

export interface AgentChainProgress {
  current_agent: number;
  total_agents: number;
  agent_name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: unknown;
  error?: string;
}

export type ProgressCallback = (progress: AgentChainProgress) => Promise<void> | void;

export interface AgentChainResult {
  agent1_output: Agent1Output;
  agent2_output: Agent2Output;
  final_project: {
    code: Record<string, string>;
    database: string;
    deployment: Record<string, unknown>;
  };
}

const AGENT_COUNT = 7;

export class AgentChainOrchestrator {
  constructor(private readonly onProgress?: ProgressCallback) {}

  private async reportProgress(progress: AgentChainProgress) {
    if (this.onProgress) {
      await this.onProgress(progress);
    }
  }

  async execute(userPrompt: string): Promise<AgentChainResult> {
    const result: Partial<AgentChainResult> = {};

    try {
      await this.reportProgress({
        current_agent: 1,
        total_agents: AGENT_COUNT,
        agent_name: 'Prompt Expander & Analyzer',
        status: 'running',
      });

      const agent1Output = await executeAgent1(userPrompt);
      result.agent1_output = agent1Output;

      await this.reportProgress({
        current_agent: 1,
        total_agents: AGENT_COUNT,
        agent_name: 'Prompt Expander & Analyzer',
        status: 'completed',
        output: agent1Output,
      });

      await this.reportProgress({
        current_agent: 2,
        total_agents: AGENT_COUNT,
        agent_name: 'Architecture Designer',
        status: 'running',
      });

      const agent2Output = await executeAgent2(agent1Output);
      result.agent2_output = agent2Output;

      await this.reportProgress({
        current_agent: 2,
        total_agents: AGENT_COUNT,
        agent_name: 'Architecture Designer',
        status: 'completed',
        output: agent2Output,
      });

      result.final_project = {
        code: {},
        database: '',
        deployment: {},
      };

      return result as AgentChainResult;
    } catch (error) {
      await this.reportProgress({
        current_agent: 0,
        total_agents: AGENT_COUNT,
        agent_name: 'Agent Chain',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}
