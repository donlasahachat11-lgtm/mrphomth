import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Mr.Prompt",
  description: "An all-in-one workspace for crafting, managing, and executing AI prompts.",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider defaultTheme="dark" storageKey="mrpromth-ui-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
