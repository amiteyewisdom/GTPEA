"use client";

import { motion } from "framer-motion";
import { SectionReveal } from "@/components/ui/SectionReveal";

const technologies = [
  { name: "Next.js", category: "Framework", icon: "▲", color: "text-white" },
  { name: "React", category: "UI Library", icon: "⚛", color: "text-cyan-400" },
  { name: "Node.js", category: "Runtime", icon: "⬡", color: "text-green-400" },
  { name: "TypeScript", category: "Language", icon: "TS", color: "text-blue-400" },
  { name: "Python", category: "Backend/AI", icon: "🐍", color: "text-yellow-400" },
  { name: "Docker", category: "DevOps", icon: "🐳", color: "text-blue-500" },
  { name: "PostgreSQL", category: "Database", icon: "🐘", color: "text-indigo-400" },
  { name: "AWS", category: "Cloud", icon: "☁", color: "text-orange-400" },
  { name: "Tailwind", category: "Styling", icon: "🌊", color: "text-cyan-300" },
  { name: "GraphQL", category: "API", icon: "◈", color: "text-pink-400" },
  { name: "Redis", category: "Cache", icon: "◆", color: "text-red-400" },
  { name: "Prisma", category: "ORM", icon: "▲", color: "text-teal-400" },
];

export function TechStackSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Divider gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3">
            Our Stack
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Technologies We Master
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
            We work with battle-tested tools and cutting-edge technologies to build production-grade systems.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {technologies.map((tech, i) => (
            <SectionReveal key={tech.name} delay={i * 0.04}>
              <motion.div
                className="group glass glass-hover rounded-2xl p-4 flex flex-col items-center gap-2 text-center cursor-default h-full"
                whileHover={{ y: -6, scale: 1.03 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:border-purple-500/30 flex items-center justify-center transition-all duration-300 text-xl">
                  <span className={tech.color}>{tech.icon}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{tech.name}</p>
                  <p className="text-gray-500 text-xs">{tech.category}</p>
                </div>

                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </section>
  );
}
