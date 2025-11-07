import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get original project
    const { data: originalProject, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (projectError || !originalProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get modifications from request body (optional)
    const body = await request.json();
    const modifications = body.modifications || {};

    // Create new project with same prompt (or modified)
    const { data: newProject, error: createError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: `${originalProject.name} (Regenerated)`,
        user_prompt: modifications.prompt || originalProject.user_prompt,
        status: "pending",
        current_agent: null,
        agent_outputs: {},
        final_output: null,
      })
      .select()
      .single();

    if (createError || !newProject) {
      throw new Error("Failed to create new project");
    }

    // Trigger agent chain (in background)
    // In production, this would be a queue job or webhook
    fetch(`${request.nextUrl.origin}/api/agent-chain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify({
        project_id: newProject.id,
        prompt: modifications.prompt || originalProject.user_prompt,
      }),
    }).catch((error) => {
      console.error("Failed to trigger agent chain:", error);
    });

    return NextResponse.json({
      success: true,
      project_id: newProject.id,
      message: "Project regeneration started",
    });
  } catch (error) {
    console.error("Regenerate error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate project" },
      { status: 500 }
    );
  }
}
