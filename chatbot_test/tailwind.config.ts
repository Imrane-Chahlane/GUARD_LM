import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f0c",
        field: "#121713",
        panel: "#18201b",
        line: "#2c3a32",
        mint: "#20d6ad",
        leaf: "#85d475",
        ember: "#ff6b5f",
        amber: "#f6bf26",
        cloud: "#f4fbf6"
      }
    }
  },
  plugins: []
};

export default config;
