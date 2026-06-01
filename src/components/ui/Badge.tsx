"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "purple" | "cyan" | "gray" | "green";
}

export function Badge({ children, className, variant = "purple" }: BadgeProps) {
  const variants = {
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    gray: "bg-white/5 text-gray-400 border-white/10",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
