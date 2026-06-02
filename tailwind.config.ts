import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F0E8",
        paper: "#FFFBF5",
        ink: "#1F1D1A",
        muted: "#8F8478",
        line: "#E7DDD2",
        sage: "#8FBC9A",
        sageDeep: "#5E8D6A",
        sageSoft: "#E4F0E5",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(72, 55, 40, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
