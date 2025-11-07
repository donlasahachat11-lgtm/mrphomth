-- Database Functions for Project Management
-- These functions provide helper utilities for managing projects and agent chains

-- Function to create a new project with initial setup
CREATE OR REPLACE FUNCTION create_project(
  p_user_id UUID,
  p_name TEXT,
  p_user_prompt TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_project_id UUID;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;

  -- Create the project
  INSERT INTO projects (user_id, name, user_prompt, status, current_agent)
  VALUES (p_user_id, p_name, p_user_prompt, 'pending', 1)
  RETURNING id INTO v_project_id;

  RETURN v_project_id;
END;
$$;

-- Function to update project status
CREATE OR REPLACE FUNCTION update_project_status(
  p_project_id UUID,
  p_status TEXT,
  p_current_agent INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE projects
  SET 
    status = p_status,
    current_agent = COALESCE(p_current_agent, current_agent),
    error_message = p_error_message,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_project_id;

  RETURN FOUND;
END;
$$;

-- Function to log agent execution
CREATE OR REPLACE FUNCTION log_agent_execution(
  p_project_id UUID,
  p_agent_number INTEGER,
  p_agent_name TEXT,
  p_status TEXT,
  p_input JSONB DEFAULT NULL,
  p_output JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO agent_logs (
    project_id,
    agent_number,
    agent_name,
    status,
    input,
    output,
    error_message,
    execution_time_ms
  )
  VALUES (
    p_project_id,
    p_agent_number,
    p_agent_name,
    p_status,
    p_input,
    p_output,
    p_error_message,
    p_execution_time_ms
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Function to log tool execution
CREATE OR REPLACE FUNCTION log_tool_execution(
  p_project_id UUID,
  p_agent_log_id UUID,
  p_tool_name TEXT,
  p_tool_parameters JSONB,
  p_tool_result JSONB DEFAULT NULL,
  p_execution_status TEXT DEFAULT 'pending',
  p_error_message TEXT DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_execution_id UUID;
BEGIN
  INSERT INTO tool_executions (
    project_id,
    agent_log_id,
    tool_name,
    tool_parameters,
    tool_result,
    execution_status,
    error_message,
    execution_time_ms,
    completed_at
  )
  VALUES (
    p_project_id,
    p_agent_log_id,
    p_tool_name,
    p_tool_parameters,
    p_tool_result,
    p_execution_status,
    p_error_message,
    p_execution_time_ms,
    CASE WHEN p_execution_status IN ('success', 'failed') THEN CURRENT_TIMESTAMP ELSE NULL END
  )
  RETURNING id INTO v_execution_id;

  RETURN v_execution_id;
END;
$$;

-- Function to get project progress summary
CREATE OR REPLACE FUNCTION get_project_progress(p_project_id UUID)
RETURNS TABLE (
  project_id UUID,
  project_name TEXT,
  status TEXT,
  current_agent INTEGER,
  total_agents INTEGER,
  completed_agents INTEGER,
  total_tools_executed INTEGER,
  successful_tools INTEGER,
  failed_tools INTEGER,
  total_execution_time_ms BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.status,
    p.current_agent,
    7 AS total_agents, -- We have 7 agents in the chain
    (SELECT COUNT(DISTINCT agent_number) FROM agent_logs WHERE project_id = p.id AND status = 'completed')::INTEGER,
    (SELECT COUNT(*) FROM tool_executions WHERE project_id = p.id)::INTEGER,
    (SELECT COUNT(*) FROM tool_executions WHERE project_id = p.id AND execution_status = 'success')::INTEGER,
    (SELECT COUNT(*) FROM tool_executions WHERE project_id = p.id AND execution_status = 'failed')::INTEGER,
    (SELECT COALESCE(SUM(execution_time_ms), 0) FROM agent_logs WHERE project_id = p.id)::BIGINT,
    p.created_at,
    p.updated_at
  FROM projects p
  WHERE p.id = p_project_id;
END;
$$;

-- Function to create or update CLI session
CREATE OR REPLACE FUNCTION upsert_cli_session(
  p_user_id UUID,
  p_session_token TEXT,
  p_machine_id TEXT DEFAULT NULL,
  p_machine_name TEXT DEFAULT NULL,
  p_os_info TEXT DEFAULT NULL,
  p_cli_version TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO cli_sessions (
    user_id,
    session_token,
    machine_id,
    machine_name,
    os_info,
    cli_version,
    status
  )
  VALUES (
    p_user_id,
    p_session_token,
    p_machine_id,
    p_machine_name,
    p_os_info,
    p_cli_version,
    'connected'
  )
  ON CONFLICT (session_token)
  DO UPDATE SET
    last_seen_at = CURRENT_TIMESTAMP,
    status = 'connected',
    machine_name = COALESCE(EXCLUDED.machine_name, cli_sessions.machine_name),
    os_info = COALESCE(EXCLUDED.os_info, cli_sessions.os_info),
    cli_version = COALESCE(EXCLUDED.cli_version, cli_sessions.cli_version)
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

-- Function to disconnect CLI session
CREATE OR REPLACE FUNCTION disconnect_cli_session(p_session_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE cli_sessions
  SET 
    status = 'disconnected',
    last_seen_at = CURRENT_TIMESTAMP
  WHERE session_token = p_session_token;

  RETURN FOUND;
END;
$$;

-- Function to log deployment
CREATE OR REPLACE FUNCTION log_deployment(
  p_project_id UUID,
  p_deployment_url TEXT DEFAULT NULL,
  p_deployment_provider TEXT DEFAULT NULL,
  p_deployment_status TEXT DEFAULT 'pending',
  p_deployment_metadata JSONB DEFAULT '{}'::jsonb,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deployment_id UUID;
BEGIN
  INSERT INTO deployment_logs (
    project_id,
    deployment_url,
    deployment_provider,
    deployment_status,
    deployment_metadata,
    error_message,
    deployed_at
  )
  VALUES (
    p_project_id,
    p_deployment_url,
    p_deployment_provider,
    p_deployment_status,
    p_deployment_metadata,
    p_error_message,
    CASE WHEN p_deployment_status = 'success' THEN CURRENT_TIMESTAMP ELSE NULL END
  )
  RETURNING id INTO v_deployment_id;

  -- Update project with deployment URL if successful
  IF p_deployment_status = 'success' AND p_deployment_url IS NOT NULL THEN
    UPDATE projects
    SET final_output = jsonb_set(
      COALESCE(final_output, '{}'::jsonb),
      '{deployment_url}',
      to_jsonb(p_deployment_url)
    )
    WHERE id = p_project_id;
  END IF;

  RETURN v_deployment_id;
END;
$$;

-- Function to get active CLI sessions for a user
CREATE OR REPLACE FUNCTION get_active_cli_sessions(p_user_id UUID)
RETURNS TABLE (
  session_id UUID,
  session_token TEXT,
  machine_id TEXT,
  machine_name TEXT,
  os_info TEXT,
  cli_version TEXT,
  connected_at TIMESTAMP WITH TIME ZONE,
  last_seen_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    cli_sessions.session_token,
    cli_sessions.machine_id,
    cli_sessions.machine_name,
    cli_sessions.os_info,
    cli_sessions.cli_version,
    cli_sessions.connected_at,
    cli_sessions.last_seen_at
  FROM cli_sessions
  WHERE 
    user_id = p_user_id 
    AND status = 'connected'
    AND last_seen_at > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
  ORDER BY last_seen_at DESC;
END;
$$;

-- Function to clean up old disconnected sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Mark sessions as disconnected if not seen in 10 minutes
  UPDATE cli_sessions
  SET status = 'disconnected'
  WHERE 
    status = 'connected'
    AND last_seen_at < CURRENT_TIMESTAMP - INTERVAL '10 minutes';

  -- Delete disconnected sessions older than 7 days
  DELETE FROM cli_sessions
  WHERE 
    status = 'disconnected'
    AND last_seen_at < CURRENT_TIMESTAMP - INTERVAL '7 days';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION create_project IS 'Creates a new project with initial setup';
COMMENT ON FUNCTION update_project_status IS 'Updates project status and current agent';
COMMENT ON FUNCTION log_agent_execution IS 'Logs the execution of an agent in the chain';
COMMENT ON FUNCTION log_tool_execution IS 'Logs individual tool execution during agent runs';
COMMENT ON FUNCTION get_project_progress IS 'Returns comprehensive progress summary for a project';
COMMENT ON FUNCTION upsert_cli_session IS 'Creates or updates a CLI session';
COMMENT ON FUNCTION disconnect_cli_session IS 'Marks a CLI session as disconnected';
COMMENT ON FUNCTION log_deployment IS 'Logs deployment information for a project';
COMMENT ON FUNCTION get_active_cli_sessions IS 'Returns all active CLI sessions for a user';
COMMENT ON FUNCTION cleanup_old_sessions IS 'Cleans up old disconnected CLI sessions';
