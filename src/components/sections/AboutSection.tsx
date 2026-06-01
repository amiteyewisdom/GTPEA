"use client";

import { motion } from "framer-motion";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { CheckCircle2 } from "lucide-react";

const stats = [
  { value: 50, suffix: "+", label: "Projects Delivered", color: "from-purple-500 to-purple-400" },
  { value: 20, suffix: "+", label: "Technologies Used", color: "from-cyan-500 to-cyan-400" },
  { value: 4, suffix: "+", label: "Years Experience", color: "from-purple-400 to-cyan-500" },
  { value: 100, suffix: "%", label: "Client Satisfaction", color: "from-cyan-400 to-purple-500" },
];

const principles = [
  "Clean, maintainable architecture",
  "Performance-first engineering",
  "Security-aware development",
  "Scalable system design",
  "Fast, iterative delivery",
  "Thorough testing & QA",
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[80px]" />
        <div className="absolute left-0 top-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[60px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left: copy */}
          <div>
            <SectionReveal>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3">
                About Us
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                Engineering Excellence,{" "}
                <span className="gradient-text">Delivered Fast.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Team Suffix is a tight-knit software engineering team passionate about building
                high-quality digital products. We combine deep technical expertise with product
                thinking to deliver solutions that{" "}
                <span className="text-white font-medium">actually work in production</span>.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                From scalable microservices to polished frontends, we obsess over clean code,
                architecture, and developer experience. We believe great software is built with
                intention — not just deadlines.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.2}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {principles.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </div>

          {/* Right: stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <SectionReveal key={stat.label} delay={i * 0.1}>
                <motion.div
                  className="glass glass-hover rounded-2xl p-6 text-center relative overflow-hidden"
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-[0.03] pointer-events-none`} />
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
