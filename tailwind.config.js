// const plugin = require("tailwindcss/plugin");

// import plugin from "tailwindcss/plugin"

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      padding: "1.15rem",
      center: true,
    },
    extend: {
      screens: {
        xs: "480px",
        "2xl": "1400px",
      },
      colors: {
        background: "#F7F7F7",
        tabs: "#E1E1E1",
        dark: "#242424",
        // The most-used colour in the Figma file by a wide margin (4,480 uses
        // against gold's 167) and its primary text/UI slate. In code it only
        // ever appears hardcoded inside SVG icon fills - 75 literals across 22
        // files - so it was never named. Tokenised here so new work can reach
        // for it and the value is documented in one place.
        //
        // Deliberately NOT redefining `dark` (#242424) to this: `dark` is the
        // de-facto text colour in ~400 web and ~1,500 mobile usages, and
        // #242424 appears nowhere in the design. Which of the two is
        // authoritative for text is a design decision, not a refactor, so the
        // two coexist until that is settled. See .claude/skills/connectize-design.
        slate: "#374957",
        gold: "#F1C644",
        custom_yellow: "#FFCF3F",
        services_yellow: "#f0d77f",
        pale_yellow: "#FFE7A4",
        light_yellow: "#FFEF9A",
        custom_grey: "#828282",
        light_grey: "#e5e5e5",
        mid_grey: "#373737",
        custom_blue: "#262626",
        primary: {
          50: "#FFFDF5",
          100: "#FFF9E0",
          200: "#FFF2B8",
          300: "#FFE88A",
          400: "#FFDC5E",
          500: "#F1C644",
          600: "#D4A820",
          700: "#B08B10",
          800: "#8A6D0A",
          900: "#644E06",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
        medium: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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
  // plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
