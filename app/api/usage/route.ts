import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/database";
import { tokenManager } from "@/lib/token-manager";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // Get quota
    const quota = await tokenManager.getQuota(user.id);

    // Get analytics
    const analytics = await tokenManager.getUsageAnalytics(user.id, days);

    return NextResponse.json({
      quota,
      analytics,
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { tokens_used, operation, project_id } = body;

    if (!tokens_used || !operation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has enough tokens
    const hasEnough = await tokenManager.hasEnoughTokens(user.id, tokens_used);

    if (!hasEnough) {
      return NextResponse.json(
        { error: "Insufficient token quota" },
        { status: 403 }
      );
    }

    // Track usage
    await tokenManager.trackUsage(user.id, tokens_used, operation, project_id);

    // Get updated quota
    const quota = await tokenManager.getQuota(user.id);

    return NextResponse.json({
      success: true,
      quota,
    });
  } catch (error) {
    console.error("Usage tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track usage" },
      { status: 500 }
    );
  }
}
