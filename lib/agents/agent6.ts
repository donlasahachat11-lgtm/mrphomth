import type { Agent2Output, Agent6Output } from "./types";

/**
 * Agent 6: Testing & Quality Assurance
 * 
 * Responsibilities:
 * - Generate unit tests
 * - Generate integration tests
 * - Generate E2E tests
 * - Set up testing infrastructure
 * - Add linting and type checking
 * - Add accessibility checks
 */
export async function executeAgent6(agent2Output: Agent2Output): Promise<Agent6Output> {
  const startTime = Date.now();

  try {
    // Generate test files
    const testFiles = generateTestFiles(agent2Output);

    // Calculate test coverage
    const testCoverage = {
      target: 80,
      actual: 75, // Simulated
    };

    // Quality checks
    const qualityChecks = {
      linting: true,
      type_checking: true,
      accessibility: true,
    };

    const executionTime = Date.now() - startTime;
    console.log(`Agent 6 completed in ${executionTime}ms`);

    return {
      test_files: testFiles,
      test_coverage: testCoverage,
      quality_checks: qualityChecks,
    };
  } catch (error) {
    console.error("Agent 6 error:", error);
    throw new Error(`Agent 6 failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function generateTestFiles(agent2Output: Agent2Output): Array<{
  name: string;
  path: string;
  code: string;
  type: "unit" | "integration" | "e2e";
}> {
  const testFiles: Array<{
    name: string;
    path: string;
    code: string;
    type: "unit" | "integration" | "e2e";
  }> = [];

  // Jest configuration
  testFiles.push({
    name: "jest.config",
    path: "jest.config.js",
    type: "unit",
    code: `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)`,
  });

  // Jest setup
  testFiles.push({
    name: "jest.setup",
    path: "jest.setup.js",
    type: "unit",
    code: `import '@testing-library/jest-dom'`,
  });

  // API route tests
  agent2Output.api_endpoints?.forEach((endpoint) => {
    const [method, path] = endpoint.split(" ");
    const pathParts = path.split("/").filter(Boolean);
    const resource = pathParts[pathParts.length - 1];

    testFiles.push({
      name: `${resource}.test`,
      path: `__tests__/api/${resource}.test.ts`,
      type: "integration",
      code: `import { GET, POST } from '@/app/api/${resource}/route';
import { NextRequest } from 'next/server';

describe('/api/${resource}', () => {
  describe('GET', () => {
    it('should return ${resource} list', async () => {
      const request = new NextRequest('http://localhost:3000/api/${resource}');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST', () => {
    it('should create new ${resource.slice(0, -1)}', async () => {
      const mockData = {
        // Add mock data based on schema
      };

      const request = new NextRequest('http://localhost:3000/api/${resource}', {
        method: 'POST',
        body: JSON.stringify(mockData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
    });

    it('should return 400 for invalid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/${resource}', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});`,
    });
  });

  // Component tests
  testFiles.push({
    name: "Header.test",
    path: "__tests__/components/Header.test.tsx",
    type: "unit",
    code: `import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header', () => {
  it('should render logo', () => {
    render(<Header />);
    expect(screen.getByText('${agent2Output.project_name || "App"}')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Header />);
    ${
      agent2Output.folder_structure?.app
        ?.filter((page) => !page.startsWith("api"))
        .map((page) => `expect(screen.getByText('${capitalize(page)}')).toBeInTheDocument();`)
        .join("\n    ") || ""
    }
  });

  it('should render auth buttons', () => {
    render(<Header />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
});`,
  });

  // E2E tests
  testFiles.push({
    name: "home.spec",
    path: "e2e/home.spec.ts",
    type: "e2e",
    code: `import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/${agent2Output.project_name || "App"}/);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('h1');
    await expect(hero).toBeVisible();
  });

  test('should navigate to signup', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/signup');
  });
});`,
  });

  // Playwright config
  testFiles.push({
    name: "playwright.config",
    path: "playwright.config.ts",
    type: "e2e",
    code: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});`,
  });

  // ESLint config
  testFiles.push({
    name: "eslint.config",
    path: ".eslintrc.json",
    type: "unit",
    code: `{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "jsx-a11y/anchor-is-valid": "error"
  }
}`,
  });

  return testFiles;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
