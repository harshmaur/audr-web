/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "IBM Plex Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
        sans: [
          "IBM Plex Sans",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        "sev-critical": "var(--severity-critical)",
        "sev-high": "var(--severity-high)",
        "sev-medium": "var(--severity-medium)",
        "sev-low": "var(--severity-low)",
        "sev-ok": "var(--severity-ok)",
      },
      maxWidth: {
        page: "1080px",
        narrow: "760px",
        h1: "920px",
        sub: "680px",
      },
      borderRadius: {
        DEFAULT: "0",
        none: "0",
      },
      fontSize: {
        h1: ["clamp(28px, 4.4vw, 50px)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
      },
    },
  },
  plugins: [],
};
