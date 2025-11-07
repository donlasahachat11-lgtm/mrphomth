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

    // Get new name from request body (optional)
    const body = await request.json().catch(() => ({}));
    const newName = body.name || `${originalProject.name} (Copy)`;

    // Clone project
    const { data: clonedProject, error: cloneError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: newName,
        user_prompt: originalProject.user_prompt,
        status: originalProject.status,
        current_agent: originalProject.current_agent,
        agent_outputs: originalProject.agent_outputs,
        final_output: originalProject.final_output,
      })
      .select()
      .single();

    if (cloneError || !clonedProject) {
      throw new Error("Failed to clone project");
    }

    // Clone agent logs
    const { data: originalLogs } = await supabase
      .from("agent_logs")
      .select("*")
      .eq("project_id", params.id);

    if (originalLogs && originalLogs.length > 0) {
      const clonedLogs = originalLogs.map((log) => ({
        project_id: clonedProject.id,
        agent_number: log.agent_number,
        agent_name: log.agent_name,
        status: log.status,
        output: log.output,
        error_message: log.error_message,
        execution_time_ms: log.execution_time_ms,
      }));

      await supabase.from("agent_logs").insert(clonedLogs);
    }

    return NextResponse.json({
      success: true,
      project: clonedProject,
      message: "Project cloned successfully",
    });
  } catch (error) {
    console.error("Clone error:", error);
    return NextResponse.json(
      { error: "Failed to clone project" },
      { status: 500 }
    );
  }
}
