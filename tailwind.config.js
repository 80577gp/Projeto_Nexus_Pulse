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
        // Main brand colors
        primary: "#2A628F",
        secondary: "#00BCD4",
        accent: "#FF9800",

        // Text colors
        text_dark: "#333333",
        text_light: "#F5F5F5",

        // Background colors
        background_light: "#FFFFFF",
        background_dark: "#1A1A1A",
      },
    },
  },
  plugins: [],
};

