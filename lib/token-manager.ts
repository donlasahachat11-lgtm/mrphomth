import { createClient } from "./database";

export interface TokenUsage {
  user_id: string;
  project_id?: string;
  tokens_used: number;
  operation: string;
  created_at: string;
}

export interface TokenQuota {
  user_id: string;
  monthly_limit: number;
  used_this_month: number;
  remaining: number;
}

/**
 * Token Manager
 * Handles token tracking, quota management, and usage analytics
 */
export class TokenManager {
  private supabase = createClient();

  /**
   * Track token usage for a user
   */
  async trackUsage(
    userId: string,
    tokensUsed: number,
    operation: string,
    projectId?: string
  ): Promise<void> {
    try {
      await this.supabase.from("token_usage").insert({
        user_id: userId,
        project_id: projectId,
        tokens_used: tokensUsed,
        operation,
      });
    } catch (error) {
      console.error("Failed to track token usage:", error);
      throw error;
    }
  }

  /**
   * Get user's token quota and usage
   */
  async getQuota(userId: string): Promise<TokenQuota> {
    try {
      // Get user's subscription tier
      const { data: userData } = await this.supabase
        .from("users")
        .select("subscription_tier")
        .eq("id", userId)
        .single();

      const tier = userData?.subscription_tier || "free";

      // Define limits based on tier
      const limits: Record<string, number> = {
        free: 10000,
        pro: 100000,
        enterprise: -1, // unlimited
      };

      const monthlyLimit = limits[tier] || 10000;

      // Get usage this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: usageData } = await this.supabase
        .from("token_usage")
        .select("tokens_used")
        .eq("user_id", userId)
        .gte("created_at", startOfMonth.toISOString());

      const usedThisMonth = usageData?.reduce(
        (sum, record) => sum + (record.tokens_used || 0),
        0
      ) || 0;

      return {
        user_id: userId,
        monthly_limit: monthlyLimit,
        used_this_month: usedThisMonth,
        remaining: monthlyLimit === -1 ? -1 : monthlyLimit - usedThisMonth,
      };
    } catch (error) {
      console.error("Failed to get token quota:", error);
      throw error;
    }
  }

  /**
   * Check if user has enough tokens
   */
  async hasEnoughTokens(userId: string, requiredTokens: number): Promise<boolean> {
    try {
      const quota = await this.getQuota(userId);

      // Unlimited plan
      if (quota.monthly_limit === -1) {
        return true;
      }

      return quota.remaining >= requiredTokens;
    } catch (error) {
      console.error("Failed to check token availability:", error);
      return false;
    }
  }

  /**
   * Estimate tokens for a prompt
   */
  estimateTokens(text: string): number {
    // Simple estimation: ~4 characters per token
    // In production, use a proper tokenizer like tiktoken
    return Math.ceil(text.length / 4);
  }

  /**
   * Get usage analytics for a user
   */
  async getUsageAnalytics(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await this.supabase
        .from("token_usage")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (!data) return null;

      // Group by operation
      const byOperation = data.reduce((acc, record) => {
        const op = record.operation || "unknown";
        if (!acc[op]) {
          acc[op] = { count: 0, tokens: 0 };
        }
        acc[op].count++;
        acc[op].tokens += record.tokens_used || 0;
        return acc;
      }, {} as Record<string, { count: number; tokens: number }>);

      // Group by day
      const byDay = data.reduce((acc, record) => {
        const day = new Date(record.created_at).toISOString().split("T")[0];
        if (!acc[day]) {
          acc[day] = 0;
        }
        acc[day] += record.tokens_used || 0;
        return acc;
      }, {} as Record<string, number>);

      const totalTokens = data.reduce(
        (sum, record) => sum + (record.tokens_used || 0),
        0
      );

      return {
        total_tokens: totalTokens,
        total_operations: data.length,
        by_operation: byOperation,
        by_day: byDay,
        average_per_operation: totalTokens / data.length,
      };
    } catch (error) {
      console.error("Failed to get usage analytics:", error);
      return null;
    }
  }

  /**
   * Get top users by token usage (admin only)
   */
  async getTopUsers(limit: number = 10) {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data } = await this.supabase
        .from("token_usage")
        .select(`
          user_id,
          tokens_used,
          users (
            email
          )
        `)
        .gte("created_at", startOfMonth.toISOString());

      if (!data) return [];

      // Aggregate by user
      const userTotals = data.reduce((acc, record) => {
        const userId = record.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            email: (record as any).users?.email || "Unknown",
            total_tokens: 0,
          };
        }
        acc[userId].total_tokens += record.tokens_used || 0;
        return acc;
      }, {} as Record<string, { user_id: string; email: string; total_tokens: number }>);

      // Sort and limit
      return Object.values(userTotals)
        .sort((a, b) => b.total_tokens - a.total_tokens)
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to get top users:", error);
      return [];
    }
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
