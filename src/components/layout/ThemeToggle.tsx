"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MoonStar, SunMedium } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"midnight" | "aurora">("midnight");

  useEffect(() => {
    const saved = window.localStorage.getItem("team-suffix-theme");
    const nextTheme = saved === "aurora" ? "aurora" : "midnight";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme === "aurora" ? "aurora" : "midnight";
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "midnight" ? "aurora" : "midnight";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme === "aurora" ? "aurora" : "midnight";
    window.localStorage.setItem("team-suffix-theme", nextTheme);
  };

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/30 transition-all text-sm"
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      aria-label="Toggle theme"
    >
      {theme === "midnight" ? <MoonStar className="w-4 h-4" /> : <SunMedium className="w-4 h-4" />}
      <span>{theme === "midnight" ? "Midnight" : "Aurora"}</span>
    </motion.button>
  );
}