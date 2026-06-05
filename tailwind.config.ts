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
        // Brand Colors
        'brand-primary': '#041633',
        'brand-sidebar': '#081C3C',
        'brand-accent': '#D4AF37',
        'brand-success': '#34D16F',
        'brand-warning': '#F59E0B',
        'brand-danger': '#DC2626',
        'brand-text': '#FFFFFF',
        'brand-text-secondary': 'rgba(255,255,255,0.70)',
        'brand-card-bg': 'rgba(255,255,255,0.08)',
        'brand-card-border': 'rgba(212,175,55,0.15)',
        'brand-hover': 'rgba(212,175,55,0.12)',
        
        // Legacy colors for compatibility
        'gtpea-navy': '#041633',
        'gtpea-gold': '#D4AF37',
        'gtpea-green': '#2D7A4D',
        'gtpea-dark-green': '#1E5A36',
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