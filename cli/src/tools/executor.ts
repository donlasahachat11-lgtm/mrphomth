import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { performance } from "node:perf_hooks";

import type {
  ExecutionOutputEvent,
  ToolCommand,
  ToolExecutionContext,
  ToolExecutionResult,
} from "./types";

const { R_OK } = fsConstants;

export interface ToolExecutorOptions extends ToolExecutionContext {}

export class ToolExecutor {
  private readonly projectDirectory: string;
  private readonly onOutput?: (event: ExecutionOutputEvent) => void;

  constructor(options: ToolExecutorOptions) {
    this.projectDirectory = resolve(options.projectDirectory);
    this.onOutput = options.onOutput;
  }

  async execute(command: ToolCommand): Promise<ToolExecutionResult> {
    const normalizedTool = command.toolName as string;

    switch (normalizedTool) {
      case "writeFile":
        return this.handleWriteFile(command);
      case "readFile":
        return this.handleReadFile(command);
      case "runCommand":
        return this.handleRunCommand(command);
      case "createDatabase":
      case "deploy":
        return {
          status: "error",
          error: `Tool "${normalizedTool}" is not implemented yet.`,
        };
      default:
        return {
          status: "error",
          error: `Unknown tool "${normalizedTool}".`,
        };
    }
  }

  private async handleWriteFile(command: ToolCommand): Promise<ToolExecutionResult> {
    const pathParam = String(command.parameters.path ?? "");
    const content = String(command.parameters.content ?? "");

    if (!pathParam) {
      return { status: "error", error: "writeFile requires a non-empty 'path' parameter." };
    }

    const targetPath = this.resolveSafePath(pathParam);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, "utf8");

    return {
      status: "success",
      output: {
        path: pathParam,
        bytesWritten: Buffer.byteLength(content, "utf8"),
      },
    };
  }

  private async handleReadFile(command: ToolCommand): Promise<ToolExecutionResult> {
    const pathParam = String(command.parameters.path ?? "");
    if (!pathParam) {
      return { status: "error", error: "readFile requires a 'path' parameter." };
    }

    const targetPath = this.resolveSafePath(pathParam);

    try {
      await access(targetPath, R_OK);
    } catch (error) {
      return {
        status: "error",
        error: `File "${pathParam}" is not accessible for reading.`,
      };
    }

    const content = await readFile(targetPath, "utf8");
    return { status: "success", output: { path: pathParam, content } };
  }

  private async handleRunCommand(command: ToolCommand): Promise<ToolExecutionResult> {
    const commandString = String(command.parameters.command ?? "");
    if (!commandString) {
      return { status: "error", error: "runCommand requires a 'command' parameter." };
    }

    const timeoutSeconds = this.parseTimeout(command.parameters.timeout);
    const envOverrides = this.extractEnvOverrides(command.parameters.env);
    const startTime = performance.now();

    return new Promise((resolvePromise) => {
      const child = spawn(commandString, {
        cwd: this.projectDirectory,
        env: {
          ...process.env,
          ...envOverrides,
        },
        shell: true,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";
      let timeoutHandle: NodeJS.Timeout | undefined;

      const emit = (stream: ExecutionOutputEvent["stream"], data: string) => {
        if (this.onOutput) {
          this.onOutput({ commandId: command.commandId, stream, data });
        }
      };

      if (timeoutSeconds !== null) {
        timeoutHandle = setTimeout(() => {
          emit("stderr", `[mr-promth] Command timed out after ${timeoutSeconds}s\n`);
          child.kill("SIGTERM");
        }, timeoutSeconds * 1000);
      }

      child.stdout?.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stdout += text;
        emit("stdout", text);
      });

      child.stderr?.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stderr += text;
        emit("stderr", text);
      });

      child.on("close", (code, signal) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);

        const durationMs = Math.round(performance.now() - startTime);

        const result: ToolExecutionResult = {
          status: code === 0 ? "success" : "error",
          output: {
            exitCode: code,
            signal,
            stdout,
            stderr,
            durationMs,
          },
        };

        if (result.status === "error") {
          result.error =
            stderr.trim() ||
            `Command "${commandString}" failed with exit code ${code ?? "unknown"}.`;
        }

        resolvePromise(result);
      });

      child.on("error", (error) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        resolvePromise({
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
      });
    });
  }

  private resolveSafePath(target: string): string {
    const absolute = resolve(this.projectDirectory, target);
    const relativePath = relative(this.projectDirectory, absolute);
    const segments = relativePath.split(/[\\/]+/).filter(Boolean);

    if (
      relativePath.startsWith("..") ||
      relativePath === ".." ||
      segments.includes("..")
    ) {
      throw new Error(`Access to path "${target}" is outside the project directory.`);
    }

    return absolute;
  }

  private parseTimeout(raw: unknown): number | null {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === "number") {
      if (Number.isNaN(raw) || raw <= 0) return null;
      return raw;
    }
    if (typeof raw === "string") {
      const parsed = Number.parseFloat(raw);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return null;
  }

  private extractEnvOverrides(raw: unknown): Record<string, string> {
    if (!raw || typeof raw !== "object") return {};
    const entries = Object.entries(raw);
    const env: Record<string, string> = {};
    for (const [key, value] of entries) {
      if (typeof key !== "string") continue;
      if (value === undefined || value === null) continue;
      env[key] = String(value);
    }
    return env;
  }
}
