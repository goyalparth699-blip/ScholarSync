"use client";

import { motion } from "framer-motion";
import {
  GraduationCap, Sparkles, BookOpen, BarChart2, BrainCircuit,
  Target, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";

const STEPS = [
  {
    n: "01", icon: Sparkles, color: "#7C6CFF",
    title: "Predict Your Score",
    desc: "Enter your study habits — hours per day, attendance, sleep, screen time, and environment factors. Our AI model predicts your likely exam score instantly.",
  },
  {
    n: "02", icon: BookOpen, color: "#4DA3FF",
    title: "Log Daily Sessions",
    desc: "Track each study session with mood, focus level, subjects, and sleep. Your journal builds a picture of your habits over time.",
  },
  {
    n: "03", icon: BarChart2, color: "#10B981",
    title: "Analyse Your Trends",
    desc: "Visual charts show your study consistency, sleep patterns, productivity scores, and which subjects get the most attention.",
  },
  {
    n: "04", icon: BrainCircuit, color: "#F59E0B",
    title: "Act on AI Insights",
    desc: "Personalised observations flag burnout risk, celebrate streaks, and surface the one change most likely to boost your score.",
  },
];

const FEATURES = [
  { label: "AI Score Prediction",     desc: "Instant predicted exam score based on 13 lifestyle and study factors." },
  { label: "Daily Study Journal",     desc: "Log mood, study hours, sleep, focus, screen time, and subjects each day." },
  { label: "Performance Charts",      desc: "14-day trend charts for study hours, sleep, productivity, and subjects." },
  { label: "AI Insights Engine",      desc: "Automatically generated insights — achievements, warnings, tips, and forecasts." },
  { label: "Goal Tracking",           desc: "Set target score, daily study goal, sleep target, and attendance goal." },
  { label: "Study Streak Counter",    desc: "Tracks consecutive days logged to build consistency." },
  { label: "Downloadable Reports",    desc: "Export a personalised prediction report with AI insight included." },
  { label: "Offline-first Storage",   desc: "All logs and profile data stored locally — no cloud sync required." },
];

const FAQ = [
  {
    q: "How accurate is the score prediction?",
    a: "The model is trained on thousands of student records and achieves high accuracy. Think of it as a directional estimate — the stronger your habits, the closer it aligns with reality. It's best used as a planning tool, not a guarantee.",
  },
  {
    q: "What factors matter most for my score?",
    a: "Study hours, attendance, and previous scores have the strongest influence. Sleep quality and screen time are secondary but still meaningful — even 1 extra hour of sleep can shift your predicted score by several points.",
  },
  {
    q: "Does my data get sent anywhere?",
    a: "No. All study logs, profile settings, and prediction history are stored only in your browser's localStorage. Nothing is sent to any external server except the prediction calculation itself.",
  },
  {
    q: "How do I get the most useful AI insights?",
    a: "Log at least 7 consecutive days. The AI compares your recent week to the previous one to detect trends in productivity, sleep, and study consistency. More data = more specific insights.",
  },
  {
    q: "Can I use this without creating an account?",
    a: "Yes. Enter any email and a password of 6+ characters to enter demo mode. Your data is saved locally regardless of login status.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3 hover:bg-white/[0.02] transition-colors">
        <span className="text-sm font-medium text-text-primary">{q}</span>
        {open ? <ChevronUp size={14} className="text-text-muted shrink-0" /> : <ChevronDown size={14} className="text-text-muted shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-white/[0.05]">
          <p className="text-xs text-text-secondary leading-relaxed mt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="page-container">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center shadow-accent">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary leading-none">ScholarSync</h1>
            <p className="text-xs text-text-muted mt-0.5">AI-powered student productivity platform</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          ScholarSync helps students understand their academic trajectory, build better habits, and act on
          personalised AI insights — all in one clean, focused app. No spreadsheets. No guesswork.
        </p>
      </motion.div>

      {/* How it works */}
      <div className="mb-10">
        <p className="section-title mb-4">How It Works</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}28` }}>
                  <s.icon size={15} style={{ color: s.color }} />
                </div>
                <span className="text-[10px] font-bold font-mono text-text-muted">{s.n}</span>
              </div>
              <p className="text-sm font-semibold text-text-primary mb-2">{s.title}</p>
              <p className="text-xs text-text-muted leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Features */}
        <div>
          <p className="section-title mb-4">Features</p>
          <div className="glass overflow-hidden divide-y divide-white/[0.04]">
            {FEATURES.map((f, i) => (
              <motion.div key={f.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="px-4 py-3 flex gap-3 items-start hover:bg-white/[0.02] transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-text-primary">{f.label}</p>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* What the AI looks at */}
        <div>
          <p className="section-title mb-4">What the AI Considers</p>
          <div className="glass p-5 space-y-3">
            {[
              { label: "Study Hours / Day",        impact: "Very High", color: "#10B981" },
              { label: "Attendance Rate",           impact: "Very High", color: "#10B981" },
              { label: "Previous Exam Score",       impact: "High",      color: "#7C6CFF" },
              { label: "Sleep Hours",               impact: "Medium",    color: "#4DA3FF" },
              { label: "Screen Time",               impact: "Medium",    color: "#F59E0B" },
              { label: "Tutoring Sessions",         impact: "Medium",    color: "#4DA3FF" },
              { label: "Motivation Level",          impact: "Medium",    color: "#7C6CFF" },
              { label: "Physical Activity",         impact: "Low",       color: "#9CA3AF" },
              { label: "Family Support",            impact: "Low",       color: "#9CA3AF" },
              { label: "Teacher Quality",           impact: "Low",       color: "#9CA3AF" },
              { label: "Internet Access",           impact: "Low",       color: "#9CA3AF" },
              { label: "Extracurricular Activities",impact: "Low",       color: "#9CA3AF" },
              { label: "Parent Education Level",    impact: "Low",       color: "#9CA3AF" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Target size={10} style={{ color: r.color }} className="shrink-0" />
                  <span className="text-xs text-text-secondary truncate">{r.label}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2"
                  style={{ background: `${r.color}18`, color: r.color }}>{r.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <p className="section-title mb-4">FAQ</p>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 + i * 0.05 }}>
              <FAQItem q={item.q} a={item.a} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="mt-10 pt-6 border-t border-white/[0.06]">
        <p className="text-xs text-text-muted text-center">
          ScholarSync — built to help students study smarter, not just harder.
        </p>
      </motion.div>
    </div>
  );
}
