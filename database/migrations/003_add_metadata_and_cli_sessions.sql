-- Migration 003: Add metadata column and CLI sessions support
-- This migration adds support for VanchinAI endpoint IDs and CLI session management

-- Add metadata column to api_keys table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create CLI sessions table for managing local CLI connections
CREATE TABLE IF NOT EXISTS cli_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  machine_id TEXT,
  machine_name TEXT,
  os_info TEXT,
  cli_version TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create deployment_logs table for tracking deployments
CREATE TABLE IF NOT EXISTS deployment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  deployment_url TEXT,
  deployment_provider TEXT, -- 'vercel', 'netlify', 'github-pages', etc.
  deployment_status TEXT NOT NULL DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'deploying', 'success', 'failed')),
  deployment_metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tool_executions table for tracking CLI tool usage
CREATE TABLE IF NOT EXISTS tool_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_log_id UUID REFERENCES agent_logs(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_parameters JSONB NOT NULL,
  tool_result JSONB,
  execution_status TEXT NOT NULL DEFAULT 'pending' CHECK (execution_status IN ('pending', 'running', 'success', 'failed')),
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_metadata ON api_keys USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_cli_sessions_user_id ON cli_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cli_sessions_session_token ON cli_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_cli_sessions_status ON cli_sessions(status);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_project_id ON deployment_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_status ON deployment_logs(deployment_status);
CREATE INDEX IF NOT EXISTS idx_tool_executions_project_id ON tool_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_agent_log_id ON tool_executions(agent_log_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_status ON tool_executions(execution_status);

-- Create trigger for updating last_seen_at in cli_sessions
CREATE OR REPLACE FUNCTION update_cli_session_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_cli_sessions_last_seen
BEFORE UPDATE ON cli_sessions
FOR EACH ROW
EXECUTE FUNCTION update_cli_session_last_seen();

-- Enable Row Level Security
ALTER TABLE cli_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_executions ENABLE ROW LEVEL SECURITY;

-- RLS policies for cli_sessions
CREATE POLICY "Users can view their own CLI sessions"
  ON cli_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CLI sessions"
  ON cli_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CLI sessions"
  ON cli_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CLI sessions"
  ON cli_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for deployment_logs
CREATE POLICY "Users can view deployment logs for their projects"
  ON deployment_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = deployment_logs.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert deployment logs for their projects"
  ON deployment_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = deployment_logs.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- RLS policies for tool_executions
CREATE POLICY "Users can view tool executions for their projects"
  ON tool_executions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = tool_executions.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tool executions for their projects"
  ON tool_executions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = tool_executions.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE cli_sessions IS 'Tracks active CLI connections from user machines';
COMMENT ON TABLE deployment_logs IS 'Records deployment history and status for projects';
COMMENT ON TABLE tool_executions IS 'Logs individual tool executions during agent chain runs';
COMMENT ON COLUMN api_keys.metadata IS 'Stores additional provider-specific data like VanchinAI endpoint IDs';
