"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "purple" | "cyan" | "none";
  gradient?: boolean;
}

export function Card({ children, className, hover = true, glow = "none", gradient = false }: CardProps) {
  return (
    <motion.div
      className={cn(
        "glass rounded-2xl p-6 relative",
        hover && "glass-hover transition-all duration-300 cursor-default",
        glow === "purple" && "glow-purple",
        glow === "cyan" && "glow-cyan",
        gradient && "gradient-border",
        className
      )}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
