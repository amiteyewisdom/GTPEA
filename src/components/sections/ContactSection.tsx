"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { Send, Github, Linkedin, Twitter, Mail, MessageSquare, CheckCircle2 } from "lucide-react";

const projectTypes = [
  "Full Stack App",
  "Backend API",
  "AI Integration",
  "UI/UX Design",
  "Mobile App",
  "DevOps Setup",
  "Automation Tool",
  "Consulting",
  "Other",
];

const socials = [
  { label: "GitHub", href: "https://github.com/teamsuffix", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/company/teamsuffix", icon: Linkedin },
  { label: "X / Twitter", href: "https://twitter.com/teamsuffix", icon: Twitter },
];

export function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    projectType: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Project Inquiry: ${form.projectType || "General"} — ${form.name}`
    );
    const body = encodeURIComponent(
      `Hi Team Suffix,\n\nI'd love to discuss a project with you.\n\nName: ${form.name}\nEmail: ${form.email}\nProject Type: ${form.projectType}\n\nMessage:\n${form.message}\n\nLooking forward to hearing from you!`
    );
    window.location.href = `mailto:teamsuffixdev@gmail.com?subject=${subject}&body=${body}`;
  };

  const inputClass =
    "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all duration-200";

  return (
    <section id="contact" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3">
            Get In Touch
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Ready to Build{" "}
            <span className="gradient-text">Something Great?</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Tell us about your project and we&apos;ll get back to you within 24 hours.
            No fluff, no sales calls — just a direct conversation.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Form */}
          <SectionReveal className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="glass border border-white/[0.07] rounded-3xl p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Your Name <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Alex Johnson"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Email Address <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="alex@company.com"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Project Type
                </label>
                <select
                  name="projectType"
                  value={form.projectType}
                  onChange={handleChange}
                  className={`${inputClass} cursor-pointer appearance-none`}
                >
                  <option value="" className="bg-[#0d1117]">Select project type...</option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type} className="bg-[#0d1117]">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Message <span className="text-purple-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project — goals, timeline, budget, and any technical requirements..."
                  required
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <motion.button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-4 h-4" />
                Send Message via Email
              </motion.button>

              <p className="text-center text-gray-600 text-xs">
                This will open your email client with the form pre-filled.
              </p>
            </form>
          </SectionReveal>

          {/* Info panel */}
          <SectionReveal className="lg:col-span-2" delay={0.15}>
            <div className="flex flex-col gap-5 h-full">
              {/* Direct contact */}
              <div className="glass border border-white/[0.07] rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 text-sm">Direct Contact</h3>
                <a
                  href="mailto:teamsuffixdev@gmail.com"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                    <Mail className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email us at</p>
                    <p className="text-white text-sm font-medium group-hover:text-purple-400 transition-colors">
                      teamsuffixdev@gmail.com
                    </p>
                  </div>
                </a>
              </div>

              {/* Why choose us */}
              <div className="glass border border-white/[0.07] rounded-2xl p-6 flex-1">
                <h3 className="text-white font-bold mb-4 text-sm">Why Team Suffix?</h3>
                <ul className="space-y-3">
                  {[
                    "24h response time",
                    "Free initial consultation",
                    "Transparent pricing",
                    "Weekly progress updates",
                    "Post-launch support",
                    "NDA available",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social links */}
              <div className="glass border border-white/[0.07] rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 text-sm">Follow Us</h3>
                <div className="flex items-center gap-3">
                  {socials.map(({ label, href, icon: Icon }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl glass border border-white/10 hover:border-purple-500/30 flex items-center justify-center text-gray-500 hover:text-white transition-all"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={label}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
