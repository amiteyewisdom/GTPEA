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
        // Brand Colors - Updated to match login page (white, gold, green)
        'brand-primary': '#FFFFFF',
        'brand-sidebar': '#FFFFFF',
        'brand-accent': '#b59a6d',
        'brand-success': '#2D7A4D',
        'brand-warning': '#F59E0B',
        'brand-danger': '#DC2626',
        'brand-text': '#1e5a36',
        'brand-text-secondary': '#64748B',
        'brand-card-bg': '#FFFFFF',
        'brand-card-border': '#E2E8F0',
        'brand-hover': '#F1F5F9',
        'brand-green': '#2D7A4D',
        'brand-green-dark': '#1e5a36',
        'brand-green-light': '#23633b',
        'brand-background': '#F8FAFC',
        
        // Legacy colors for compatibility
        'gtpea-navy': '#041633',
        'gtpea-gold': '#b59a6d',
        'gtpea-green': '#2D7A4D',
        'gtpea-dark-green': '#1e5a36',
      },
      borderRadius: {
        'brand': '18px',
        'brand-lg': '22px',
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
};
export default config;