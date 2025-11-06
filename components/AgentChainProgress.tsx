'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const AGENTS = [
  'Prompt Expander & Analyzer',
  'Architecture Designer',
  'Database & Backend Developer',
  'Frontend Component Developer',
  'Integration & Logic Developer',
  'Testing & Quality Assurance',
  'Optimization & Deployment',
];

interface AgentLog {
  agent_number: number;
  agent_name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  created_at?: string;
  output?: unknown;
  error_message?: string | null;
}

interface AgentChainProgressProps {
  projectId: string;
}

interface ProjectResponse {
  project: {
    status: 'pending' | 'running' | 'completed' | 'error';
    current_agent: number;
    updated_at?: string;
  };
  logs: AgentLog[];
}

export function AgentChainProgress({ projectId }: AgentChainProgressProps) {
  const [data, setData] = useState<ProjectResponse | null>(null);

  const isComplete = data?.project.status === 'completed';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let isCancelled = false;

    const load = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to load agent progress');
        }

        const payload: ProjectResponse = await response.json();
        if (!isCancelled) {
          setData(payload);
          const isTerminal = ['completed', 'error'].includes(payload.project.status);
          if (!isTerminal) {
            timer = setTimeout(load, 2000);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          timer = setTimeout(load, 4000);
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [projectId]);

  const logsByAgent = useMemo(() => {
    if (!data) return new Map<number, AgentLog>();
    return new Map<number, AgentLog>(data.logs.map((log) => [log.agent_number, log]));
  }, [data]);

  return (
    <section className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Agent Chain</p>
          <h2 className="text-xl font-semibold text-foreground">Execution Timeline</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {isComplete ? 'Completed' : 'In Progress'}
        </span>
      </div>

      <div className="space-y-5">
        {AGENTS.map((label, index) => {
          const agentNumber = index + 1;
          const log = logsByAgent.get(agentNumber);
          const isRunning = data?.project.current_agent === agentNumber && data?.project.status === 'running';
          const isCompleted = log?.status === 'completed';
          const isError = log?.status === 'error';

          return (
            <article
              key={label}
              className="flex items-start gap-4 rounded-xl border border-border/70 bg-background/40 p-4"
            >
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                ) : isRunning ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : isError ? (
                  <Circle className="h-6 w-6 text-destructive" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">{label}</h3>
                  <span className="text-xs font-medium text-muted-foreground">Agent {agentNumber}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isCompleted
                    ? 'Task complete'
                    : isRunning
                    ? 'Currently orchestrating tasks'
                    : isError
                    ? 'Agent reported an error'
                    : 'Pending execution'}
                </p>
                {isError && log?.error_message ? (
                  <p className="text-sm text-destructive">{log.error_message}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
