import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        sage: "rgb(var(--color-sage) / <alpha-value>)",
        sageDeep: "rgb(var(--color-sage-deep) / <alpha-value>)",
        sageSoft: "rgb(var(--color-sage-soft) / <alpha-value>)",
        missed: "rgb(var(--color-missed) / <alpha-value>)",
        future: "rgb(var(--color-future) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        chip: "rgb(var(--color-chip) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(72, 55, 40, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
