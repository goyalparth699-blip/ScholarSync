"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label:    string;
  value:    string | number;
  icon:     LucideIcon;
  sub?:     string;
  accent?:  string;
  delay?:   number;
}

export function StatCard({ label, value, icon: Icon, sub, accent = "#7C6CFF", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="surface p-4 flex items-start gap-3 hover:border-white/[0.12] transition-colors duration-200"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}30` }}
      >
        <Icon size={15} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted leading-none mb-1.5">{label}</p>
        <p className="text-xl font-bold text-text-primary leading-none">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-1 leading-none">{sub}</p>}
      </div>
    </motion.div>
  );
}
