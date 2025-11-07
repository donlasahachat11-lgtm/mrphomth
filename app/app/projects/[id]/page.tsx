"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CodeViewer } from "@/components/CodeViewer";
import { DeploymentActions } from "@/components/DeploymentActions";
import { ProjectStats } from "@/components/ProjectStats";
import type {
  ProjectRecord,
  AgentLogRecord,
  AgentChainResultPayload,
} from "@/lib/agents/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [logs, setLogs] = useState<AgentLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    fetchProject();
    const interval = setInterval(fetchProject, 3000);

    return () => clearInterval(interval);
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Project not found");
          return;
        }
        throw new Error("Failed to fetch project");
      }

      const data = await response.json();
      setProject(data.project);
      setLogs(data.logs || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "error":
        return "✗";
      default:
        return "⋯";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || "Project not found"}</div>
          <button
            onClick={() => router.push("/app/projects")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const chainOutput = project.final_output || (project.agent_outputs as Partial<AgentChainResultPayload>);

  // Prepare code files from agent outputs
  const codeFiles: Array<{ name: string; path: string; code: string }> = [];
  if (chainOutput?.agent3_output?.api_routes) {
    chainOutput.agent3_output.api_routes.forEach((route) => {
      codeFiles.push({
        name: route.path.split("/").pop() || "route",
        path: `app/api${route.path}/route.ts`,
        code: route.code,
      });
    });
  }
  if (chainOutput?.agent4_output?.components) {
    chainOutput.agent4_output.components.forEach((comp) => {
      codeFiles.push({
        name: comp.name,
        path: comp.path,
        code: comp.code,
      });
    });
  }
  if (chainOutput?.agent5_output?.integrations) {
    chainOutput.agent5_output.integrations.forEach((integration) => {
      codeFiles.push({
        name: integration.name,
        path: `lib/${integration.name}.ts`,
        code: integration.code,
      });
    });
  }
  if (chainOutput?.agent6_output?.test_files) {
    chainOutput.agent6_output.test_files.forEach((test) => {
      codeFiles.push({
        name: test.name,
        path: test.path,
        code: test.code,
      });
    });
  }
  if (chainOutput?.agent7_output?.deployment_config?.config_files) {
    chainOutput.agent7_output.deployment_config.config_files.forEach((config) => {
      codeFiles.push({
        name: config.name,
        path: config.name,
        code: config.content,
      });
    });
  }

  // Prepare stats
  const projectStats = [
    {
      label: "Agents",
      value: logs.filter((l) => l.status === "completed").length + "/7",
      icon: "🤖",
    },
    {
      label: "Files",
      value: codeFiles.length,
      icon: "📄",
    },
    {
      label: "API Routes",
      value: chainOutput?.agent3_output?.api_routes?.length || 0,
      icon: "🔌",
    },
    {
      label: "Components",
      value: chainOutput?.agent4_output?.components?.length || 0,
      icon: "🎨",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/app/projects")}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Back to Projects
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {project.name || "Untitled Project"}
            </h1>
            <p className="text-gray-600">{project.user_prompt}</p>
          </div>
          <span
            className={`px-4 py-2 text-sm font-medium rounded-lg border ${getStatusColor(
              project.status
            )}`}
          >
            {project.status.toUpperCase()}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
          <span>Created: {formatDate(project.created_at)}</span>
          <span>Updated: {formatDate(project.updated_at)}</span>
          {project.current_agent && (
            <span>Current Agent: {project.current_agent}/7</span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {project.error_message && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-red-600 text-xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-700">{project.error_message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {project.status === "running" && project.current_agent && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900">
              Agent {project.current_agent} in progress...
            </h3>
            <span className="text-sm text-blue-700">
              {Math.round((project.current_agent / 7) * 100)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all animate-pulse"
              style={{ width: `${(project.current_agent / 7) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Agent Logs */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Execution Logs</h2>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No agent logs yet</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`border rounded-lg p-4 ${
                  log.status === "completed"
                    ? "bg-green-50 border-green-200"
                    : log.status === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getAgentStatusIcon(log.status)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Agent {log.agent_number}: {log.agent_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                  {log.execution_time_ms && (
                    <span className="text-sm text-gray-500">
                      {(log.execution_time_ms / 1000).toFixed(2)}s
                    </span>
                  )}
                </div>

                {log.error_message && (
                  <div className="mt-2 text-sm text-red-700 bg-red-100 rounded p-2">
                    {log.error_message}
                  </div>
                )}

                {log.output ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                      View output
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                      {JSON.stringify(log.output, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Final Output */}
      {chainOutput && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Output</h2>

          {chainOutput.agent1_output && (
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📋 Project Specification
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {chainOutput.agent1_output.project_type}
                </p>
                <p>
                  <span className="font-medium">Features:</span>{" "}
                  {chainOutput.agent1_output.features?.join(", ")}
                </p>
                <p>
                  <span className="font-medium">Pages:</span>{" "}
                  {chainOutput.agent1_output.pages?.join(", ")}
                </p>
              </div>
            </div>
          )}

          {chainOutput.agent2_output && (
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🏗️ Architecture
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Tables:</span>{" "}
                  {chainOutput.agent2_output.database_schema?.tables?.length || 0}
                </p>
                <p>
                  <span className="font-medium">API Endpoints:</span>{" "}
                  {chainOutput.agent2_output.api_endpoints?.length || 0}
                </p>
              </div>
            </div>
          )}

          {chainOutput.final_project && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🚀 Ready for Deployment
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Files Generated:</span>{" "}
                  {chainOutput.final_project.files_generated || 0}
                </p>
                {chainOutput.final_project.deployment_url && (
                  <p>
                    <span className="font-medium">URL:</span>{" "}
                    <a
                      href={chainOutput.final_project.deployment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {chainOutput.final_project.deployment_url}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
        <ProjectStats stats={projectStats} />
      </div>

      {/* Code Viewer */}
      {codeFiles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generated Code</h2>
          <CodeViewer files={codeFiles} />
        </div>
      )}

      {/* Deployment Actions */}
      {project.status === "completed" && (
        <div className="mb-8">
          <DeploymentActions
            projectId={project.id}
            projectName={project.name || "project"}
            onDeploy={(platform) => {
              console.log(`Deploying to ${platform}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
