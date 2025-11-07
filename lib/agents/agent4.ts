import type { Agent2Output, Agent3Output } from "./types";

export interface Agent4Output {
  components: Array<{
    name: string;
    path: string;
    code: string;
    type: "component" | "page" | "layout";
  }>;
  styles: Array<{
    name: string;
    path: string;
    code: string;
  }>;
  assets: Array<{
    name: string;
    type: string;
    url?: string;
  }>;
}

/**
 * Agent 4: Frontend Component Developer
 * 
 * Responsibilities:
 * - Create reusable React components
 * - Generate pages based on architecture
 * - Implement responsive design with Tailwind CSS
 * - Add animations and transitions
 * - Integrate with API routes
 */
export async function executeAgent4(
  agent2Output: Agent2Output,
  agent3Output: Agent3Output
): Promise<Agent4Output> {
  const startTime = Date.now();

  try {
    // Generate components
    const components = generateComponents(agent2Output);

    // Generate pages
    const pages = generatePages(agent2Output, agent3Output);

    // Generate styles
    const styles = generateStyles(agent2Output);

    // Prepare assets list
    const assets = prepareAssets(agent2Output);

    const executionTime = Date.now() - startTime;
    console.log(`Agent 4 completed in ${executionTime}ms`);

    return {
      components: [...components, ...pages],
      styles,
      assets,
    };
  } catch (error) {
    console.error("Agent 4 error:", error);
    throw new Error(`Agent 4 failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function generateComponents(agent2Output: Agent2Output): Array<{
  name: string;
  path: string;
  code: string;
  type: "component" | "page" | "layout";
}> {
  const components: Array<{
    name: string;
    path: string;
    code: string;
    type: "component" | "page" | "layout";
  }> = [];

  // Generate Header component
  components.push({
    name: "Header",
    path: "components/Header.tsx",
    type: "component",
    code: `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            ${agent2Output.project_name || "App"}
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            ${agent2Output.folder_structure?.app
              ?.filter((page) => !page.startsWith("api"))
              .map(
                (page) => `
            <Link
              href="/${page}"
              className={\`text-gray-600 hover:text-gray-900 transition-colors \${
                pathname === "/${page}" ? "font-semibold text-gray-900" : ""
              }\`}
            >
              ${capitalize(page)}
            </Link>`
              )
              .join("\n            ")}
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}`,
  });

  // Generate Footer component
  components.push({
    name: "Footer",
    path: "components/Footer.tsx",
    type: "component",
    code: `export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">${agent2Output.project_name || "App"}</h3>
            <p className="text-gray-400">
              ${agent2Output.description || "Built with Mr.Promth"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ${agent2Output.project_name || "App"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}`,
  });

  // Generate Loading component
  components.push({
    name: "Loading",
    path: "components/Loading.tsx",
    type: "component",
    code: `export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}`,
  });

  // Generate Card component for each table
  agent2Output.database_schema?.tables?.forEach((table) => {
    const componentName = capitalize(table.name.slice(0, -1)) + "Card";

    components.push({
      name: componentName,
      path: `components/${componentName}.tsx`,
      type: "component",
      code: `interface ${componentName}Props {
  ${table.name.slice(0, -1)}: {
    id: string;
${table.columns
  .filter((col) => col !== "id")
  .map((col) => `    ${col}: ${getTypeScriptType(col)};`)
  .join("\n")}
  };
}

export function ${componentName}({ ${table.name.slice(0, -1)} }: ${componentName}Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{${table.name.slice(0, -1)}.${
        table.columns.find((c) => c.includes("name") || c.includes("title")) || "id"
      }}</h3>
        ${
          table.columns.includes("description")
            ? `<p className="text-gray-600 mb-4">{${table.name.slice(0, -1)}.description}</p>`
            : ""
        }
        ${
          table.columns.includes("price")
            ? `<p className="text-2xl font-bold text-blue-600">\${${table.name.slice(0, -1)}.price}</p>`
            : ""
        }
        <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}`,
    });
  });

  return components;
}

function generatePages(
  agent2Output: Agent2Output,
  agent3Output: Agent3Output
): Array<{
  name: string;
  path: string;
  code: string;
  type: "component" | "page" | "layout";
}> {
  const pages: Array<{
    name: string;
    path: string;
    code: string;
    type: "component" | "page" | "layout";
  }> = [];

  // Generate home page
  pages.push({
    name: "Home",
    path: "app/page.tsx",
    type: "page",
    code: `import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to ${agent2Output.project_name || "Our App"}
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              ${agent2Output.description || "The best solution for your needs"}
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="/signup"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </a>
              <a
                href="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              ${agent2Output.features
                ?.slice(0, 3)
                .map(
                  (feature) => `
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">${capitalize(feature.replace(/_/g, " "))}</h3>
                <p className="text-gray-600">Experience the best ${feature.replace(/_/g, " ")} features</p>
              </div>`
                )
                .join("\n              ")}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}`,
  });

  // Generate layout
  pages.push({
    name: "RootLayout",
    path: "app/layout.tsx",
    type: "layout",
    code: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${agent2Output.project_name || "App"}",
  description: "${agent2Output.description || "Built with Mr.Promth"}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,
  });

  return pages;
}

function generateStyles(agent2Output: Agent2Output): Array<{
  name: string;
  path: string;
  code: string;
}> {
  const styles: Array<{
    name: string;
    path: string;
    code: string;
  }> = [];

  // Generate globals.css
  styles.push({
    name: "globals",
    path: "app/globals.css",
    code: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  .container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}`,
  });

  return styles;
}

function prepareAssets(agent2Output: Agent2Output): Array<{
  name: string;
  type: string;
  url?: string;
}> {
  const assets: Array<{
    name: string;
    type: string;
    url?: string;
  }> = [];

  // Placeholder assets
  assets.push({
    name: "logo",
    type: "image/svg+xml",
    url: "/logo.svg",
  });

  assets.push({
    name: "hero-image",
    type: "image/jpeg",
    url: "/hero.jpg",
  });

  return assets;
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
