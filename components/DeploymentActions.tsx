"use client";

import { useState } from "react";

interface DeploymentActionsProps {
  projectId: string;
  projectName: string;
  onDeploy?: (platform: string) => void;
}

export function DeploymentActions({
  projectId,
  projectName,
  onDeploy,
}: DeploymentActionsProps) {
  const [deploying, setDeploying] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const platforms = [
    {
      id: "vercel",
      name: "Vercel",
      icon: "▲",
      description: "Deploy to Vercel in one click",
      color: "bg-black hover:bg-gray-800",
    },
    {
      id: "netlify",
      name: "Netlify",
      icon: "◆",
      description: "Deploy to Netlify",
      color: "bg-teal-600 hover:bg-teal-700",
    },
    {
      id: "github",
      name: "GitHub",
      icon: "★",
      description: "Push to GitHub repository",
      color: "bg-gray-700 hover:bg-gray-600",
    },
  ];

  const handleDeploy = async (platform: string) => {
    setDeploying(true);
    setSelectedPlatform(platform);

    try {
      // Simulate deployment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (onDeploy) {
        onDeploy(platform);
      }

      // In real implementation, this would call the deployment API
      console.log(`Deploying ${projectName} to ${platform}`);
    } catch (error) {
      console.error("Deployment failed:", error);
    } finally {
      setDeploying(false);
      setSelectedPlatform(null);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/download`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🚀 Deployment Options
      </h3>

      <div className="space-y-4 mb-6">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handleDeploy(platform.id)}
            disabled={deploying}
            className={`w-full flex items-center justify-between p-4 rounded-lg text-white transition-all ${
              platform.color
            } ${
              deploying && selectedPlatform === platform.id
                ? "opacity-75 cursor-wait"
                : ""
            } ${deploying && selectedPlatform !== platform.id ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{platform.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{platform.name}</div>
                <div className="text-sm opacity-90">{platform.description}</div>
              </div>
            </div>

            {deploying && selectedPlatform === platform.id ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Other Actions</h4>
        <div className="space-y-2">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📦</span>
              <div className="text-left">
                <div className="font-medium text-gray-900">Download Source</div>
                <div className="text-sm text-gray-500">
                  Get the complete source code as ZIP
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔄</span>
              <div className="text-left">
                <div className="font-medium text-gray-900">Regenerate</div>
                <div className="text-sm text-gray-500">
                  Run the agent chain again with modifications
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <div className="text-left">
                <div className="font-medium text-gray-900">Clone Project</div>
                <div className="text-sm text-gray-500">
                  Create a copy to modify
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Pro Tip</p>
            <p className="text-blue-700">
              Before deploying, make sure to set up your environment variables in
              the platform's dashboard. Check the .env.example file for required
              variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
