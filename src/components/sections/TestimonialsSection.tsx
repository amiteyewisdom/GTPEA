"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "CTO at NexaCloud",
    avatar: "https://avatars.githubusercontent.com/u/1?v=4",
    rating: 5,
    text: "Team Suffix rebuilt our entire platform from scratch in under 3 months. The code quality was exceptional — clean, well-tested, and genuinely scalable. They felt like part of our team from day one.",
    company: "NexaCloud",
    project: "Platform Rebuild",
  },
  {
    name: "Sarah Kim",
    role: "Founder at Luminary",
    avatar: "https://avatars.githubusercontent.com/u/2?v=4",
    rating: 5,
    text: "We hired Team Suffix for our MVP and they delivered a product that exceeded our expectations. The attention to detail in both the UI and backend architecture was remarkable. Highly recommend.",
    company: "Luminary",
    project: "MVP Development",
  },
  {
    name: "Marcus Chen",
    role: "Product Lead at DataBridge",
    avatar: "https://avatars.githubusercontent.com/u/3?v=4",
    rating: 5,
    text: "The AI integration work they did for our analytics pipeline was outstanding. They understood our data model quickly and built something we could actually maintain. Communication was 10/10.",
    company: "DataBridge",
    project: "AI Pipeline",
  },
  {
    name: "Priya Patel",
    role: "CEO at ShopSphere",
    avatar: "https://avatars.githubusercontent.com/u/4?v=4",
    rating: 5,
    text: "From design to deployment, Team Suffix was professional throughout. Our e-commerce platform handles 50k+ users daily without breaking a sweat. Best engineering decision we made.",
    company: "ShopSphere",
    project: "E-commerce Platform",
  },
  {
    name: "David Walsh",
    role: "Engineering Manager at FlowOps",
    avatar: "https://avatars.githubusercontent.com/u/5?v=4",
    rating: 5,
    text: "Incredible team. They built our DevOps automation suite on time, under budget, and with zero technical debt. We've been running flawlessly for 18 months. Extend your engagement with them — you won't regret it.",
    company: "FlowOps",
    project: "DevOps Suite",
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const navigate = (dir: number) => {
    setDirection(dir);
    setActive((prev) => (prev + dir + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Clients{" "}
            <span className="gradient-text">Love</span> Working With Us
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Don&apos;t take our word for it — hear what our clients say.
          </p>
        </SectionReveal>

        {/* Main testimonial */}
        <div className="relative max-w-3xl mx-auto mb-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={{
                enter: (d: number) => ({ x: d * 60, opacity: 0, scale: 0.96 }),
                center: { x: 0, opacity: 1, scale: 1 },
                exit: (d: number) => ({ x: d * -60, opacity: 0, scale: 0.96 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="glass border border-white/10 rounded-3xl p-8 md:p-10 relative"
            >
              {/* Gradient border accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

              <Quote className="w-10 h-10 text-purple-500/30 mb-6" />

              <p className="text-gray-200 text-lg md:text-xl leading-relaxed mb-8 font-light">
                &ldquo;{testimonials[active].text}&rdquo;
              </p>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {testimonials[active].name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{testimonials[active].name}</p>
                    <p className="text-gray-500 text-sm">{testimonials[active].role}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {testimonials[active].project}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-12 w-9 h-9 glass border border-white/10 hover:border-purple-500/30 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-12 w-9 h-9 glass border border-white/10 hover:border-purple-500/30 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); }}
              className={`transition-all duration-300 rounded-full ${
                i === active
                  ? "w-6 h-2 bg-gradient-to-r from-purple-500 to-cyan-500"
                  : "w-2 h-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* Mini cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {testimonials.map((t, i) => (
            <motion.button
              key={t.name}
              onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); }}
              className={`text-left p-3 rounded-xl border transition-all duration-300 ${
                i === active
                  ? "glass border-purple-500/30 bg-purple-500/5"
                  : "border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]"
              }`}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                  {t.name.charAt(0)}
                </div>
                <p className="text-white text-xs font-semibold truncate">{t.name}</p>
              </div>
              <p className="text-gray-600 text-xs truncate">{t.company}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
