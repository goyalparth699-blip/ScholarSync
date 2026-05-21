import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     "#0B1020",
          surface:  "#11182D",
          elevated: "#161F36",
          subtle:   "#1B2540",
        },
        accent: {
          purple: "#7C6CFF",
          blue:   "#4DA3FF",
        },
        text: {
          primary:   "#F5F7FA",
          secondary: "#9CA3AF",
          muted:     "#6B7280",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error:   "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl:  "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card:     "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)",
        elevated: "0 4px 16px rgba(0,0,0,0.6)",
        accent:   "0 0 24px rgba(124,108,255,0.12)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-800px 0" },
          "100%": { backgroundPosition:  "800px 0" },
        },
      },
      animation: {
        "fade-in":  "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        shimmer:    "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
