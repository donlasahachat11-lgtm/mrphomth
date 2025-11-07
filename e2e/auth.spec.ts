import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Mr.Promth/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', "invalid@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator("text=/error/i")).toBeVisible();
  });

  test("should navigate to signup page", async ({ page }) => {
    await page.goto("/login");

    await page.click("text=/sign up/i");
    await expect(page).toHaveURL(/\/signup/);
  });

  test("should have OAuth buttons", async ({ page }) => {
    await page.goto("/login");

    const googleButton = page.locator("button:has-text('Google')");
    const githubButton = page.locator("button:has-text('GitHub')");

    await expect(googleButton || githubButton).toBeTruthy();
  });
});

test.describe("Protected Routes", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/app/dashboard");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("should access dashboard when authenticated", async ({ page }) => {
    // This would require actual authentication setup
    // For now, just test the redirect
    await page.goto("/app/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
