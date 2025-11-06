'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface Agent1Output {
  project_type: string;
  features: string[];
  pages: string[];
  tech_stack: {
    frontend: string;
    styling: string;
    database: string;
    payment?: string;
  };
  design_style: string;
  expanded_prompt: string;
}

interface Agent2Output {
  database_schema: {
    tables: Array<{ name: string; columns: string[] }>;
  };
  folder_structure: {
    app: string[];
    components: string[];
    lib: string[];
  };
  api_endpoints: string[];
  dependencies: Record<string, string>;
}

interface AgentChainResultPayload {
  agent1_output?: Agent1Output;
  agent2_output?: Agent2Output;
  final_project?: {
    code: Record<string, string>;
    database: string;
    deployment: Record<string, unknown>;
  };
}

interface ProjectEntity {
  status: 'pending' | 'running' | 'completed' | 'error';
  current_agent: number;
  final_output?: AgentChainResultPayload | null;
  error_message?: string | null;
}

interface ProjectResponse {
  project: ProjectEntity;
  logs: unknown[];
}

interface ProjectOutputProps {
  projectId: string;
}

export function ProjectOutput({ projectId }: ProjectOutputProps) {
  const [data, setData] = useState<ProjectResponse | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let isCancelled = false;

    const load = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to load project');
        }

        const payload: ProjectResponse = await response.json();
        if (!isCancelled) {
          setData(payload);
          const isTerminal = ['completed', 'error'].includes(payload.project.status);
          if (!isTerminal) {
            timer = setTimeout(load, 2500);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          timer = setTimeout(load, 5000);
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

  const project = data?.project;

  const agent1 = useMemo(() => project?.final_output?.agent1_output, [project]);
  const agent2 = useMemo(() => project?.final_output?.agent2_output, [project]);
  const finalProject = useMemo(() => project?.final_output?.final_project, [project]);

  const isCompleted = project?.status === 'completed';
  const isErrored = project?.status === 'error';

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Deliverables</p>
          <h2 className="text-xl font-semibold text-foreground">Generated Outputs</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {isCompleted ? 'Ready' : isErrored ? 'Error' : 'In Progress'}
        </span>
      </div>

      {!project ? (
        <div className="space-y-4">
          <div className="h-4 w-40 animate-pulse rounded-full bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
        </div>
      ) : isErrored ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">
          <h3 className="text-base font-semibold">Agent chain failed</h3>
          <p className="mt-2 text-sm text-destructive/80">{project.error_message ?? 'Unknown error occurred.'}</p>
        </div>
      ) : !isCompleted ? (
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-sm text-muted-foreground">
          Mr.Promth is generating artefacts. The completed specification, architecture, and code will appear here.
        </div>
      ) : (
        <div className="space-y-6">
          {agent1 ? (
            <article className="rounded-xl border border-border/60 bg-background/60 p-5">
              <header className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Project Specification</h3>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Agent 1
                </span>
              </header>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Project Type</p>
                  <p className="text-base font-medium text-foreground">{agent1.project_type}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Design Style</p>
                  <p className="text-base font-medium text-foreground">{agent1.design_style}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <InfoPillList title="Features" values={agent1.features} />
                <InfoPillList title="Pages" values={agent1.pages} />
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tech Stack</p>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <StackBadge label="Frontend" value={agent1.tech_stack.frontend} />
                  <StackBadge label="Styling" value={agent1.tech_stack.styling} />
                  <StackBadge label="Database" value={agent1.tech_stack.database} />
                  {agent1.tech_stack.payment ? (
                    <StackBadge label="Payment" value={agent1.tech_stack.payment} />
                  ) : null}
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Expanded Prompt</p>
                <p className="rounded-lg border border-border/50 bg-background/80 p-4 text-sm leading-relaxed text-muted-foreground">
                  {agent1.expanded_prompt}
                </p>
              </div>
            </article>
          ) : null}

          {agent2 ? (
            <article className="rounded-xl border border-border/60 bg-background/60 p-5">
              <header className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">System Architecture</h3>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Agent 2
                </span>
              </header>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <SectionTitle>Database Schema</SectionTitle>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {agent2.database_schema.tables.map((table) => (
                      <li key={table.name} className="rounded-lg border border-border/50 bg-background/80 p-3">
                        <p className="text-sm font-semibold text-foreground">{table.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">Columns</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {table.columns.join(', ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <SectionTitle>Folder Structure</SectionTitle>
                    <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-3">
                      <FolderList title="app" items={agent2.folder_structure.app} />
                      <FolderList title="components" items={agent2.folder_structure.components} />
                      <FolderList title="lib" items={agent2.folder_structure.lib} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <SectionTitle>API Endpoints</SectionTitle>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {agent2.api_endpoints.map((endpoint) => (
                        <li key={endpoint} className="rounded-lg border border-border/60 bg-background/80 px-3 py-2">
                          {endpoint}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <SectionTitle>Dependencies</SectionTitle>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {Object.entries(agent2.dependencies).map(([name, version]) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1"
                        >
                          <strong className="font-semibold text-foreground">{name}</strong>
                          <span>{version}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ) : null}

          {finalProject ? (
            <article className="rounded-xl border border-border/60 bg-background/60 p-5">
              <header className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Production Package</h3>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Orchestrator
                </span>
              </header>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <SectionTitle>Generated Code</SectionTitle>
                  <div className="max-h-72 overflow-auto rounded-lg border border-border/50 bg-background/80 p-3 text-xs text-muted-foreground">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(finalProject.code, null, 2)}</pre>
                  </div>
                </div>
                <div className="space-y-3">
                  <SectionTitle>Database Migration</SectionTitle>
                  <div className="max-h-72 overflow-auto rounded-lg border border-border/50 bg-background/80 p-3 text-xs text-muted-foreground">
                    <pre className="whitespace-pre-wrap">{finalProject.database}</pre>
                  </div>
                </div>
              </div>
              {Object.keys(finalProject.deployment || {}).length ? (
                <div className="mt-6 space-y-3">
                  <SectionTitle>Deployment Summary</SectionTitle>
                  <div className="rounded-lg border border-border/50 bg-background/80 p-4 text-sm text-muted-foreground">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(finalProject.deployment, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : null}
            </article>
          ) : null}
        </div>
      )}
    </section>
  );
}

interface InfoPillListProps {
  title: string;
  values: string[];
}

function InfoPillList({ title, values }: InfoPillListProps) {
  if (!values?.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-primary"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

interface StackBadgeProps {
  label: string;
  value?: string;
}

function StackBadge({ label, value }: StackBadgeProps) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </span>
  );
}

interface FolderListProps {
  title: string;
  items: string[];
}

function FolderList({ title, items }: FolderListProps) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-background/60 px-3 py-1">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{children}</p>;
}
