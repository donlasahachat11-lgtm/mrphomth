export interface Agent1Output {
  project_type: string;
  project_name: string;
  description: string;
  features: string[];
  pages: string[];
  tech_stack: {
    frontend: string;
    styling: string;
    database: string;
    payment?: string;
    [key: string]: string | undefined;
  };
  design_style: string;
  expanded_prompt: string;
}

export interface Agent2Output {
  project_name: string;
  description: string;
  features: string[];
  database_schema: {
    tables: Array<{
      name: string;
      columns: string[];
    }>;
  };
  folder_structure: {
    app?: string[];
    components?: string[];
    lib?: string[];
    [key: string]: string[] | undefined;
  };
  api_endpoints: string[];
  dependencies: Record<string, string>;
}

// Agent 3 Output Type
export interface Agent3Output {
  database_migrations: string[];
  api_routes: Array<{
    path: string;
    method: string;
    code: string;
  }>;
  database_queries: Array<{
    name: string;
    query: string;
  }>;
  middleware: Array<{
    name: string;
    code: string;
  }>;
  authentication_setup: {
    provider: string;
    config: Record<string, unknown>;
  };
}

// Agent 4 Output Type
export interface Agent4Output {
  components: Array<{
    name: string;
    path: string;
    code: string;
    type: "component" | "page" | "layout";
  }>;
  styles: Array<{
    name: string;
    path: string;
    code: string;
  }>;
  assets: Array<{
    name: string;
    type: string;
    url?: string;
  }>;
}

// Agent 5 Output Type
export interface Agent5Output {
  integrations: Array<{
    name: string;
    type: string;
    code: string;
  }>;
  state_management: {
    type: string;
    stores: Array<{
      name: string;
      code: string;
    }>;
  };
  forms: Array<{
    name: string;
    path: string;
    code: string;
  }>;
  error_handling: {
    global_handler: string;
    error_boundary: string;
  };
}

// Agent 6 Output Type
export interface Agent6Output {
  test_files: Array<{
    name: string;
    path: string;
    code: string;
    type: "unit" | "integration" | "e2e";
  }>;
  test_coverage: {
    target: number;
    actual: number;
  };
  quality_checks: {
    linting: boolean;
    type_checking: boolean;
    accessibility: boolean;
  };
}

// Agent 7 Output Type
export interface Agent7Output {
  optimizations: Array<{
    type: string;
    description: string;
    applied: boolean;
  }>;
  deployment_config: {
    platform: string;
    config_files: Array<{
      name: string;
      content: string;
    }>;
  };
  performance_metrics: {
    lighthouse_score?: number;
    bundle_size?: string;
    load_time?: string;
  };
}

export interface AgentChainResultPayload {
  agent1_output: Agent1Output;
  agent2_output: Agent2Output;
  agent3_output?: Agent3Output;
  agent4_output?: Agent4Output;
  agent5_output?: Agent5Output;
  agent6_output?: Agent6Output;
  agent7_output?: Agent7Output;
  final_project: {
    name: string;
    description: string;
    repository_url?: string;
    deployment_url?: string;
    files_generated: number;
    code?: Record<string, string>;
    database?: string;
    deployment?: Record<string, unknown>;
  } | null;
}

export interface AgentLogRecord {
  id: string;
  project_id: string;
  agent_number: number;
  agent_name: string;
  status: string;
  output: unknown;
  error_message: string | null;
  execution_time_ms: number | null;
  created_at: string;
}

export interface ProjectRecord {
  id: string;
  user_id: string;
  name: string;
  user_prompt: string;
  status: string;
  current_agent: number | null;
  agent_outputs: unknown;
  final_output: AgentChainResultPayload | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
