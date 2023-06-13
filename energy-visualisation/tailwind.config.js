/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // custom colors for tailwind
      colors: {
        primary: "#A5DBA3",
        vuwGreen: "#0D4C38",
      },
    },
  },
  plugins: [],
};
