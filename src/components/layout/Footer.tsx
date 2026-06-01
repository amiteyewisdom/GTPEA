"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Zap, Mail, MapPin } from "lucide-react";

const footerLinks = {
  services: [
    { label: "Full Stack Dev", href: "#services" },
    { label: "UI/UX Engineering", href: "#services" },
    { label: "Backend Systems", href: "#services" },
    { label: "AI Integrations", href: "#services" },
    { label: "DevOps & Cloud", href: "#services" },
  ],
  company: [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Process", href: "#process" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ],
};

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/teamsuffix",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/teamsuffix",
    icon: Linkedin,
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com/teamsuffix",
    icon: Twitter,
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#030712]">
      {/* Subtle gradient top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-purple-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg" />
                <Zap className="absolute inset-0 m-auto w-4 h-4 text-white z-10" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                <span className="text-white">Team</span>
                <span className="gradient-text"> Suffix</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Building scalable digital experiences with precision, speed, and craftsmanship.
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Mail className="w-4 h-4" />
              <a
                href="mailto:teamsuffixdev@gmail.com"
                className="hover:text-purple-400 transition-colors"
              >
                teamsuffixdev@gmail.com
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Services
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Connect
            </h3>
            <div className="flex flex-col gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-500 hover:text-white group transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {label}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.06] gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Team Suffix. All rights reserved.
          </p>
          <motion.p
            className="text-gray-600 text-sm flex items-center gap-1"
            whileHover={{ color: "#a855f7" }}
          >
            Built with{" "}
            <span className="text-purple-500">♥</span>{" "}
            by{" "}
            <span className="text-gray-400 font-medium">Team Suffix</span>
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
