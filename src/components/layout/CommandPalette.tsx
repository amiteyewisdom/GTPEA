"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Command, ExternalLink, Mail, Rocket, X } from "lucide-react";

type CommandItem = {
  title: string;
  subtitle: string;
  action: () => void;
  icon: React.ComponentType<{ className?: string }>;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        title: "Jump to Projects",
        subtitle: "Scroll to featured work",
        action: () => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" }),
        icon: Rocket,
      },
      {
        title: "Open Contact Email",
        subtitle: "Prefill project inquiry",
        action: () => {
          window.location.href =
            "mailto:teamsuffixdev@gmail.com?subject=Project%20Inquiry&body=Hi%20Team%20Suffix%2C%0A%0AI%27d%20like%20to%20discuss%20a%20project.";
        },
        icon: Mail,
      },
      {
        title: "Visit GitHub",
        subtitle: "View code and contributions",
        action: () => window.open("https://github.com/teamsuffix", "_blank", "noopener,noreferrer"),
        icon: ExternalLink,
      },
    ],
    []
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isMetaK) {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all text-sm"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Open command palette"
      >
        <Command className="w-4 h-4" />
        <span>Cmd K</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="w-full max-w-xl glass border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/40"
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div>
                  <p className="text-white font-semibold text-sm">Quick Actions</p>
                  <p className="text-gray-500 text-xs">Navigate faster with Team Suffix shortcuts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Close command palette"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                {commands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.title}
                      type="button"
                      onClick={() => {
                        command.action();
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{command.title}</p>
                        <p className="text-gray-500 text-xs">{command.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}