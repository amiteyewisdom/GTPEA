"use client";

import { motion } from "framer-motion";

const particles = [
  { left: "8%", top: "18%", delay: 0, size: 8 },
  { left: "18%", top: "72%", delay: 1, size: 6 },
  { left: "34%", top: "28%", delay: 0.6, size: 10 },
  { left: "52%", top: "68%", delay: 1.5, size: 7 },
  { left: "70%", top: "24%", delay: 0.2, size: 12 },
  { left: "82%", top: "58%", delay: 1.2, size: 9 },
  { left: "90%", top: "16%", delay: 0.8, size: 5 },
  { left: "60%", top: "82%", delay: 0.4, size: 6 },
];

export function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-white/60 blur-[1px]"
          style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
          animate={{
            y: [0, -16, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5 + index * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}