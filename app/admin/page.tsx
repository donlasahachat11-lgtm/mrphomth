"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/database";
import { useRouter } from "next/navigation";

interface AdminStats {
  total_users: number;
  total_projects: number;
  projects_today: number;
  active_projects: number;
  total_api_calls: number;
  total_tokens_used: number;
}

interface RecentProject {
  id: string;
  name: string;
  user_email: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_projects: 0,
    projects_today: 0,
    active_projects: 0,
    total_api_calls: 0,
    total_tokens_used: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role !== "admin") {
        router.push("/app/dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchAdminData();
    } catch (error) {
      console.error("Admin access check failed:", error);
      router.push("/app/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const supabase = createClient();

      // Fetch stats
      const { count: totalUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      const { count: totalProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: projectsToday } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      const { count: activeProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "running"]);

      setStats({
        total_users: totalUsers || 0,
        total_projects: totalProjects || 0,
        projects_today: projectsToday || 0,
        active_projects: activeProjects || 0,
        total_api_calls: 0, // Would come from usage tracking
        total_tokens_used: 0, // Would come from usage tracking
      });

      // Fetch recent projects
      const { data: projects } = await supabase
        .from("projects")
        .select(`
          id,
          name,
          status,
          created_at,
          users (
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (projects) {
        setRecentProjects(
          projects.map((p: any) => ({
            id: p.id,
            name: p.name || "Untitled",
            user_email: p.users?.email || "Unknown",
            status: p.status,
            created_at: p.created_at,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Total Users
            </span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.total_users.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Total Projects
            </span>
            <span className="text-2xl">📁</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.total_projects.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Projects Today
            </span>
            <span className="text-2xl">🚀</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.projects_today.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Active Projects
            </span>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.active_projects.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              API Calls
            </span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.total_api_calls.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Tokens Used
            </span>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.total_tokens_used.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Projects
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {project.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {project.user_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : project.status === "running"
                          ? "bg-blue-100 text-blue-800"
                          : project.status === "error"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-700 mr-3">
                      View
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
