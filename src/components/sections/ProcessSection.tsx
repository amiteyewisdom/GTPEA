"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { Search, Pen, Code2, TestTube, Rocket, HeartHandshake } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discovery",
    description:
      "Deep-dive into your goals, constraints, and users. We map requirements, define success metrics, and align on scope before writing a single line of code.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glow: "rgba(168, 85, 247, 0.2)",
  },
  {
    number: "02",
    icon: Pen,
    title: "Design",
    description:
      "Wireframes, system architecture, and UI design. We prototype fast and iterate based on feedback — ensuring we build the right thing, not just anything.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "rgba(34, 211, 238, 0.2)",
  },
  {
    number: "03",
    icon: Code2,
    title: "Development",
    description:
      "Agile sprints with weekly demos. Clean, typed, tested code. We follow best practices and communicate transparently throughout.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "rgba(96, 165, 250, 0.2)",
  },
  {
    number: "04",
    icon: TestTube,
    title: "Testing",
    description:
      "Comprehensive QA — unit tests, integration tests, performance benchmarks, and real-device testing before anything ships to users.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    glow: "rgba(74, 222, 128, 0.2)",
  },
  {
    number: "05",
    icon: Rocket,
    title: "Deployment",
    description:
      "Zero-downtime deployments via CI/CD. Monitoring, error tracking, and observability configured from day one.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "rgba(251, 146, 60, 0.2)",
  },
  {
    number: "06",
    icon: HeartHandshake,
    title: "Support",
    description:
      "We don't disappear after launch. Ongoing maintenance, feature iterations, performance monitoring, and rapid incident response.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    glow: "rgba(244, 114, 182, 0.2)",
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      className="relative"
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={`glass border ${step.border} rounded-2xl p-6 relative overflow-hidden group hover:border-opacity-60 transition-all duration-300`}
        whileHover={{ y: -4, scale: 1.01 }}
        style={{ "--glow": step.glow } as React.CSSProperties}
      >
        {/* Hover glow */}
        <div className={`absolute inset-0 ${step.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl`} />

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-3">
            <div className={`w-10 h-10 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${step.color}`} />
            </div>
            <div>
              <span className={`text-xs font-bold ${step.color} tracking-wider`}>
                STEP {step.number}
              </span>
              <h3 className="text-white font-bold text-lg leading-tight">{step.title}</h3>
            </div>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed pl-14">{step.description}</p>
        </div>
      </motion.div>

      {/* Connector line for desktop */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full h-4 w-px bg-gradient-to-b from-white/10 to-transparent" />
      )}
    </motion.div>
  );
}

export function ProcessSection() {
  return (
    <section id="process" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3">
            How We Work
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Our{" "}
            <span className="gradient-text">Process</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            A transparent, agile workflow designed to deliver quality results on time — every time.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
