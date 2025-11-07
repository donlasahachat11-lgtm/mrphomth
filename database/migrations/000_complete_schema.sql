-- ============================================================================
-- Mr.Promth Complete Database Schema
-- ============================================================================
-- This is a comprehensive migration that sets up the entire database schema
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: CORE TABLES (from 001_initial_schema.sql)
-- ============================================================================

-- Create api_keys table for encrypted API key storage
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  masked_key VARCHAR(20) NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_sessions table for chat history
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT 'New Chat',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create prompts table for saved prompts
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table for chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  provider_message_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_profiles table for user preferences
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  preferences JSONB DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PART 2: AGENT CHAIN TABLES (from 002_agent_chain_schema.sql)
-- ============================================================================

-- Projects table stores high-level run information
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  current_agent INTEGER DEFAULT 1,
  agent_outputs JSONB DEFAULT '{}'::jsonb,
  final_output JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Execution logs for each agent step
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_number INTEGER NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL,
  input JSONB,
  output JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PART 3: CLI & DEPLOYMENT TABLES (from 003_add_metadata_and_cli_sessions.sql)
-- ============================================================================

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
  deployment_provider TEXT,
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

-- ============================================================================
-- PART 4: INDEXES
-- ============================================================================

-- Indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_metadata ON api_keys USING GIN (metadata);

-- Indexes for chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at);

-- Indexes for prompts
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Indexes for agent_logs
CREATE INDEX IF NOT EXISTS idx_agent_logs_project_id ON agent_logs(project_id);

-- Indexes for cli_sessions
CREATE INDEX IF NOT EXISTS idx_cli_sessions_user_id ON cli_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cli_sessions_session_token ON cli_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_cli_sessions_status ON cli_sessions(status);

-- Indexes for deployment_logs
CREATE INDEX IF NOT EXISTS idx_deployment_logs_project_id ON deployment_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_status ON deployment_logs(deployment_status);

-- Indexes for tool_executions
CREATE INDEX IF NOT EXISTS idx_tool_executions_project_id ON tool_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_agent_log_id ON tool_executions(agent_log_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_status ON tool_executions(execution_status);

-- ============================================================================
-- PART 5: TRIGGERS & FUNCTIONS
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating last_seen_at in cli_sessions
CREATE OR REPLACE FUNCTION update_cli_session_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cli_sessions_last_seen ON cli_sessions;
CREATE TRIGGER update_cli_sessions_last_seen BEFORE UPDATE ON cli_sessions FOR EACH ROW EXECUTE FUNCTION update_cli_session_last_seen();

-- ============================================================================
-- PART 6: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cli_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_executions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own api_keys" ON api_keys;

DROP POLICY IF EXISTS "Users can view own chat_sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat_sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat_sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat_sessions" ON chat_sessions;

DROP POLICY IF EXISTS "Users can view own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can insert own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete own prompts" ON prompts;

DROP POLICY IF EXISTS "Users can view messages in own sessions" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in own sessions" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

DROP POLICY IF EXISTS "Users can view logs for their projects" ON agent_logs;

DROP POLICY IF EXISTS "Users can view their own CLI sessions" ON cli_sessions;
DROP POLICY IF EXISTS "Users can insert their own CLI sessions" ON cli_sessions;
DROP POLICY IF EXISTS "Users can update their own CLI sessions" ON cli_sessions;
DROP POLICY IF EXISTS "Users can delete their own CLI sessions" ON cli_sessions;

DROP POLICY IF EXISTS "Users can view deployment logs for their projects" ON deployment_logs;
DROP POLICY IF EXISTS "Users can insert deployment logs for their projects" ON deployment_logs;

DROP POLICY IF EXISTS "Users can view tool executions for their projects" ON tool_executions;
DROP POLICY IF EXISTS "Users can insert tool executions for their projects" ON tool_executions;

-- RLS policies for api_keys
CREATE POLICY "Users can view own api_keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own api_keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own api_keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own api_keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for chat_sessions
CREATE POLICY "Users can view own chat_sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat_sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat_sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat_sessions" ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for prompts
CREATE POLICY "Users can view own prompts" ON prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prompts" ON prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prompts" ON prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prompts" ON prompts FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for messages
CREATE POLICY "Users can view messages in own sessions" ON messages FOR SELECT USING (
  session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert messages in own sessions" ON messages FOR INSERT WITH CHECK (
  session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (
  session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE USING (
  session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
);

-- RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- RLS policies for projects
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- RLS policy for viewing agent logs via owning project
CREATE POLICY "Users can view logs for their projects" ON agent_logs FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM projects
    WHERE projects.id = agent_logs.project_id
      AND projects.user_id = auth.uid()
  )
);

-- RLS policies for cli_sessions
CREATE POLICY "Users can view their own CLI sessions" ON cli_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own CLI sessions" ON cli_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own CLI sessions" ON cli_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own CLI sessions" ON cli_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for deployment_logs
CREATE POLICY "Users can view deployment logs for their projects" ON deployment_logs FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM projects
    WHERE projects.id = deployment_logs.project_id
      AND projects.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert deployment logs for their projects" ON deployment_logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM projects
    WHERE projects.id = deployment_logs.project_id
      AND projects.user_id = auth.uid()
  )
);

-- RLS policies for tool_executions
CREATE POLICY "Users can view tool executions for their projects" ON tool_executions FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM projects
    WHERE projects.id = tool_executions.project_id
      AND projects.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert tool executions for their projects" ON tool_executions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM projects
    WHERE projects.id = tool_executions.project_id
      AND projects.user_id = auth.uid()
  )
);

-- ============================================================================
-- PART 7: INITIAL DATA
-- ============================================================================

-- Insert default user profile for existing users
INSERT INTO user_profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 8: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE api_keys IS 'Stores encrypted API keys for multiple providers (OpenAI, VanchinAI, etc.)';
COMMENT ON TABLE chat_sessions IS 'Stores chat session metadata';
COMMENT ON TABLE prompts IS 'Stores saved prompt templates';
COMMENT ON TABLE messages IS 'Stores individual chat messages';
COMMENT ON TABLE user_profiles IS 'Stores user preferences and profile data';
COMMENT ON TABLE projects IS 'Stores high-level project generation information';
COMMENT ON TABLE agent_logs IS 'Stores detailed execution logs for each agent in the chain';
COMMENT ON TABLE cli_sessions IS 'Tracks active CLI connections from user machines';
COMMENT ON TABLE deployment_logs IS 'Records deployment history and status for projects';
COMMENT ON TABLE tool_executions IS 'Logs individual tool executions during agent chain runs';

COMMENT ON COLUMN api_keys.metadata IS 'Stores additional provider-specific data like VanchinAI endpoint IDs';
COMMENT ON COLUMN api_keys.encrypted_key IS 'API key encrypted with AES-256-GCM';
COMMENT ON COLUMN api_keys.key_hash IS 'SHA-256 hash of the API key for verification';
COMMENT ON COLUMN api_keys.masked_key IS 'Partially masked key for display in UI (e.g., "WW8G...T9g")';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Total tables created: 10
-- Total indexes created: 20+
-- Total RLS policies created: 30+
-- ============================================================================
