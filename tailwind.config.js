const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");
const { colors } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {},
      }),
      borderRadius: {
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      colors: {
        gray: {
          "400-dark": "#909296",
          400: "#868e96",
        },
        mantine: {
          "text-dark": "#C1C2C5",
          text: "#000",
          "paper-dark": "#101113",
        },
      },
    },
    fontFamily: {
      mono: ["Fira Code VF", "monospace"],
      sans: ["Inter var", "sans-serif"],
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("tailwind-scrollbar")({ nocompatible: true }),
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          highlight: (value) => ({ boxShadow: `inset 0 1px 0 0 ${value}` }),
        },
        {
          values: flattenColorPalette(theme("backgroundColor")),
          type: "color",
        }
      );
    },
  ],
  darkMode: "class",
};
