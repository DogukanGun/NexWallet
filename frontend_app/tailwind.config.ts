import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'primary-gradient': 'linear-gradient(to right, var(--orange-400), var(--pink-500))',
        'secondary-gradient': 'linear-gradient(to right, var(--purple-400), var(--pink-500))',
        'neutral-gradient': 'linear-gradient(to right, var(--base-300), var(--base-200))',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "primary": "#ff6b00",
          "secondary": "#f000b8",
          "accent": "#1dcdbc",
          "neutral": "#2b3440",
          "base-100": "#000000",
          "base-200": "#0f1318",
          "base-300": "#1a1f24",
          "--orange-400": "#ff8a4c",
          "--pink-500": "#f000b8",
          "--purple-400": "#c084fc",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "primary": "#ff6b00",
          "secondary": "#f000b8",
          "accent": "#1dcdbc",
          "neutral": "#2b3440",
          "base-100": "#ffffff",
          "base-200": "#f8f9fa",
          "base-300": "#e9ecef",
          "--orange-400": "#ff8a4c",
          "--pink-500": "#f000b8",
          "--purple-400": "#c084fc",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        }
      }
    ],
    darkTheme: "dark",
  }
} as Config;

export default config;