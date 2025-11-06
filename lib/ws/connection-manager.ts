import { EventEmitter } from "node:events";

import type WebSocket from "ws";

import type {
  CommandMessage,
  CommandResultMessage,
  ExecutionOutputMessage,
  HandshakeMessage,
} from "./types";

export interface CliConnection {
  sessionId: string;
  userId: string;
  machineId: string;
  projectDirectory: string;
  version: string;
  socket: WebSocket;
  connectedAt: Date;
  lastSeenAt: Date;
}

interface PendingCommand {
  resolve: (result: CommandResultMessage) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

interface CommandResultEvent {
  sessionId: string;
  result: CommandResultMessage;
}

interface ExecutionOutputEvent {
  sessionId: string;
  output: ExecutionOutputMessage;
}

type ConnectionManagerEvents = {
  connected: (connection: CliConnection) => void;
  disconnected: (connection: CliConnection, reason?: string) => void;
  command_result: (event: CommandResultEvent) => void;
  execution_output: (event: ExecutionOutputEvent) => void;
};

class ConnectionManager {
  private readonly sessions = new Map<string, CliConnection>();
  private readonly sessionsByUser = new Map<string, Set<string>>();
  private readonly pendingCommands = new Map<string, PendingCommand>();
  private readonly emitter = new EventEmitter();

  on<K extends keyof ConnectionManagerEvents>(eventName: K, listener: ConnectionManagerEvents[K]) {
    this.emitter.on(eventName, listener as unknown as (...args: unknown[]) => void);
    return this;
  }

  once<K extends keyof ConnectionManagerEvents>(
    eventName: K,
    listener: ConnectionManagerEvents[K],
  ) {
    this.emitter.once(eventName, listener as unknown as (...args: unknown[]) => void);
    return this;
  }

  off<K extends keyof ConnectionManagerEvents>(eventName: K, listener: ConnectionManagerEvents[K]) {
    this.emitter.off(eventName, listener as unknown as (...args: unknown[]) => void);
    return this;
  }

  emit<K extends keyof ConnectionManagerEvents>(
    eventName: K,
    ...args: Parameters<ConnectionManagerEvents[K]>
  ) {
    this.emitter.emit(eventName, ...(args as unknown as unknown[]));
    return this;
  }

  registerConnection(params: {
    handshake: HandshakeMessage;
    userId: string;
    socket: WebSocket;
  }): CliConnection {
    const {
      handshake: { session_id: sessionId, machine_id: machineId, project_directory: projectDirectory, version },
      userId,
      socket,
    } = params;

    const existing = this.sessions.get(sessionId);
    if (existing) {
      existing.socket.close(4000, "Session superseded by a new connection");
      this.removeConnection(sessionId, "replaced");
    }

    const connection: CliConnection = {
      sessionId,
      userId,
      machineId,
      projectDirectory,
      version,
      socket,
      connectedAt: new Date(),
      lastSeenAt: new Date(),
    };

    this.sessions.set(sessionId, connection);

    if (!this.sessionsByUser.has(userId)) {
      this.sessionsByUser.set(userId, new Set());
    }
    this.sessionsByUser.get(userId)!.add(sessionId);

    this.emit("connected", connection);
    return connection;
  }

  removeConnection(sessionId: string, reason?: string) {
    const connection = this.sessions.get(sessionId);
    if (!connection) return;

    this.sessions.delete(sessionId);

    const userSessions = this.sessionsByUser.get(connection.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.sessionsByUser.delete(connection.userId);
      }
    }

    const pendingKeys = [...this.pendingCommands.keys()].filter((key) =>
      key.startsWith(`${sessionId}:`),
    );
    for (const key of pendingKeys) {
      const pending = this.pendingCommands.get(key);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.reject(new Error(`Command cancelled because session ${sessionId} disconnected.`));
        this.pendingCommands.delete(key);
      }
    }

    this.emit("disconnected", connection, reason);
  }

  getConnection(sessionId: string) {
    return this.sessions.get(sessionId) ?? null;
  }

  getActiveSessionsForUser(userId: string): CliConnection[] {
    const sessionIds = this.sessionsByUser.get(userId);
    if (!sessionIds) return [];
    return [...sessionIds]
      .map((sessionId) => this.sessions.get(sessionId))
      .filter((conn): conn is CliConnection => Boolean(conn));
  }

  touch(sessionId: string) {
    const connection = this.sessions.get(sessionId);
    if (!connection) return;
    connection.lastSeenAt = new Date();
  }

  async executeCommand(
    sessionId: string,
    command: CommandMessage,
    options: { timeoutMs?: number } = {},
  ): Promise<CommandResultMessage> {
    const connection = this.sessions.get(sessionId);
    if (!connection) {
      throw new Error(`Session ${sessionId} is not connected`);
    }
    if (connection.socket.readyState !== connection.socket.OPEN) {
      throw new Error(`Session ${sessionId} socket is not open`);
    }

    const timeoutMs = options.timeoutMs ?? 5 * 60 * 1000;
    const pendingKey = this.buildPendingKey(sessionId, command.command_id);

    return new Promise<CommandResultMessage>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingCommands.delete(pendingKey);
        reject(new Error(`Command ${command.command_id} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingCommands.set(pendingKey, { resolve, reject, timeout });

      try {
        connection.socket.send(JSON.stringify(command));
      } catch (error) {
        clearTimeout(timeout);
        this.pendingCommands.delete(pendingKey);
        reject(
          new Error(
            `Failed to dispatch command ${command.command_id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
        );
      }
    });
  }

  handleCommandResult(sessionId: string, payload: CommandResultMessage) {
    const connection = this.sessions.get(sessionId);
    if (!connection) return;
    connection.lastSeenAt = new Date();

    const pendingKey = this.buildPendingKey(sessionId, payload.command_id);
    const pending = this.pendingCommands.get(pendingKey);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingCommands.delete(pendingKey);
      pending.resolve(payload);
    }

    this.emit("command_result", { sessionId, result: payload });
  }

  handleExecutionOutput(sessionId: string, payload: ExecutionOutputMessage) {
    const connection = this.sessions.get(sessionId);
    if (!connection) return;
    connection.lastSeenAt = new Date();

    this.emit("execution_output", { sessionId, output: payload });
  }

  private buildPendingKey(sessionId: string, commandId: string) {
    return `${sessionId}:${commandId}`;
  }
}

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __MRPROMTH_CONNECTION_MANAGER__: ConnectionManager | undefined;
}

export function getConnectionManager(): ConnectionManager {
  if (!global.__MRPROMTH_CONNECTION_MANAGER__) {
    global.__MRPROMTH_CONNECTION_MANAGER__ = new ConnectionManager();
  }
  return global.__MRPROMTH_CONNECTION_MANAGER__;
}
