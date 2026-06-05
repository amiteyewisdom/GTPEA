import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'gtpea-navy': '#041633',
        'gtpea-gold': '#D4AF37',
        'gtpea-green': '#2D7A4D',
        'gtpea-dark-green': '#1E5A36',
      },
    },
  },
  plugins: [],
};
export default config;