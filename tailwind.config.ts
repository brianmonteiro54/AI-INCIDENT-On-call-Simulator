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
        void: {
          950: "#050608",
          900: "#0a0c10",
          800: "#0f1218",
          700: "#161a23",
          600: "#1d2230",
        },
        acid: {
          300: "#a7f3d0",
          400: "#6ee7b7",
          500: "#34d399",
          600: "#10b981",
        },
        blood: {
          400: "#ff6b7a",
          500: "#ff3355",
          600: "#e1112e",
          700: "#b00d24",
        },
        amber: {
          glow: "#fbbf24",
        },
        cyber: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "Georgia", "serif"],
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Menlo", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 1.4s ease-in-out infinite",
        "scan-line": "scan-line 8s linear infinite",
        "shake": "shake 0.4s cubic-bezier(.36,.07,.19,.97) both",
        "float": "float 6s ease-in-out infinite",
        "breath": "breath 4s ease-in-out infinite",
        "siren": "siren 1s ease-in-out infinite",
        "boot": "boot 0.8s steps(20, end)",
        "ticker": "ticker 0.5s ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.6", filter: "brightness(1.4)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        shake: {
          "10%, 90%": { transform: "translateX(-1px)" },
          "20%, 80%": { transform: "translateX(2px)" },
          "30%, 50%, 70%": { transform: "translateX(-3px)" },
          "40%, 60%": { transform: "translateX(3px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        breath: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.04)" },
        },
        siren: {
          "0%, 100%": { background: "rgba(255, 51, 85, 0.18)" },
          "50%": { background: "rgba(255, 51, 85, 0.32)" },
        },
        boot: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        ticker: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        "noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        "radial-fade":
          "radial-gradient(ellipse at top, rgba(34, 211, 238, 0.08), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
