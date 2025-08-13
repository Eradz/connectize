const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      padding: "1.15rem",
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ["Nunito", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
      },
      screens: {
        xs: "480px",
        "2xl": "1400px",
      },
      colors: {
        background: "#F7F7F7",
        tabs: "#E1E1E1",
        dark: "#242424",
        gold: "#F1C644", // f1c644
        custom_yellow: "#FFFAB7",
        services_yellow: "#f0d77f",
        custom_grey: " #828282",
        light_grey: " #e5e5e5",
        mid_grey: "#373737",
        custom_blue: "#262626",
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        success: { 500: "#10b981" },
        warning: { 500: "#f59e0b" },
        danger: { 500: "#ef4444" },
        surface: {
          light: "#ffffff",
          dark: "#0b1220",
        },
        muted: {
          light: "#f3f4f6",
          dark: "#111827",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        '2xl': "1rem",
      },
      boxShadow: {
        card: "0 8px 24px -10px rgba(16,24,40,0.18)",
        subtle: "0 1px 2px rgba(16,24,40,0.06)",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "50%": { transform: "translateX(5px)" },
          "75%": { transform: "translateX(-5px)" },
        },
      },
      animation: {
        shake: "shake 0.35s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
