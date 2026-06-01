"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { ExternalLink, Github } from "lucide-react";
import { useRef } from "react";

const projects = [
  {
    title: "NexaFlow",
    description:
      "AI-powered workflow automation platform that connects 100+ services and eliminates manual data entry for enterprise teams.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    tags: ["Next.js", "Python", "OpenAI", "PostgreSQL", "Docker"],
    category: "AI Platform",
    accent: "from-purple-500 to-pink-500",
    live: "#",
    github: "#",
  },
  {
    title: "CloudVault",
    description:
      "Secure, end-to-end encrypted file storage with real-time collaboration, versioning, and granular access controls.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
    tags: ["React", "Node.js", "AWS S3", "Redis", "TypeScript"],
    category: "SaaS Product",
    accent: "from-cyan-500 to-blue-500",
    live: "#",
    github: "#",
  },
  {
    title: "PulseMetrics",
    description:
      "Real-time analytics dashboard for e-commerce businesses with custom KPI tracking, forecasting, and automated reports.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    tags: ["Next.js", "GraphQL", "D3.js", "PostgreSQL", "Redis"],
    category: "Analytics",
    accent: "from-orange-500 to-red-500",
    live: "#",
    github: "#",
  },
  {
    title: "DevPilot",
    description:
      "Developer productivity suite with AI code review, automated PR summaries, and team velocity tracking.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    tags: ["TypeScript", "OpenAI", "GitHub API", "Next.js"],
    category: "Dev Tools",
    accent: "from-green-500 to-teal-500",
    live: "#",
    github: "#",
  },
];

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-150, 150], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <SectionReveal delay={index * 0.1}>
      <motion.div
        ref={cardRef}
        className="group glass border border-white/[0.07] hover:border-white/15 rounded-2xl overflow-hidden cursor-default"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <motion.img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r ${project.accent} text-white text-xs font-semibold shadow-lg`}>
            {project.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-6" style={{ transform: "translateZ(10px)" }}>
          <h3 className="text-white text-xl font-bold mb-2">{project.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">{project.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.a
              href={project.live}
              className={`flex-1 text-center text-xs font-semibold py-2.5 rounded-xl bg-gradient-to-r ${project.accent} text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Demo
            </motion.a>
            <motion.a
              href={project.github}
              className="px-4 py-2.5 rounded-xl glass border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Github className="w-3.5 h-3.5" />
              Code
            </motion.a>
          </div>
        </div>
      </motion.div>
    </SectionReveal>
  );
}

export function ProjectsSection() {
  return (
    <section id="projects" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 bottom-0 w-[500px] h-[400px] bg-cyan-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3">
            Our Work
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Featured{" "}
            <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            A selection of products we&apos;ve built — from zero to production, with craft at every layer.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>

        <SectionReveal className="text-center mt-12" delay={0.3}>
          <motion.a
            href="mailto:teamsuffixdev@gmail.com?subject=Request%20Full%20Portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-purple-500/30 text-purple-400 hover:text-white hover:border-purple-500/60 hover:bg-purple-500/10 transition-all duration-300 text-sm font-semibold"
            whileHover={{ scale: 1.03, y: -1 }}
          >
            Request Full Portfolio
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </SectionReveal>
      </div>
    </section>
  );
}
