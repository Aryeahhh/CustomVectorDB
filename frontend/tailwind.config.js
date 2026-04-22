/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-primary": "#4d2600",
        "outline": "#a38c7c",
        "on-surface": "#f2dfd3",
        "primary-fixed": "#ffdcc3",
        "inverse-primary": "#904d00",
        "secondary-container": "#3c475a",
        "tertiary": "#96ccff",
        "surface": "#1a120b",
        "tertiary-fixed": "#cee5ff",
        "outline-variant": "#554336",
        "on-primary-container": "#432100",
        "surface-container-low": "#231a13",
        "surface-variant": "#3e332b",
        "primary": "#ffb77d",
        "tertiary-container": "#0297e8",
        "primary-container": "#d97707",
        "background": "#1a120b",
        "surface-container": "#271e16",
        "blueprint-border": "#4A5568",
        "blueprint-bg": "#0F1115",
        "blueprint-accent": "#D97706"
      },
      spacing: {
        "margin-lg": "24px",
        "container-padding": "32px",
        "margin-md": "16px",
        "unit": "4px",
        "gutter": "1px",
        "margin-sm": "8px"
      },
      fontFamily: {
        "label": ["Inter", "sans-serif"],
        "h2": ["IBM Plex Sans", "sans-serif"],
        "h1": ["IBM Plex Sans", "sans-serif"],
        "h3": ["IBM Plex Sans", "sans-serif"],
        "data-lg": ["JetBrains Mono", "monospace"],
        "body": ["Inter", "sans-serif"],
        "data-sm": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "label": ["11px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
        "h2": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "h1": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "h3": ["20px", { lineHeight: "1.2", letterSpacing: "0", fontWeight: "600" }],
        "data-lg": ["18px", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "500" }],
        "body": ["14px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "data-sm": ["12px", { lineHeight: "1", letterSpacing: "0", fontWeight: "400" }]
      }
    }
  },
  plugins: [],
}
