"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/database";

interface UsageData {
  projects_created: number;
  projects_limit: number;
  tokens_used: number;
  tokens_limit: number;
  api_calls: number;
  api_calls_limit: number;
}

interface BillingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    projects: number;
    tokens: number;
    api_calls: number;
  };
}

const PLANS: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "3 projects per month",
      "10,000 tokens per month",
      "Basic support",
      "Community access",
    ],
    limits: {
      projects: 3,
      tokens: 10000,
      api_calls: 100,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    features: [
      "Unlimited projects",
      "100,000 tokens per month",
      "Priority support",
      "Advanced features",
      "Custom domains",
    ],
    limits: {
      projects: -1, // unlimited
      tokens: 100000,
      api_calls: 1000,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    features: [
      "Unlimited everything",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Team collaboration",
      "Advanced analytics",
    ],
    limits: {
      projects: -1,
      tokens: -1,
      api_calls: -1,
    },
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [usage, setUsage] = useState<UsageData>({
    projects_created: 0,
    projects_limit: 3,
    tokens_used: 0,
    tokens_limit: 10000,
    api_calls: 0,
    api_calls_limit: 100,
  });

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get user's current plan
      const { data: userData } = await supabase
        .from("users")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      if (userData) {
        setCurrentPlan(userData.subscription_tier || "free");
      }

      // Get usage data
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const { count: projectsCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", thisMonth.toISOString());

      // In production, these would come from usage tracking tables
      setUsage({
        projects_created: projectsCount || 0,
        projects_limit: PLANS.find((p) => p.id === currentPlan)?.limits.projects || 3,
        tokens_used: 0,
        tokens_limit: PLANS.find((p) => p.id === currentPlan)?.limits.tokens || 10000,
        api_calls: 0,
        api_calls_limit: PLANS.find((p) => p.id === currentPlan)?.limits.api_calls || 100,
      });
    } catch (error) {
      console.error("Failed to fetch usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const formatLimit = (limit: number): string => {
    return limit === -1 ? "Unlimited" : limit.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Billing & Usage
        </h1>
        <p className="text-gray-600">
          Manage your subscription and monitor usage
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Current Plan: {PLANS.find((p) => p.id === currentPlan)?.name}
            </h2>
            <p className="text-gray-600">
              ${PLANS.find((p) => p.id === currentPlan)?.price}/month
            </p>
          </div>
          {currentPlan !== "enterprise" && (
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          This Month's Usage
        </h2>

        <div className="space-y-6">
          {/* Projects */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Projects Created
              </span>
              <span className="text-sm text-gray-500">
                {usage.projects_created} / {formatLimit(usage.projects_limit)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  getUsagePercentage(usage.projects_created, usage.projects_limit) > 80
                    ? "bg-red-600"
                    : "bg-blue-600"
                }`}
                style={{
                  width: `${getUsagePercentage(
                    usage.projects_created,
                    usage.projects_limit
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Tokens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Tokens Used
              </span>
              <span className="text-sm text-gray-500">
                {usage.tokens_used.toLocaleString()} /{" "}
                {formatLimit(usage.tokens_limit)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  getUsagePercentage(usage.tokens_used, usage.tokens_limit) > 80
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
                style={{
                  width: `${getUsagePercentage(usage.tokens_used, usage.tokens_limit)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* API Calls */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                API Calls
              </span>
              <span className="text-sm text-gray-500">
                {usage.api_calls.toLocaleString()} /{" "}
                {formatLimit(usage.api_calls_limit)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  getUsagePercentage(usage.api_calls, usage.api_calls_limit) > 80
                    ? "bg-red-600"
                    : "bg-purple-600"
                }`}
                style={{
                  width: `${getUsagePercentage(usage.api_calls, usage.api_calls_limit)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Plans
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg border-2 p-6 ${
                currentPlan === plan.id
                  ? "border-blue-600 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              {currentPlan === plan.id && (
                <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Current Plan
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-500">/month</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={currentPlan === plan.id}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  currentPlan === plan.id
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {currentPlan === plan.id ? "Current Plan" : "Upgrade"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Billing History
          </h2>
        </div>

        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            No billing history yet
          </div>
        </div>
      </div>
    </div>
  );
}
