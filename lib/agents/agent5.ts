import type { Agent2Output, Agent3Output, Agent4Output, Agent5Output } from "./types";

/**
 * Agent 5: Integration & Logic Developer
 * 
 * Responsibilities:
 * - Connect frontend with backend
 * - Add state management
 * - Implement form validation
 * - Add error handling
 * - Add loading states
 * - Integrate third-party services
 */
export async function executeAgent5(
  agent2Output: Agent2Output,
  agent3Output: Agent3Output,
  agent4Output: Agent4Output
): Promise<Agent5Output> {
  const startTime = Date.now();

  try {
    // Generate integrations
    const integrations = generateIntegrations(agent2Output, agent3Output);

    // Set up state management
    const stateManagement = setupStateManagement(agent2Output);

    // Generate forms
    const forms = generateForms(agent2Output);

    // Set up error handling
    const errorHandling = setupErrorHandling();

    const executionTime = Date.now() - startTime;
    console.log(`Agent 5 completed in ${executionTime}ms`);

    return {
      integrations,
      state_management: stateManagement,
      forms,
      error_handling: errorHandling,
    };
  } catch (error) {
    console.error("Agent 5 error:", error);
    throw new Error(`Agent 5 failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function generateIntegrations(
  agent2Output: Agent2Output,
  agent3Output: Agent3Output
): Array<{ name: string; type: string; code: string }> {
  const integrations: Array<{ name: string; type: string; code: string }> = [];

  // API client integration
  integrations.push({
    name: "api-client",
    type: "service",
    code: `import { createClient } from "@/lib/database";

class APIClient {
  private supabase = createClient();

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(\`API Error: \${response.statusText}\`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(\`API Error: \${response.statusText}\`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(\`API Error: \${response.statusText}\`);
    }

    return response.json();
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(endpoint, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(\`API Error: \${response.statusText}\`);
    }
  }
}

export const apiClient = new APIClient();`,
  });

  // Generate hooks for each table
  agent2Output.database_schema?.tables?.forEach((table) => {
    const hookName = `use${capitalize(table.name)}`;

    integrations.push({
      name: hookName,
      type: "hook",
      code: `"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface ${capitalize(table.name.slice(0, -1))} {
  id: string;
${table.columns
  .filter((col) => col !== "id")
  .map((col) => `  ${col}: ${getTypeScriptType(col)};`)
  .join("\n")}
}

export function ${hookName}() {
  const [data, setData] = useState<${capitalize(table.name.slice(0, -1))}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await apiClient.get<${capitalize(table.name.slice(0, -1))}[]>("/api/${table.name}");
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<${capitalize(table.name.slice(0, -1))}, "id">) => {
    try {
      const newItem = await apiClient.post<${capitalize(table.name.slice(0, -1))}>("/api/${table.name}", item);
      setData([...data, newItem]);
      return newItem;
    } catch (err) {
      throw err;
    }
  };

  const update = async (id: string, item: Partial<${capitalize(table.name.slice(0, -1))}>) => {
    try {
      const updated = await apiClient.put<${capitalize(table.name.slice(0, -1))}>(\`/api/${table.name}/\${id}\`, item);
      setData(data.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      await apiClient.delete(\`/api/${table.name}/\${id}\`);
      setData(data.filter((d) => d.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    create,
    update,
    remove,
  };
}`,
    });
  });

  return integrations;
}

function setupStateManagement(agent2Output: Agent2Output): {
  type: string;
  stores: Array<{ name: string; code: string }>;
} {
  const stores: Array<{ name: string; code: string }> = [];

  // Global app store
  stores.push({
    name: "app-store",
    code: `"use client";

import { create } from "zustand";

interface AppState {
  user: {
    id: string;
    email: string;
    name?: string;
  } | null;
  setUser: (user: AppState["user"]) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));`,
  });

  // UI store
  stores.push({
    name: "ui-store",
    code: `"use client";

import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  theme: "light",
  setTheme: (theme) => set({ theme }),
}));`,
  });

  return {
    type: "zustand",
    stores,
  };
}

function generateForms(agent2Output: Agent2Output): Array<{
  name: string;
  path: string;
  code: string;
}> {
  const forms: Array<{ name: string; path: string; code: string }> = [];

  // Login form
  forms.push({
    name: "LoginForm",
    path: "components/forms/LoginForm.tsx",
    code: `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}`,
  });

  return forms;
}

function setupErrorHandling(): {
  global_handler: string;
  error_boundary: string;
} {
  return {
    global_handler: `export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

export function logError(error: unknown, context?: string) {
  console.error(\`Error\${context ? \` in \${context}\` : ""}:\`, error);
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === "production") {
    // Send to Sentry, LogRocket, etc.
  }
}`,
    error_boundary: `"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}`,
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTypeScriptType(columnName: string): string {
  if (columnName.includes("_at")) return "string";
  if (columnName.includes("price") || columnName.includes("amount")) return "number";
  if (columnName.includes("count") || columnName.includes("stock")) return "number";
  if (columnName.includes("is_") || columnName.includes("has_")) return "boolean";
  return "string";
}
