## Database Migrations for Mr.Promth

This directory contains all database migration scripts for the Mr.Promth project. These migrations are designed to be run on Supabase PostgreSQL.

### Migration Files

#### 001_initial_schema.sql
**Purpose:** Initial database schema setup

**Tables Created:**
- `api_keys` - Encrypted API key storage for multiple providers
- `chat_sessions` - Chat history management
- `prompts` - Saved prompt templates
- `messages` - Individual chat messages
- `user_profiles` - User preferences and profile data

**Features:**
- Row Level Security (RLS) enabled on all tables
- Automatic `updated_at` timestamp triggers
- Comprehensive indexes for performance
- Secure policies for user data isolation

#### 002_agent_chain_schema.sql
**Purpose:** Agent chain execution tracking

**Tables Created:**
- `projects` - High-level project information and status
- `agent_logs` - Detailed execution logs for each agent in the chain

**Features:**
- Tracks project generation progress
- Stores agent outputs and errors
- Links to user accounts via RLS

#### 003_add_metadata_and_cli_sessions.sql
**Purpose:** CLI integration and deployment tracking

**Tables Created:**
- `cli_sessions` - Active CLI connection management
- `deployment_logs` - Deployment history and status
- `tool_executions` - Individual tool execution tracking

**Modifications:**
- Adds `metadata` JSONB column to `api_keys` table for provider-specific data (e.g., VanchinAI endpoint IDs)

**Features:**
- CLI session lifecycle management
- Deployment tracking across multiple providers
- Granular tool execution logging
- Support for VanchinAI multi-agent configuration

### How to Run Migrations

#### Option 1: Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of each migration file in order:
   - `001_initial_schema.sql`
   - `002_agent_chain_schema.sql`
   - `003_add_metadata_and_cli_sessions.sql`
5. Execute each migration

#### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Option 3: Direct PostgreSQL Connection

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run each migration file
\i database/migrations/001_initial_schema.sql
\i database/migrations/002_agent_chain_schema.sql
\i database/migrations/003_add_metadata_and_cli_sessions.sql
```

### Database Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Management                         │
├─────────────────────────────────────────────────────────────┤
│ auth.users (Supabase Auth)                                   │
│   └── user_profiles                                          │
│   └── api_keys (with metadata for VanchinAI endpoints)       │
│   └── cli_sessions                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Project Generation                        │
├─────────────────────────────────────────────────────────────┤
│ projects                                                     │
│   └── agent_logs                                             │
│   └── tool_executions                                        │
│   └── deployment_logs                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Chat & Prompts                           │
├─────────────────────────────────────────────────────────────┤
│ chat_sessions                                                │
│   └── messages                                               │
│ prompts                                                      │
└─────────────────────────────────────────────────────────────┘
```

### VanchinAI Integration

The `api_keys` table now includes a `metadata` JSONB column to store provider-specific configuration. For VanchinAI, this allows storing endpoint IDs for the 14 different agents.

**Example API Key Entry for VanchinAI:**

```sql
INSERT INTO api_keys (user_id, provider, encrypted_key, key_hash, masked_key, metadata)
VALUES (
  'user-uuid',
  'vanchin',
  'encrypted-api-key-here',
  'hash-here',
  'WW8G...T9g',
  '{
    "endpoint_id": "ep-lpvcnv-1761467347624133479",
    "agent_name": "Agent 1",
    "description": "General purpose AI assistant"
  }'::jsonb
);
```

### Security Features

All tables implement Row Level Security (RLS) with the following principles:

- **User Isolation:** Users can only access their own data
- **Cascade Deletion:** Related records are automatically deleted when parent records are removed
- **Encrypted Storage:** API keys are encrypted using AES-256-GCM
- **Audit Trail:** All tables include `created_at` timestamps, and most include `updated_at`

### Testing Migrations

After running migrations, verify the schema:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

### Rollback (If Needed)

If you need to rollback migrations, you can drop tables in reverse order:

```sql
-- Drop tables created in migration 003
DROP TABLE IF EXISTS tool_executions CASCADE;
DROP TABLE IF EXISTS deployment_logs CASCADE;
DROP TABLE IF EXISTS cli_sessions CASCADE;

-- Drop tables created in migration 002
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Drop tables created in migration 001
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_cli_session_last_seen() CASCADE;
```

### Next Steps

After running migrations:

1. ✅ Verify all tables are created
2. ✅ Test RLS policies with test user accounts
3. ✅ Add VanchinAI API keys via the application UI
4. ✅ Configure environment variables for the backend
5. ✅ Test CLI session creation and management

### Support

For issues with migrations:
- Check Supabase logs in the dashboard
- Verify PostgreSQL version compatibility (PostgreSQL 14+)
- Ensure proper permissions for the database user
- Review RLS policies if data access issues occur
