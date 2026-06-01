"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", glow = false, className, children, ...props }, ref) => {
    const base =
      "relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 cursor-pointer select-none overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712]";

    const variants = {
      primary:
        "bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:from-purple-500 hover:to-cyan-400 shadow-lg hover:shadow-purple-500/30",
      secondary:
        "bg-[#161b22] text-white border border-white/10 hover:border-purple-500/50 hover:bg-[#1c2128]",
      ghost:
        "text-gray-400 hover:text-white hover:bg-white/5",
      outline:
        "border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 hover:text-purple-300",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          glow && "glow-purple",
          className
        )}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {variant === "primary" && (
          <span
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"
            aria-hidden="true"
          />
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export { Button };
