"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Play, Code2, Terminal, Sparkles } from "lucide-react";
import { ParticleField } from "@/components/ui/ParticleField";

const floatingCards = [
  {
    icon: Code2,
    title: "Next.js 15",
    subtitle: "App Router",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/20",
    delay: 0,
    position: "top-16 -right-4 md:right-8",
  },
  {
    icon: Terminal,
    title: "TypeScript",
    subtitle: "Strict Mode",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20",
    delay: 0.3,
    position: "bottom-32 -left-4 md:left-8",
  },
  {
    icon: Sparkles,
    title: "AI Ready",
    subtitle: "LLM Integrated",
    color: "from-purple-500/20 to-cyan-500/10",
    border: "border-purple-400/20",
    delay: 0.6,
    position: "top-1/2 -right-6 md:right-0",
  },
];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[500px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-800/10 rounded-full blur-[80px]" />
      </div>

      <ParticleField />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 text-center"
        style={{ y, opacity }}
      >
        {/* Top badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/20 text-sm text-purple-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Available for new projects
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-white block">We Build</span>
          <span className="block gradient-text text-glow-purple">
            Scalable Digital
          </span>
          <span className="text-white block">Experiences.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Team Suffix is a modern software engineering collective focused on{" "}
          <span className="text-gray-200">web apps</span>,{" "}
          <span className="text-gray-200">backend systems</span>,{" "}
          <span className="text-gray-200">automation</span>,{" "}
          <span className="text-gray-200">AI tools</span>, and{" "}
          <span className="text-gray-200">product engineering</span>.
          We ship products that scale.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.a
            href="mailto:teamsuffixdev@gmail.com?subject=Project%20Inquiry%20-%20Let%27s%20Work%20Together&body=Hi%20Team%20Suffix%2C%0A%0AI%27d%20love%20to%20discuss%20a%20project%20with%20you.%0A%0AProject%20details%3A%0A%0AName%3A%20%0AEmail%3A%20%0AProject%20Type%3A%20%0ADescription%3A%20"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>Work With Us</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.a>

          <motion.button
            onClick={() => {
              document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass border border-white/10 hover:border-purple-500/40 text-gray-300 hover:text-white font-semibold text-sm transition-all duration-300"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <Play className="w-4 h-4 text-purple-400" />
            <span>View Projects</span>
          </motion.button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[
            { number: "50+", label: "Projects Delivered" },
            { number: "20+", label: "Technologies" },
            { number: "100%", label: "Client Satisfaction" },
            { number: "4+", label: "Years Experience" },
          ].map(({ number, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-bold text-white">{number}</span>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating UI cards */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {floatingCards.map(({ icon: Icon, title, subtitle, color, border, delay, position }) => (
          <motion.div
            key={title}
            className={`absolute ${position} glass border ${border} rounded-2xl p-4 w-44`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.8, duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} border ${border} flex items-center justify-center mb-2.5`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-white text-sm font-semibold">{title}</p>
              <p className="text-gray-500 text-xs">{subtitle}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-purple-500/50 to-transparent"
          animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
