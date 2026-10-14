import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        polinema: {
          50: '#f0f5ff',
          100: '#e0ecff',
          500: '#0052cc',
          600: '#0747a6',
          700: '#172b4d',
          800: '#091e42',
        }
      }
    },
  },
  plugins: [],
};
export default config;
