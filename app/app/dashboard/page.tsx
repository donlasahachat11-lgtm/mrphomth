'use client';

import { useMemo, useState } from 'react';

import { AgentChainProgress } from '@/components/AgentChainProgress';
import { PromptInput } from '@/components/PromptInput';
import { ProjectOutput } from '@/components/ProjectOutput';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasProject = useMemo(() => Boolean(projectId), [projectId]);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/agent-chain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to start agent chain');
      }

      setProjectId(payload.project_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setProjectId(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-card/60 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Agent Chain
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
                Launch a production-ready build from a single prompt.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                Mr.Promth expands your idea, architects the system, generates backend and frontend code, and prepares
                the deployment package—automatically.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <FeaturePill label="Specification" />
              <FeaturePill label="Architecture" />
              <FeaturePill label="Database" />
              <FeaturePill label="Frontend" />
              <FeaturePill label="Integration" />
              <FeaturePill label="Testing" />
              <FeaturePill label="Deployment" />
            </div>
          </div>
          {hasProject ? (
            <Button variant="outline" onClick={handleReset} className="self-start">
              Start New Project
            </Button>
          ) : null}
        </div>
      </section>

      <PromptInput onGenerate={handleGenerate} isLoading={isGenerating} />

      {error ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {hasProject ? (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <ProjectOutput projectId={projectId!} />
          </div>
          <div className="space-y-6">
            <AgentChainProgress projectId={projectId!} />
          </div>
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-10 text-center text-sm text-muted-foreground">
          Start by describing your product vision. Mr.Promth orchestrates seven specialized agents to deliver a production-ready experience.
        </section>
      )}
    </div>
  );
}

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
      {label}
    </span>
  );
}
