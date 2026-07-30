import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#050208",
        panel: "#0f0a1a",
        panel2: "#160f28",
        line: "#3a2a5c",
        accent: "#e879f9",       // magenta-pink neon
        accent2: "#22d3ee",      // cyan neon
        accent3: "#a78bfa",      // violet
        warn: "#fbbf24",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
