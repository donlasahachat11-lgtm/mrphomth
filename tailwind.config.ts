import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1115",
        foreground: "#f5f6f8",
        muted: "#1a1d24",
        accent: "#6366f1",
        border: "#1f2430"
      }
    }
  },
  plugins: []
};

export default config;
