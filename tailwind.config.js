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
          400: "#909296",
          "400-dark": "#868e96",
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
