/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F97316",
          foreground: "#FFFFFF",
        },
        background: "#F8FAFC",
        foreground: "#1E293B",
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        border: "#E2E8F0",
        // Dark mode colors
        "dark-background": "#151718",
        "dark-foreground": "#ECEDEE",
        "dark-muted": {
          DEFAULT: "#2D2D2D",
          foreground: "#9BA1A6",
        },
        "dark-border": "#2D2D2D",
        "dark-card": "#1E1E1E",
      },
      fontFamily: {
        sans: ["WorkSans_400Regular", "sans-serif"],
        heading: ["Inter_600SemiBold", "sans-serif"],
      },
    },
  },
  plugins: [],
};