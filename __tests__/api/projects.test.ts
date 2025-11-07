import { GET, POST } from "@/app/api/projects/route";
import { NextRequest } from "next/server";

// Mock database
jest.mock("@/lib/database", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn().mockResolvedValue({
            data: [
              {
                id: "project-1",
                name: "Test Project",
                status: "completed",
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: "new-project-id",
              name: "New Project",
              status: "pending",
            },
            error: null,
          }),
        })),
      })),
    })),
  })),
}));

describe("/api/projects", () => {
  describe("GET", () => {
    it("should return list of projects", async () => {
      const request = new NextRequest("http://localhost:3000/api/projects");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it("should return 401 for unauthenticated requests", async () => {
      // Mock unauthenticated user
      jest.spyOn(require("@/lib/database"), "createClient").mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error("Not authenticated"),
          }),
        },
      });

      const request = new NextRequest("http://localhost:3000/api/projects");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe("POST", () => {
    it("should create new project", async () => {
      const mockProject = {
        name: "Test Project",
        user_prompt: "Create a todo app",
      };

      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify(mockProject),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("name");
    });

    it("should return 400 for invalid data", async () => {
      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
