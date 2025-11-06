import { NextRequest, NextResponse } from "next/server";

const encoder = new TextEncoder();

function getGatewayUrl() {
  const url = process.env.AI_GATEWAY_URL ?? "http://localhost:8000";
  if (!url) {
    throw new Error("AI_GATEWAY_URL is not configured");
  }
  return url.replace(/\/$/, "");
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const gatewayUrl = getGatewayUrl();
  const gatewayApiKey = process.env.AI_GATEWAY_API_KEY;

  const upstreamResponse = await fetch(`${gatewayUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(gatewayApiKey ? { "X-API-Key": gatewayApiKey } : {}),
    },
    body: JSON.stringify({ ...body, stream: body.stream ?? true }),
  });

  if (!upstreamResponse.body) {
    const fallback = await upstreamResponse.text();
    return NextResponse.json(
      { error: fallback || "No response body from AI gateway" },
      { status: upstreamResponse.status || 502 }
    );
  }

  if (!upstreamResponse.ok) {
    const errorPayload = await upstreamResponse.text();
    return NextResponse.json(
      { error: errorPayload || "Unexpected error from AI gateway" },
      { status: upstreamResponse.status }
    );
  }

  if (body.stream === false) {
    const data = await upstreamResponse.json();
    return NextResponse.json(data, { status: 200 });
  }

  const readable = new ReadableStream({
    async start(controller) {
      const reader = upstreamResponse.body!.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          if (value) {
            controller.enqueue(value);
          }
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", error: String(error) })}\n\n`)
        );
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
