import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingMessage } from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import type { Duplex } from "node:stream";

import {
  createServiceRoleSupabaseClient,
  markCliSessionDisconnected,
  markCliSessionHeartbeat,
  upsertCliSession,
} from "@/lib/database";
import { getConnectionManager } from "@/lib/ws/connection-manager";
import type {
  ClientToServerMessage,
  CommandResultMessage,
  ExecutionOutputMessage,
  HandshakeMessage,
  ServerToClientMessage,
} from "@/lib/ws/types";

type AugmentedRequest = IncomingMessage & {
  url?: string;
  mrPromth?: {
    userId: string;
    accessToken: string;
    machineId: string;
    sessionId: string;
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const connectionManager = getConnectionManager();

function getOrCreateWebSocketServer() {
  const globalAny = global as {
    __MRPROMTH_WSS__?: WebSocketServer;
  };

  if (!globalAny.__MRPROMTH_WSS__) {
    const wss = new WebSocketServer({ noServer: true });
    wss.on("connection", handleConnection);
    globalAny.__MRPROMTH_WSS__ = wss;
  }

  return globalAny.__MRPROMTH_WSS__!;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.upgrade?.toLowerCase() !== "websocket") {
    res.status(426).json({ error: "Upgrade Required" });
    return;
  }

  const authorization = req.headers.authorization ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }

  const machineId = String(req.headers["x-mrpromth-machine"] ?? "").trim();
  const sessionId = String(req.headers["x-mrpromth-session"] ?? "").trim();

  if (!sessionId) {
    res.status(400).json({ error: "Missing X-MrPromth-Session header" });
    return;
  }

  const supabase = createServiceRoleSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const wss = getOrCreateWebSocketServer();
  const upgradeReq = req as unknown as AugmentedRequest;
  upgradeReq.mrPromth = {
    userId: user.id,
    accessToken: token,
    machineId,
    sessionId,
  };

  wss.handleUpgrade(upgradeReq, upgradeReq.socket as unknown as Duplex, Buffer.from([]), (ws) => {
    wss.emit("connection", ws, upgradeReq);
  });
}

function handleConnection(socket: WebSocket, request: AugmentedRequest) {
  const metadata = request.mrPromth;
  if (!metadata) {
    socket.close(4001, "Missing authentication metadata");
    return;
  }

  let handshakeCompleted = false;
  let handshake: HandshakeMessage | null = null;
  let cleanedUp = false;

  const heartbeat = setInterval(() => {
    if (socket.readyState === socket.OPEN) {
      try {
        socket.ping();
      } catch (error) {
        console.error("Failed to send ping:", error);
      }
    }
  }, 30_000);

  const cleanup = async (reason?: string) => {
    if (cleanedUp) return;
    cleanedUp = true;
    clearInterval(heartbeat);
    if (handshakeCompleted && handshake) {
      connectionManager.removeConnection(handshake.session_id, reason);
      try {
        await markCliSessionDisconnected(metadata.sessionId);
      } catch (error) {
        console.error("Failed to mark CLI session disconnected:", error);
      }
    }
  };

  socket.on("close", (code) => {
    void cleanup(`closed:${code}`);
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
    void cleanup("error");
  });

  socket.on("pong", async () => {
    connectionManager.touch(metadata.sessionId);
    try {
      await markCliSessionHeartbeat(metadata.sessionId);
    } catch (error) {
      console.error("Failed to update CLI session heartbeat:", error);
    }
  });

  socket.on("message", async (data) => {
    let parsed: ClientToServerMessage;
    try {
      parsed = JSON.parse(data.toString()) as ClientToServerMessage;
    } catch (error) {
      console.warn("Dropping invalid JSON message:", error);
      socket.close(4400, "Invalid JSON payload");
      return;
    }

    if (!handshakeCompleted) {
      if (!isHandshakeMessage(parsed)) {
        socket.close(4401, "Handshake message expected");
        return;
      }

      if (parsed.session_id !== metadata.sessionId) {
        socket.close(4402, "Session ID mismatch");
        return;
      }

      handshake = parsed;
      connectionManager.registerConnection({
        handshake: parsed,
        userId: metadata.userId,
        socket: socket as unknown as WebSocket,
      });

      try {
        await upsertCliSession({
          sessionToken: metadata.sessionId,
          userId: metadata.userId,
          machineId: metadata.machineId || null,
          projectDirectory: parsed.project_directory,
          version: parsed.version,
          status: "connected",
        });
      } catch (error) {
        console.error("Failed to upsert CLI session metadata:", error);
      }

      handshakeCompleted = true;

      const ack: ServerToClientMessage = {
        type: "handshake_ack",
        sessionId: parsed.session_id,
      };
      socket.send(JSON.stringify(ack));
      return;
    }

    switch (parsed.type) {
      case "command_result": {
        connectionManager.handleCommandResult(metadata.sessionId, parsed as CommandResultMessage);
        try {
          await markCliSessionHeartbeat(metadata.sessionId);
        } catch (error) {
          console.error("Failed to update CLI session heartbeat:", error);
        }
        break;
      }
      case "execution_output": {
        connectionManager.handleExecutionOutput(
          metadata.sessionId,
          parsed as ExecutionOutputMessage,
        );
        try {
          await markCliSessionHeartbeat(metadata.sessionId);
        } catch (error) {
          console.error("Failed to update CLI session heartbeat:", error);
        }
        break;
      }
      default: {
        console.warn("Received unsupported message type:", parsed);
        break;
      }
    }
  });
}

function isHandshakeMessage(message: ClientToServerMessage): message is HandshakeMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as HandshakeMessage).type === "handshake" &&
    typeof (message as HandshakeMessage).session_id === "string" &&
    typeof (message as HandshakeMessage).machine_id === "string" &&
    typeof (message as HandshakeMessage).project_directory === "string" &&
    typeof (message as HandshakeMessage).version === "string"
  );
}
