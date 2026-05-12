import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wa: {
          // Fixed brand greens (used the same in both modes)
          green: "#00a884",
          "green-dark": "#008069",
          "green-darker": "#005c4b",
          // CSS-variable-driven tokens (auto-adapt to dark mode)
          bg: "rgb(var(--wa-bg) / <alpha-value>)",
          sidebar: "rgb(var(--wa-sidebar) / <alpha-value>)",
          panel: "rgb(var(--wa-panel) / <alpha-value>)",
          raised: "rgb(var(--wa-raised) / <alpha-value>)",
          bubble: "rgb(var(--wa-bubble) / <alpha-value>)",
          "bubble-out": "rgb(var(--wa-bubble-out) / <alpha-value>)",
          "chat-bg": "rgb(var(--wa-chat-bg) / <alpha-value>)",
          divider: "rgb(var(--wa-divider) / <alpha-value>)",
          text: "rgb(var(--wa-text) / <alpha-value>)",
          "text-muted": "rgb(var(--wa-text-muted) / <alpha-value>)",
          "system-bubble": "rgb(var(--wa-system-bubble) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Helvetica",
          "Lucida Grande",
          "Arial",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
