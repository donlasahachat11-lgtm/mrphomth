import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { AgentChainOrchestrator } from '@/lib/agents/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: prompt.substring(0, 100),
        user_prompt: prompt,
        status: 'running',
        current_agent: 1,
        agent_outputs: {},
      })
      .select()
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    executeAgentChainInBackground(project.id, prompt, supabase).catch((error) => {
      console.error('Agent chain background error', error);
    });

    return NextResponse.json({
      project_id: project.id,
      status: 'running',
      message: 'Agent chain started',
    });
  } catch (error) {
    console.error('Agent chain error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function executeAgentChainInBackground(
  projectId: string,
  prompt: string,
  supabase: SupabaseClient,
) {
  const orchestrator = new AgentChainOrchestrator(async (progress) => {
    const status = progress.status === 'error' ? 'error' : 'running';

    await supabase
      .from('projects')
      .update({
        status,
        current_agent: progress.current_agent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (progress.current_agent > 0 && ['completed', 'error'].includes(progress.status)) {
      await supabase.from('agent_logs').insert({
        project_id: projectId,
        agent_number: progress.current_agent,
        agent_name: progress.agent_name,
        status: progress.status,
        output: progress.output ?? null,
        error_message: progress.error ?? null,
      });
    }
  });

  try {
    const result = await orchestrator.execute(prompt);

    await supabase
      .from('projects')
      .update({
        status: 'completed',
        final_output: result,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
  } catch (error) {
    await supabase
      .from('projects')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
  }
}
