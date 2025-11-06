export type ToolName = "writeFile" | "readFile" | "runCommand" | "createDatabase" | "deploy";

export interface ToolCommand {
  commandId: string;
  toolName: ToolName | string;
  parameters: Record<string, unknown>;
}

export interface ExecutionOutputEvent {
  commandId: string;
  stream: "stdout" | "stderr" | "info";
  data: string;
}

export interface ToolExecutionContext {
  projectDirectory: string;
  onOutput?: (event: ExecutionOutputEvent) => void;
}

export interface ToolExecutionResult {
  status: "success" | "error";
  output?: unknown;
  error?: string;
}
