const { fontFamily } = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "w-bg-0": "var(--weui-BG-0)",
        "w-bg-1": "var(--weui-BG-1)",
        "w-bg-2": "var(--weui-BG-2)",
        "w-bg-3": "var(--weui-BG-3)",
        "w-bg-4": "var(--weui-BG-4)",
        "w-bg-5": "var(--weui-BG-5)",
        "w-bg-active": "var(--weui-BG-COLOR-ACTIVE)",
        "w-fg-0": "var(--weui-FG-0)",
        "w-fg-1": "var(--weui-FG-1)",
        "w-fg-2": "var(--weui-FG-2)",
        "w-fg-3": "var(--weui-FG-3)",
        "w-fg-4": "var(--weui-FG-4)",
        "w-fg-5": "var(--weui-FG-5)",
        "w-red": "var(--weui-RED)",
        "w-brand": "var(--weui-BRAND)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        rotate: {
          from: { rotate: 360 },
          to: { rotate: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        rotate: "rotate",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".safe-top": {
          paddingTop: "constant(safe-area-inset-top)",
          paddingTop: "env(safe-area-inset-top)",
        },
        ".safe-left": {
          paddingLeft: "constant(safe-area-inset-left)",
          paddingLeft: "env(safe-area-inset-left)",
        },
        ".safe-right": {
          paddingRight: "constant(safe-area-inset-right)",
          paddingRight: "env(safe-area-inset-right)",
        },
        ".safe-bottom": {
          paddingBottom: "constant(safe-area-inset-bottom)",
          paddingBottom: "env(safe-area-inset-bottom)",
        },
      };
      addUtilities(newUtilities);
    }),
  ],
};
