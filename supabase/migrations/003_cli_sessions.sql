-- CLI session tracking table for mr-promth CLI connections

CREATE TABLE IF NOT EXISTS cli_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  machine_id TEXT,
  project_directory TEXT,
  version TEXT,
  status TEXT NOT NULL DEFAULT 'connected',
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cli_sessions_user_id ON cli_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cli_sessions_session_token ON cli_sessions(session_token);

ALTER TABLE cli_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cli sessions"
  ON cli_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their cli sessions"
  ON cli_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cli sessions"
  ON cli_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their cli sessions"
  ON cli_sessions
  FOR DELETE
  USING (auth.uid() = user_id);
