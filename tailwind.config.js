/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--raiz-moss)",
        secondary: "var(--raiz-paper)",
        accent: "var(--raiz-alert)",
        surface: "var(--raiz-surface)",
        ink: "var(--raiz-ink)",
        moss: "#4A5D4E",
        paper: "#F9F7F2",
        stone: "#333333",
        text_dark: "var(--raiz-stone)",
        text_light: "var(--raiz-paper)",
        background_light: "var(--raiz-surface)",
        background_dark: "var(--raiz-ink)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        ui: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
