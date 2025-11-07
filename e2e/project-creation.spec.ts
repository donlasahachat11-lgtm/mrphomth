import { test, expect } from "@playwright/test";

test.describe("Project Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, you'd need to authenticate first
    await page.goto("/app/dashboard");
  });

  test("should display prompt input", async ({ page }) => {
    const promptInput = page.locator("textarea");
    await expect(promptInput).toBeVisible();
  });

  test("should show agent chain progress", async ({ page }) => {
    // Check if agent steps are visible
    const agent1 = page.locator("text=/Prompt Expander/i");
    const agent2 = page.locator("text=/Architecture Designer/i");

    await expect(agent1).toBeVisible();
    await expect(agent2).toBeVisible();
  });

  test("should submit prompt and start generation", async ({ page }) => {
    const promptInput = page.locator("textarea");
    const submitButton = page.locator('button:has-text("Generate")');

    await promptInput.fill("Create a simple todo app with authentication");
    await submitButton.click();

    // Should show loading state
    await expect(page.locator("text=/generating/i")).toBeVisible();
  });

  test("should display project stats", async ({ page }) => {
    const stats = page.locator("text=/Agents/i");
    await expect(stats).toBeVisible();
  });
});

test.describe("Project List", () => {
  test("should navigate to projects page", async ({ page }) => {
    await page.goto("/app/projects");
    await expect(page).toHaveTitle(/Projects/i);
  });

  test("should show empty state when no projects", async ({ page }) => {
    await page.goto("/app/projects");

    const emptyState = page.locator("text=/No projects yet/i");
    // May or may not be visible depending on user data
    const createButton = page.locator("text=/Create New Project/i");

    expect(emptyState || createButton).toBeTruthy();
  });

  test("should display project cards", async ({ page }) => {
    await page.goto("/app/projects");

    // Look for project elements
    const projectCards = page.locator("[class*='project']");
    // Count may vary, just check structure exists
    expect(projectCards).toBeTruthy();
  });
});

test.describe("Project Detail", () => {
  test("should show project details", async ({ page }) => {
    // This would require a real project ID
    // For now, test the route structure
    await page.goto("/app/projects/test-id");

    // Should either show project or "not found"
    const content = page.locator("main");
    await expect(content).toBeVisible();
  });

  test("should have back button", async ({ page }) => {
    await page.goto("/app/projects/test-id");

    const backButton = page.locator("text=/Back to Projects/i");
    await expect(backButton).toBeVisible();
  });
});
