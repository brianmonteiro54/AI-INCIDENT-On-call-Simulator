import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Duolingo-style palette
        duo: {
          green: "#58CC02",
          "green-dark": "#58A700",
          "green-light": "#D7FFB8",
          blue: "#1CB0F6",
          "blue-dark": "#1899D6",
          "blue-light": "#DDF4FF",
          yellow: "#FFC800",
          "yellow-dark": "#E5A100",
          "yellow-light": "#FFF1AA",
          red: "#FF4B4B",
          "red-dark": "#E03D3D",
          "red-light": "#FFDFE0",
          orange: "#FF9600",
          "orange-dark": "#E58600",
          "orange-light": "#FFE7B3",
          purple: "#CE82FF",
          "purple-dark": "#A560E8",
          cream: "#FFFBEF",
          paper: "#FFF8E1",
          ink: "#3C3C3C",
          "ink-soft": "#777777",
          "ink-faded": "#AFAFAF",
          line: "#E5E5E5",
          "line-soft": "#F0F0F0",
        },
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "Georgia", "serif"],
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Menlo", "monospace"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
