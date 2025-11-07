"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AgentsLibraryPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAgents();
  }, [selectedCategory]);

  async function fetchAgents() {
    setLoading(true);
    try {
      let query = supabase
        .from("agents")
        .select("*")
        .eq("is_public", true)
        .order("usage_count", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: "all", name: "All", icon: "🤖" },
    { id: "content", name: "Content Creation", icon: "✍️" },
    { id: "code", name: "Code Generation", icon: "💻" },
    { id: "business", name: "Business", icon: "💼" },
    { id: "data", name: "Data Analysis", icon: "📊" },
    { id: "education", name: "Education", icon: "🎓" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">AI Agents</h1>
          <p className="text-gray-600 text-lg">
            เลือกจาก 20+ AI Agents - Multi-step workflows ที่ทำงานซับซ้อนได้อัตโนมัติ
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="ค้นหา Agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No agents found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: any }) {
  const stepCount = agent.workflow?.steps?.length || 0;

  return (
    <Link href={`/agents/${agent.id}`}>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg">{agent.name}</h3>
          <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
            {agent.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {agent.description}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>🔗 {stepCount} steps</span>
          <span>{agent.usage_count || 0} uses</span>
        </div>
      </div>
    </Link>
  );
}
