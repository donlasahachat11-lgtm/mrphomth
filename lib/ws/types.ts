export interface HandshakeMessage {
  type: "handshake";
  version: string;
  session_id: string;
  machine_id: string;
  project_directory: string;
}

export interface CommandMessage {
  type: "command";
  command_id: string;
  tool_name: string;
  parameters?: Record<string, unknown>;
}

export interface PingMessage {
  type: "ping";
  nonce?: string;
}

export interface PongMessage {
  type: "pong";
  nonce?: string | null;
}

export interface CommandResultMessage {
  type: "command_result";
  command_id: string;
  status: "success" | "error";
  result?: unknown;
  error?: string | null;
}

export interface ExecutionOutputMessage {
  type: "execution_output";
  command_id: string;
  stream: "stdout" | "stderr" | "info";
  data: string;
}

export type ClientToServerMessage =
  | HandshakeMessage
  | CommandResultMessage
  | ExecutionOutputMessage
  | PongMessage
  | { type: string; [key: string]: unknown };

export type ServerToClientMessage =
  | CommandMessage
  | PingMessage
  | { type: "handshake_ack"; sessionId: string };
