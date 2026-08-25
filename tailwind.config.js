/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#0B2A3D",
          "ink-soft": "#12384f",
          "ink-deep": "#071b28",
          paper: "#F3F4EF",
          "paper-dim": "#E5E3D6",
          gold: "#B08D57",
        },
      },
      fontFamily: {
        // Neue Montreal é paga e não está no Google Fonts — assim que os
        // arquivos (.woff2) forem adicionados via @font-face em
        // globals.css, o navegador passa a usá-la automaticamente, sem
        // precisar mexer em nenhuma classe.
        display: ['"Neue Montreal"', "var(--font-sans)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
