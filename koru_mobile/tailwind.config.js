/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        stone: "rgb(var(--color-stone) / <alpha-value>)",
        sage: "rgb(var(--color-sage) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
      },
      fontFamily: {
        heading: ["Lora_600SemiBold", "serif"],
        body: ["Inter_500Medium", "sans-serif"],
        ui: ["Inter_400Regular", "sans-serif"],
      },
      boxShadow: {
        luxe: "0 20px 60px rgba(26, 26, 26, 0.12)",
      },
    },
  },
  plugins: [],
};
