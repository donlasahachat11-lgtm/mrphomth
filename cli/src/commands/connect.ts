import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";

import chalk from "chalk";
import type { Command } from "commander";
import WebSocket from "ws";

import { loadConfig, saveConfig } from "../config";
import type { CliConfig } from "../config";
import { ToolExecutor } from "../tools/executor";
import type { ToolExecutionResult } from "../tools/types";

interface ConnectCommandOptions {
  apiUrl?: string;
  projectDir?: string;
  machineId?: string;
  reconnect?: boolean;
}

interface HandshakeAckMessage {
  type: "handshake_ack";
  sessionId: string;
}

interface CommandMessage {
  type: "command";
  command_id: string;
  tool_name: string;
  parameters?: Record<string, unknown>;
}

interface PingMessage {
  type: "ping";
  nonce?: string;
}

type UnknownMessage = { [key: string]: unknown };

type ServerMessage = HandshakeAckMessage | CommandMessage | PingMessage | UnknownMessage;

const DEFAULT_MACHINE_ID = `${process.platform}-${process.arch}-${homedir().split("/").pop() ?? "user"}`;
const CLI_VERSION = "0.1.0";

export function registerConnectCommand(program: Command) {
  program
    .command("connect")
    .description("Connect your local machine to the Mr.Promth orchestrator")
    .option("--api-url <url>", "WebSocket endpoint (overrides config and environment)")
    .option("--project-dir <path>", "Project directory to operate in")
    .option("--machine-id <id>", "Custom machine identifier")
    .option("--reconnect", "Automatically reconnect on unexpected disconnects", false)
    .action(async (options: ConnectCommandOptions) => {
      try {
        await handleConnect(options);
      } catch (error) {
        process.exitCode = 1;
        const message =
          error instanceof Error ? error.message : "An unexpected error occurred during connect.";
        console.error(chalk.red(`✖ ${message}`));
      }
    });
}

async function handleConnect(options: ConnectCommandOptions) {
  const config = await loadConfig();
  const auth = config.auth;

  if (!auth?.accessToken) {
    throw new Error(
      "You are not logged in. Run `mr-promth login` first to authenticate with Mr.Promth.",
    );
  }

  const apiUrl = await resolveApiUrl(config, options.apiUrl);
  const projectDirectory = await resolveProjectDirectory(config, options.projectDir);
  const machineId = options.machineId ?? config.auth?.email ?? DEFAULT_MACHINE_ID;
  const sessionId = randomUUID();

  if (options.apiUrl) {
    await saveConfig({ apiUrl: options.apiUrl });
  }
  if (options.projectDir) {
    await saveConfig({ projectDirectory });
  }

  console.log(chalk.blueBright("ℹ Connecting to Mr.Promth orchestrator..."));
  console.log(chalk.gray(`   WebSocket: ${apiUrl}`));
  console.log(chalk.gray(`   Project directory: ${projectDirectory}`));
  console.log(chalk.gray(`   Machine ID: ${machineId}`));

  const connectOnce = () =>
    new Promise<void>((resolvePromise, rejectPromise) => {
      const ws = new WebSocket(apiUrl, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          "X-MrPromth-Machine": machineId,
          "X-MrPromth-Session": sessionId,
        },
      });

      const toolExecutor = new ToolExecutor({
        projectDirectory,
        onOutput: (event) => {
          ws.send(
            JSON.stringify({
              type: "execution_output",
              command_id: event.commandId,
              stream: event.stream,
              data: event.data,
            }),
          );
        },
      });

      let handshakeConfirmed = false;

      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            type: "handshake",
            version: CLI_VERSION,
            session_id: sessionId,
            machine_id: machineId,
            project_directory: projectDirectory,
          }),
        );
      });

      ws.on("message", async (data) => {
        let parsed: ServerMessage;
        try {
          parsed = JSON.parse(data.toString()) as ServerMessage;
        } catch (error) {
          console.error(chalk.red("✖ Received invalid JSON message from orchestrator"), error);
          return;
        }

        if (isHandshakeAckMessage(parsed)) {
          handshakeConfirmed = true;
          console.log(chalk.green("✔ Connected to Mr.Promth orchestrator."));
          return;
        }

        if (isPingMessage(parsed)) {
          ws.send(JSON.stringify({ type: "pong", nonce: parsed.nonce ?? null }));
          return;
        }

        if (isCommandMessage(parsed)) {
          await handleCommandMessage(ws, toolExecutor, parsed);
          return;
        }

        console.warn(chalk.yellow(`↪ Received unknown message type: ${JSON.stringify(parsed)}`));
      });

      ws.on("close", (code, reason) => {
        if (!handshakeConfirmed) {
          rejectPromise(new Error(`Connection closed before handshake. Code ${code}: ${reason}`));
          return;
        }

        console.log(chalk.yellow(`⚠ Connection closed (code ${code}). Reason: ${reason}`));
        resolvePromise();
      });

      ws.on("error", (error) => {
        rejectPromise(error);
      });

      const handleShutdown = () => {
        ws.close(1000, "Client shutdown");
      };

      process.once("SIGINT", handleShutdown);
      process.once("SIGTERM", handleShutdown);
    });

  do {
    try {
      await connectOnce();
      if (!options.reconnect) break;
      console.log(chalk.gray("Reconnecting in 3 seconds... (press Ctrl+C to exit)"));
      await new Promise((res) => setTimeout(res, 3000));
    } catch (error) {
      if (!options.reconnect) {
        throw error;
      }
      console.error(
        chalk.red(
          `✖ Connection error: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }. Retrying in 5 seconds...`,
        ),
      );
      await new Promise((res) => setTimeout(res, 5000));
    }
  } while (options.reconnect);
}

async function handleCommandMessage(
  ws: WebSocket,
  executor: ToolExecutor,
  message: CommandMessage,
) {
  const { command_id: commandId, tool_name: toolName, parameters = {} } = message;
  console.log(
    chalk.cyan(`→ Executing command ${commandId}: ${toolName} ${JSON.stringify(parameters)}`),
  );

  let result: ToolExecutionResult;
  try {
    result = await executor.execute({
      commandId,
      toolName,
      parameters,
    });
  } catch (error) {
    result = {
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  ws.send(
    JSON.stringify({
      type: "command_result",
      command_id: commandId,
      status: result.status,
      result: result.output ?? null,
      error: result.error ?? null,
    }),
  );

  if (result.status === "success") {
    console.log(chalk.green(`✔ Command ${commandId} completed successfully.`));
  } else {
    console.error(chalk.red(`✖ Command ${commandId} failed: ${result.error ?? "Unknown error"}`));
  }
}

async function resolveApiUrl(config: CliConfig, override?: string): Promise<string> {
  const candidate = override ?? config.apiUrl ?? process.env.MRPROMTH_API_URL ?? "";
  if (!candidate) {
    throw new Error(
      "No WebSocket API URL configured. Use --api-url or set MRPROMTH_API_URL in your environment.",
    );
  }
  return candidate;
}

async function resolveProjectDirectory(config: CliConfig, override?: string): Promise<string> {
  const dir = resolve(override ?? config.projectDirectory ?? process.cwd());

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  return dir;
}

function isCommandMessage(message: ServerMessage): message is CommandMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as Record<string, unknown>).type === "command" &&
    typeof (message as Record<string, unknown>).command_id === "string" &&
    typeof (message as Record<string, unknown>).tool_name === "string"
  );
}

function isPingMessage(message: ServerMessage): message is PingMessage {
  return typeof message === "object" && message !== null && message.type === "ping";
}

function isHandshakeAckMessage(message: ServerMessage): message is HandshakeAckMessage {
  return typeof message === "object" && message !== null && message.type === "handshake_ack";
}
