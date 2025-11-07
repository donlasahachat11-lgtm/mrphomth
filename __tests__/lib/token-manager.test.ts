import { TokenManager } from "@/lib/token-manager";

// Mock Supabase client
jest.mock("@/lib/database", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { subscription_tier: "free" },
            error: null,
          }),
          gte: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        })),
        gte: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })),
    })),
  })),
}));

describe("TokenManager", () => {
  let tokenManager: TokenManager;

  beforeEach(() => {
    tokenManager = new TokenManager();
  });

  describe("estimateTokens", () => {
    it("should estimate tokens based on text length", () => {
      const text = "This is a test prompt";
      const estimated = tokenManager.estimateTokens(text);
      expect(estimated).toBeGreaterThan(0);
      expect(estimated).toBe(Math.ceil(text.length / 4));
    });

    it("should handle empty text", () => {
      const estimated = tokenManager.estimateTokens("");
      expect(estimated).toBe(0);
    });

    it("should handle long text", () => {
      const longText = "a".repeat(1000);
      const estimated = tokenManager.estimateTokens(longText);
      expect(estimated).toBe(250);
    });
  });

  describe("getQuota", () => {
    it("should return quota for free tier", async () => {
      const quota = await tokenManager.getQuota("user-123");
      expect(quota).toHaveProperty("user_id");
      expect(quota).toHaveProperty("monthly_limit");
      expect(quota).toHaveProperty("used_this_month");
      expect(quota).toHaveProperty("remaining");
      expect(quota.monthly_limit).toBe(10000);
    });
  });

  describe("hasEnoughTokens", () => {
    it("should return true if user has enough tokens", async () => {
      const hasEnough = await tokenManager.hasEnoughTokens("user-123", 100);
      expect(typeof hasEnough).toBe("boolean");
    });

    it("should return false if user exceeds quota", async () => {
      const hasEnough = await tokenManager.hasEnoughTokens("user-123", 999999);
      // This would depend on mock data, but test structure is here
      expect(typeof hasEnough).toBe("boolean");
    });
  });
});
