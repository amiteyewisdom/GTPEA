"use client";

import { motion } from "framer-motion";
import { SectionReveal } from "@/components/ui/SectionReveal";
import {
  Layers,
  Palette,
  Server,
  Puzzle,
  Brain,
  Cloud,
  Cpu,
  Smartphone,
} from "lucide-react";

const services = [
  {
    icon: Layers,
    title: "Full Stack Development",
    description:
      "End-to-end web applications built with Next.js, React, and robust backend systems. From ideation to production.",
    tags: ["Next.js", "React", "Node.js"],
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    iconColor: "text-purple-400",
    border: "hover:border-purple-500/40",
  },
  {
    icon: Palette,
    title: "UI/UX Engineering",
    description:
      "Pixel-perfect interfaces with smooth animations, accessibility, and design systems that scale with your product.",
    tags: ["Figma", "Tailwind", "Framer Motion"],
    gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    iconColor: "text-cyan-400",
    border: "hover:border-cyan-500/40",
  },
  {
    icon: Server,
    title: "Backend Systems",
    description:
      "Scalable, performant backend architectures with clean APIs, database design, and real-time capabilities.",
    tags: ["Node.js", "PostgreSQL", "Redis"],
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    iconColor: "text-blue-400",
    border: "hover:border-blue-500/40",
  },
  {
    icon: Puzzle,
    title: "API Development",
    description:
      "RESTful and GraphQL APIs designed for reliability, security, and developer experience. Well-documented and versioned.",
    tags: ["REST", "GraphQL", "OpenAPI"],
    gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
    iconColor: "text-indigo-400",
    border: "hover:border-indigo-500/40",
  },
  {
    icon: Brain,
    title: "AI Integrations",
    description:
      "Integrate cutting-edge AI/ML capabilities — LLMs, computer vision, NLP — into your product seamlessly.",
    tags: ["OpenAI", "LangChain", "Python"],
    gradient: "from-pink-500/20 via-pink-500/5 to-transparent",
    iconColor: "text-pink-400",
    border: "hover:border-pink-500/40",
  },
  {
    icon: Cloud,
    title: "DevOps & Cloud",
    description:
      "CI/CD pipelines, containerization, and cloud infrastructure on AWS, GCP, or Azure. Zero-downtime deployments.",
    tags: ["Docker", "AWS", "GitHub Actions"],
    gradient: "from-orange-500/20 via-orange-500/5 to-transparent",
    iconColor: "text-orange-400",
    border: "hover:border-orange-500/40",
  },
  {
    icon: Cpu,
    title: "Automation Tools",
    description:
      "Custom automation scripts, bots, and workflow tools that eliminate repetitive tasks and boost productivity.",
    tags: ["Python", "Puppeteer", "n8n"],
    gradient: "from-green-500/20 via-green-500/5 to-transparent",
    iconColor: "text-green-400",
    border: "hover:border-green-500/40",
  },
  {
    icon: Smartphone,
    title: "Mobile-Responsive Apps",
    description:
      "Progressive web apps and responsive designs that deliver native-like experiences across all devices.",
    tags: ["React Native", "PWA", "Responsive"],
    gradient: "from-teal-500/20 via-teal-500/5 to-transparent",
    iconColor: "text-teal-400",
    border: "hover:border-teal-500/40",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3">
            What We Do
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Services Built for{" "}
            <span className="gradient-text">Scale</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            From a landing page to a complex SaaS platform — we handle every layer of the stack
            with the same level of craft and care.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <SectionReveal key={service.title} delay={i * 0.06}>
                <motion.div
                  className={`group glass border border-white/[0.07] ${service.border} rounded-2xl p-6 h-full relative overflow-hidden transition-all duration-300 cursor-default`}
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* BG gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                  <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-current flex items-center justify-center mb-4 transition-all duration-300 ${service.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-white font-bold text-base mb-2 leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
